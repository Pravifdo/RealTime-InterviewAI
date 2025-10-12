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
  const remoteStreamRef = useRef(null);

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
    console.log('Creating peer connection...');
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      console.log('Adding local tracks to peer connection');
      localStreamRef.current.getTracks().forEach((track) => {
        console.log('Adding track:', track.kind);
        peerConnection.addTrack(track, localStreamRef.current);
      });
    } else {
      console.warn('No local stream available when creating peer connection!');
    }

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      console.log('🎥 Received remote track:', event.track.kind);
      console.log('Track enabled:', event.track.enabled);
      console.log('Track readyState:', event.track.readyState);
      console.log('Track muted:', event.track.muted);
      console.log('Remote streams:', event.streams);
      
      // Always use the stream from the event if available
      if (event.streams && event.streams[0]) {
        console.log('✅ Using remote stream from event.streams[0]');
        const stream = event.streams[0];
        console.log('Stream tracks:', stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted,
          id: t.id
        })));
        
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      } else {
        // Fallback: manually create MediaStream from tracks
        console.warn('⚠️ No streams in event, manually creating MediaStream');
        
        if (!remoteStreamRef.current) {
          console.log('Creating new MediaStream');
          remoteStreamRef.current = new MediaStream();
        }
        
        // Check if track already exists
        const existingTrack = remoteStreamRef.current.getTracks().find(t => t.id === event.track.id);
        if (!existingTrack) {
          console.log('Adding new track to MediaStream:', event.track.kind);
          remoteStreamRef.current.addTrack(event.track);
          
          // Force update by creating a new reference
          const updatedStream = new MediaStream(remoteStreamRef.current.getTracks());
          setRemoteStream(updatedStream);
        } else {
          console.log('Track already exists in stream');
        }
      }
      
      // Add listeners to track to monitor state changes
      event.track.onunmute = () => {
        console.log('🔊 Track unmuted:', event.track.kind);
      };
      
      event.track.onmute = () => {
        console.log('🔇 Track muted:', event.track.kind);
      };
      
      event.track.onended = () => {
        console.log('⏹️ Track ended:', event.track.kind);
      };
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
      
      if (peerConnection.connectionState === 'failed') {
        console.error('Connection failed!');
      }
    };

    // Handle ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  // Start call (initiator creates offer)
  const startCall = async () => {
    try {
      // Create peer connection if not exists
      let peerConnection = peerConnectionRef.current;
      if (!peerConnection) {
        peerConnection = createPeerConnection();
      }
      
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
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setRemoteStream(null);
    setLocalStream(null);
  };

  // Create peer connection when local stream is ready
  useEffect(() => {
    if (localStreamRef.current && !peerConnectionRef.current) {
      console.log('🎬 Local stream ready, creating peer connection');
      createPeerConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    // Create peer connection BEFORE joining room (critical!)
    if (!peerConnectionRef.current && localStreamRef.current) {
      console.log('Creating peer connection before joining room');
      createPeerConnection();
    }

    // Join room
    console.log('Joining room:', roomId);
    socket.emit('join-room', roomId);

    // Handle user joined (for initiator to start call)
    socket.on('user-joined', (userId) => {
      console.log('User joined:', userId);
      if (isInitiator) {
        // Create peer connection if not exists
        if (!peerConnectionRef.current && localStreamRef.current) {
          console.log('Creating peer connection after user joined');
          createPeerConnection();
        }
        
        if (localStreamRef.current) {
          console.log('Starting call as initiator');
          setTimeout(() => startCall(), 500); // Small delay to ensure peer connection is ready
        } else {
          console.log('Waiting for local stream before starting call...');
          // Wait for local stream and retry
          setTimeout(() => {
            if (localStreamRef.current) {
              console.log('Local stream ready, starting call now');
              if (!peerConnectionRef.current) {
                createPeerConnection();
              }
              startCall();
            }
          }, 1000);
        }
      }
    });

    // Handle incoming offer (non-initiator)
    socket.on('offer', async (data) => {
      console.log('Received offer');
      try {
        // Wait for local stream if not ready
        if (!localStreamRef.current) {
          console.log('Waiting for local stream...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Create peer connection if not exists
        let peerConnection = peerConnectionRef.current;
        if (!peerConnection) {
          peerConnection = createPeerConnection();
        }
        
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        console.log('Sending answer');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
