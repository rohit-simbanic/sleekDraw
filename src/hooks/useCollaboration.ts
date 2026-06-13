import { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CanvasElement, AppState, PeerCursor } from '../types';
import { generateEncryptionKey, encryptData, decryptData } from '../utils/crypto';
import { BACKEND_URL } from '../constants';

interface UseCollaborationProps {
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setHistory: React.Dispatch<React.SetStateAction<CanvasElement[][]>>;
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const useCollaboration = ({
  setElements,
  appState,
  setAppState,
  setHistory,
  setHistoryIndex
}: UseCollaborationProps) => {
  const [collabConnected, setCollabConnected] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [username, setUsername] = useState(`User-${Math.floor(Math.random() * 900) + 100}`);
  const [peerCursors, setPeerCursors] = useState<PeerCursor[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const encryptionKeyRef = useRef<string | null>(null);
  const isReceivingSyncRef = useRef<boolean>(false);

  // E2EE Broadcast Helper
  const broadcastState = async (elementsToBroadcast: CanvasElement[], canvasBgToBroadcast?: string) => {
    if (!socketRef.current || !roomIdRef.current || !encryptionKeyRef.current) return;
    try {
      const filtered = elementsToBroadcast.filter(e => !e.isDeleted);
      const encryptedElements = await encryptData(encryptionKeyRef.current, JSON.stringify(filtered));
      const bg = canvasBgToBroadcast !== undefined ? canvasBgToBroadcast : appState.canvasBackgroundColor;
      const encryptedAppState = await encryptData(encryptionKeyRef.current, JSON.stringify({ canvasBackgroundColor: bg }));
      socketRef.current.emit('update-state', {
        roomId: roomIdRef.current,
        encryptedElements,
        encryptedAppState
      });
    } catch (err) {
      console.error('Failed to encrypt/broadcast state:', err);
    }
  };

  // E2EE Collaboration Setup
  const joinCollaborativeRoom = useCallback(async (roomId: string, key: string) => {
    roomIdRef.current = roomId;
    encryptionKeyRef.current = key;

    // Disconnect previous socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setCollabConnected(true);
      setAppState(prev => ({ ...prev, collaborativeRoomId: roomId }));
      socket.emit('join-room', { roomId });
    });

    socket.on('disconnect', () => {
      setCollabConnected(false);
    });

    // Handle initial state load
    socket.on('init-state', async ({ encryptedElements, encryptedAppState }) => {
      if (!encryptedElements || !encryptionKeyRef.current) return;
      try {
        isReceivingSyncRef.current = true;
        const decryptedStr = await decryptData(encryptionKeyRef.current, encryptedElements);
        const parsed = JSON.parse(decryptedStr);
        setElements(parsed);
        setHistory([parsed]);
        setHistoryIndex(0);

        if (encryptedAppState) {
          const decryptedAppStateStr = await decryptData(encryptionKeyRef.current, encryptedAppState);
          const parsedAppState = JSON.parse(decryptedAppStateStr);
          if (parsedAppState?.canvasBackgroundColor) {
            setAppState(prev => ({
              ...prev,
              canvasBackgroundColor: parsedAppState.canvasBackgroundColor
            }));
          }
        }
      } catch (err) {
        console.error('Decryption of initial state failed:', err);
      } finally {
        isReceivingSyncRef.current = false;
      }
    });

    // Handle peer state modification
    socket.on('state-changed', async ({ encryptedElements, encryptedAppState }) => {
      if (!encryptedElements || !encryptionKeyRef.current) return;
      try {
        isReceivingSyncRef.current = true;
        const decryptedStr = await decryptData(encryptionKeyRef.current, encryptedElements);
        const parsed = JSON.parse(decryptedStr);
        setElements(parsed);

        if (encryptedAppState) {
          const decryptedAppStateStr = await decryptData(encryptionKeyRef.current, encryptedAppState);
          const parsedAppState = JSON.parse(decryptedAppStateStr);
          if (parsedAppState?.canvasBackgroundColor) {
            setAppState(prev => ({
              ...prev,
              canvasBackgroundColor: parsedAppState.canvasBackgroundColor
            }));
          }
        }
      } catch (err) {
        console.error('Decryption of state update failed:', err);
      } finally {
        isReceivingSyncRef.current = false;
      }
    });

    // Handle peer cursors
    socket.on('peer-cursor', (cursor: PeerCursor) => {
      setPeerCursors(prev => {
        const index = prev.findIndex(c => c.socketId === cursor.socketId);
        if (index > -1) {
          const next = [...prev];
          next[index] = cursor;
          return next;
        }
        return [...prev, cursor];
      });
    });

    socket.on('peer-disconnected', (socketId: string) => {
      setPeerCursors(prev => prev.filter(c => c.socketId !== socketId));
    });

    // Build share link
    const url = `${window.location.origin}${window.location.pathname}#room=${roomId}&key=${key}`;
    setShareUrl(url);
  }, [setCollabConnected, setAppState, setElements, setHistory, setHistoryIndex, setPeerCursors, setShareUrl]);

  const startCollaboration = useCallback(async () => {
    const roomId = Math.random().toString(36).substring(2, 11);
    const key = await generateEncryptionKey();
    window.location.hash = `room=${roomId}&key=${key}`;
    await joinCollaborativeRoom(roomId, key);
    setShowShareModal(true);
  }, [joinCollaborativeRoom]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    collabConnected,
    showShareModal,
    setShowShareModal,
    shareUrl,
    username,
    setUsername,
    peerCursors,
    setPeerCursors,
    socketRef,
    roomIdRef,
    encryptionKeyRef,
    isReceivingSyncRef,
    joinCollaborativeRoom,
    startCollaboration,
    broadcastState
  };
};
