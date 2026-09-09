import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestDetection, setLatestDetection] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Synthesize Tactical Alert Audio via Web Audio API (Reliable & No external file dependency)
  const playAlertSound = useCallback((severity = 'HIGH') => {
    if (!audioEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const freq = severity === 'CRITICAL' ? 880 : 587;
      osc.type = severity === 'CRITICAL' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  }, [audioEnabled]);

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;

    const connectWs = () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      let wsUrl = '';
      if (backendUrl.startsWith('https://')) {
        wsUrl = backendUrl.replace('https://', 'wss://') + '/api/ws/telemetry';
      } else if (backendUrl.startsWith('http://')) {
        wsUrl = backendUrl.replace('http://', 'ws://') + '/api/ws/telemetry';
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/api/ws/telemetry`;
      }

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
          console.log('[Sentinel Telemetry] WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'AI_DETECTION_EVENT') {
              if (data.detection) {
                setLatestDetection(data.detection);
                setRecentDetections(prev => [data.detection, ...prev.slice(0, 19)]);
              }
              if (data.alert) {
                setUnreadAlertsCount(prev => prev + 1);
                playAlertSound(data.alert.severity);
                toast.error(
                  `ALERT: ${data.alert.alert_type} on ${data.alert.camera_name}`,
                  {
                    description: `Subject: ${data.alert.subject_name} | Confidence: ${Math.round(data.alert.confidence * 100)}%`,
                    duration: 6000
                  }
                );
              }
            }
          } catch (err) {
            console.error('WS parse error', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3500);
        };

        ws.onerror = (e) => {
          console.warn('WS error', e);
          ws.close();
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 5000);
      }
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [playAlertSound]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        latestDetection,
        recentDetections,
        unreadAlertsCount,
        setUnreadAlertsCount,
        audioEnabled,
        setAudioEnabled,
        playAlertSound
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
