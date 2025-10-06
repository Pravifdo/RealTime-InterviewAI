import { useEffect, useRef, useState } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (socket, roomId, isInitiator) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize local media stream
  const initLocalStream = async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      setError(null);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Camera/Microphone access denied. Please allow permissions.');
      throw err;
    }
  };

  // Create peer connection
  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId,
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      setIsConnected(peerConnection.connectionState === 'connected');
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  // Start call (initiator creates offer)
  const startCall = async () => {
    try {
      const peerConnection = createPeerConnection();
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      console.log('Sending offer');
      socket.emit('offer', { offer, roomId });
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start call');
    }
  };

  // Toggle video track
  const toggleVideo = (enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  };

  // Toggle audio track
  const toggleAudio = (enabled) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  };

  // Cleanup
  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room
    socket.emit('join-room', roomId);

    // Handle user joined (for initiator to start call)
    socket.on('user-joined', (userId) => {
      console.log('User joined:', userId);
      if (isInitiator) {
        startCall();
      }
    });

    // Handle incoming offer (non-initiator)
    socket.on('offer', async (data) => {
      console.log('Received offer');
      try {
        const peerConnection = createPeerConnection();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('answer', { answer, roomId });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    // Handle incoming answer (initiator)
    socket.on('answer', async (data) => {
      console.log('Received answer');
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    // Handle incoming ICE candidate
    socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate');
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    return () => {
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket, roomId, isInitiator]);

  return {
    localStream,
    remoteStream,
    isConnected,
    error,
    initLocalStream,
    toggleVideo,
    toggleAudio,
    cleanup,
  };
};
