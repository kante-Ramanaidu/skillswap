import { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/VideoCall.css';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/* ── SVG Icon Components ── */
const MicIcon = ({ muted }) =>
  muted ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" />
    </svg>
  );

const CamIcon = ({ off }) =>
  off ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.553-2.527A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14" />
      <rect x="2" y="7" width="13" height="10" rx="2" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.553-2.527A1 1 0 0121 8.382v7.236a1 1 0 01-1.447.894L15 14" />
      <rect x="2" y="7" width="13" height="10" rx="2" />
    </svg>
  );

const ScreenIcon = ({ active }) =>
  active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M12 18v3M8 21h8" />
      <rect x="8" y="8" width="8" height="6" rx="1" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M12 18v3M8 21h8" />
      <path d="M9 11l3-3 3 3M12 8v6" />
    </svg>
  );

const ZoomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
  </svg>
);

const MoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
    <circle cx="5" cy="12" r="1.3" fill="#e2e8f0" />
    <circle cx="12" cy="12" r="1.3" fill="#e2e8f0" />
    <circle cx="19" cy="12" r="1.3" fill="#e2e8f0" />
  </svg>
);

const PhoneEndIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.03a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15z"
      transform="rotate(135 12 12)"
    />
  </svg>
);

const PhoneAnswerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.03a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15z" />
  </svg>
);

const MinimizeIcon = () => (
  <span style={{ fontSize: '16px', color: '#c0ccd8', lineHeight: 1, userSelect: 'none' }}>─</span>
);

const FullscreenIcon = () => (
  <span style={{ fontSize: '14px', color: '#c0ccd8', lineHeight: 1, userSelect: 'none' }}>⛶</span>
);

const CloseIcon = () => (
  <span style={{ fontSize: '16px', color: '#c0ccd8', lineHeight: 1, userSelect: 'none', fontWeight: 300 }}>✕</span>
);

/* ── Reusable control button ── */
function CtrlBtn({ onClick, isOff, isActive, label, children, title }) {
  return (
    <div className="vc-icon-btn-wrap">
      <button
        className={`vc-icon-btn${isOff ? ' off' : ''}${isActive ? ' active' : ''}`}
        onClick={onClick}
        title={title}
        aria-label={title}
      >
        {children}
      </button>
      <span className="vc-btn-label">{label}</span>
    </div>
  );
}

/* ── Main Component ── */
function VideoCall({ roomId, partnerName, onClose, socket, incomingOffer: incomingOfferProp }) {
  // Video element refs
  const localVideoRef = useRef(null);       // shows camera (or screen during share)
  const remoteVideoRef = useRef(null);      // shows remote stream
  const pipCameraRef = useRef(null);        // ✅ NEW: PiP camera overlay during screen share
  const modalRef = useRef(null);

  // WebRTC refs
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);      // camera + mic stream
  const screenStreamRef = useRef(null);     // screen capture stream
  const iceCandidateQueue = useRef([]);
  const isNegotiating = useRef(false);      // ✅ FIX: prevents renegotiation race on startup
  const callSetupDone = useRef(false);      // ✅ FIX: gate for onnegotiationneeded

  // UI state
  const [status, setStatus] = useState('idle');
  const [incomingOffer, setIncomingOffer] = useState(incomingOfferProp || null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (incomingOfferProp) {
      setIncomingOffer(incomingOfferProp);
      setStatus('incoming');
    }
  }, [incomingOfferProp]);

  /* ── Socket event handlers ── */
  useEffect(() => {
    if (!socket) return;

    const onIncomingCall = ({ offer }) => {
      setIncomingOffer(offer);
      setStatus('incoming');
    };

    const onCallAnswered = async ({ answer }) => {
      try {
        if (!peerRef.current) return;
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        await drainIceCandidateQueue();
      } catch (e) {
        console.error('setRemoteDescription (answer) error:', e);
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      try {
        if (peerRef.current?.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidateQueue.current.push(candidate);
        }
      } catch (e) {
        console.error('addIceCandidate error:', e);
      }
    };

    // ✅ FIX: callEnded handler also resets negotiation flags
    const onCallEnded = () => {
      cleanup();
      setStatus('ended');
      setTimeout(onClose, 1500);
    };

    const onCallRejected = () => {
      cleanup();
      setStatus('idle');
    };

    const onRenegotiateOffer = async ({ offer }) => {
      if (!peerRef.current) return;
      try {
        isNegotiating.current = true;
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit('renegotiateAnswer', { roomId, answer });
      } catch (e) {
        console.error('Renegotiation answer error:', e);
      } finally {
        isNegotiating.current = false;
      }
    };

    const onRenegotiateAnswer = async ({ answer }) => {
      if (!peerRef.current) return;
      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        console.error('Renegotiation set answer error:', e);
      }
    };

    socket.on('incomingCall', onIncomingCall);
    socket.on('callAnswered', onCallAnswered);
    socket.on('iceCandidate', onIceCandidate);
    socket.on('callEnded', onCallEnded);
    socket.on('callRejected', onCallRejected);
    socket.on('renegotiateOffer', onRenegotiateOffer);
    socket.on('renegotiateAnswer', onRenegotiateAnswer);

    return () => {
      socket.off('incomingCall', onIncomingCall);
      socket.off('callAnswered', onCallAnswered);
      socket.off('iceCandidate', onIceCandidate);
      socket.off('callEnded', onCallEnded);
      socket.off('callRejected', onCallRejected);
      socket.off('renegotiateOffer', onRenegotiateOffer);
      socket.off('renegotiateAnswer', onRenegotiateAnswer);
    };
  }, [socket, roomId]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  /* ── Helpers ── */
  const drainIceCandidateQueue = async () => {
    for (const c of iceCandidateQueue.current) {
      try {
        await peerRef.current?.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.error('drainIceCandidateQueue error:', e);
      }
    }
    iceCandidateQueue.current = [];
  };

  const getMedia = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      if (err.name === 'NotReadableError' || err.name === 'NotAllowedError') {
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      } else {
        throw err;
      }
    }
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPeer = (stream) => {
    callSetupDone.current = false; // ✅ reset on every new peer
    isNegotiating.current = false;

    const peer = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(t => peer.addTrack(t, stream));

    peer.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('iceCandidate', { roomId, candidate: e.candidate });
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') setStatus('connected');
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        cleanup();
        setStatus('ended');
        setTimeout(onClose, 1500);
      }
    };

    // ✅ FIX: only fire renegotiation AFTER initial offer/answer is done
    peer.onnegotiationneeded = async () => {
      if (!callSetupDone.current) return; // skip during initial setup
      if (isNegotiating.current) return;  // skip if already mid-negotiation
      try {
        isNegotiating.current = true;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit('renegotiateOffer', { roomId, offer });
      } catch (e) {
        console.error('Renegotiation offer error:', e);
      } finally {
        isNegotiating.current = false;
      }
    };

    peerRef.current = peer;
    return peer;
  };

  /* ── Call actions ── */
  const startCall = async () => {
    setStatus('calling');
    try {
      const stream = await getMedia();
      const peer = createPeer(stream);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('callUser', { roomId, offer });
      callSetupDone.current = true; // ✅ renegotiation now allowed
    } catch (err) {
      console.error('startCall error:', err);
      setStatus('idle');
    }
  };

  const answerCall = async () => {
    setStatus('connecting');
    try {
      const stream = await getMedia();
      const peer = createPeer(stream);
      await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      await drainIceCandidateQueue();
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answerCall', { roomId, answer });
      callSetupDone.current = true; // ✅ renegotiation now allowed
    } catch (err) {
      console.error('answerCall error:', err);
      setStatus('idle');
    }
  };

  const rejectCall = () => {
    socket.emit('rejectCall', { roomId });
    setStatus('idle');
    setIncomingOffer(null);
    onClose();
  };

  const endCall = () => {
    socket.emit('endCall', { roomId });
    cleanup();
    setStatus('ended');
    setTimeout(onClose, 1000);
  };

  /* ── Cleanup ── */
  const cleanup = () => {
    callSetupDone.current = false;
    isNegotiating.current = false;
    peerRef.current?.close();
    peerRef.current = null;
    iceCandidateQueue.current = [];
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (pipCameraRef.current) pipCameraRef.current.srcObject = null; // ✅ clear PiP
    setScreenSharing(false);
  };

  /* ── Media controls ── */
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  // ✅ FIX: fully stable stopScreenShare with useCallback so onended closure is never stale
  const stopScreenShare = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;

    // ✅ FIX: restore camera track properly, ensuring localStreamRef is updated
    let camTrack = localStreamRef.current?.getVideoTracks()[0];

    if (!camTrack || camTrack.readyState === 'ended') {
      // Camera track was stopped — re-acquire it
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        camTrack = newStream.getVideoTracks()[0];

        // Merge into existing localStream (keep audio)
        const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
        const merged = new MediaStream([camTrack, ...audioTracks]);
        localStreamRef.current = merged;
      } catch (e) {
        console.error('Could not restore camera:', e);
      }
    }

    // Replace screen track with camera track in peer connection
    if (peerRef.current && camTrack) {
      const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(camTrack);
      }
    }

    // ✅ Restore local preview to camera, clear PiP
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    if (pipCameraRef.current) pipCameraRef.current.srcObject = null;

    setScreenSharing(false);
  }, []);

  const toggleScreenShare = async () => {
    if (screenSharing) {
      await stopScreenShare();
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // ✅ FIX: replace only the sender track — do NOT touch localVideoRef here
      if (peerRef.current) {
        const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        } else {
          // No video sender yet — add screen track
          peerRef.current.addTrack(screenTrack, screenStream);
        }
      }

      // ✅ Show screen in the main local video box
      if (localVideoRef.current) {
        const audioTracks = localStreamRef.current?.getAudioTracks() ?? [];
        localVideoRef.current.srcObject = new MediaStream([screenTrack, ...audioTracks]);
      }

      // ✅ Show camera face in the PiP overlay
      if (pipCameraRef.current && localStreamRef.current) {
        pipCameraRef.current.srcObject = new MediaStream(
          localStreamRef.current.getVideoTracks()
        );
      }

      // ✅ FIX: use stable useCallback ref — no stale closure
      screenTrack.onended = () => stopScreenShare();

      setScreenSharing(true);
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen share error:', err);
      }
    }
  };

  const toggleZoom = () => {
    setZoomLevel(prev => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const toggleMinimize = () => setIsMinimized(v => !v);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await modalRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && status === 'idle') onClose();
  };

  const statusLabel = {
    idle: 'Ready to call',
    calling: 'Calling…',
    incoming: 'Incoming call',
    connecting: 'Connecting…',
    connected: 'Connected',
    ended: 'Call ended',
  }[status] || '';

  return (
    <div className="vc-overlay" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className={`vc-modal${isMinimized ? ' vc-minimized' : ''}${isFullscreen ? ' vc-fullscreen' : ''}`}
      >
        {/* HEADER */}
        <div className="vc-header">
          <div className="vc-header-info">
            <div className="vc-header-avatar">{getInitials(partnerName)}</div>
            <div>
              <div className="vc-header-name">{partnerName}</div>
              <div className={`vc-header-status ${status}`}>
                {status === 'connected' && <span className="vc-status-dot" />}
                {statusLabel}
              </div>
            </div>
          </div>

          <div className="vc-window-controls">
            <button className="vc-wc-btn" onClick={toggleMinimize} title={isMinimized ? 'Restore' : 'Minimize'}>
              <MinimizeIcon />
            </button>
            <button className="vc-wc-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              <FullscreenIcon />
            </button>
            <button className="vc-wc-btn close" onClick={onClose} title="Close">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* VIDEO AREA */}
        {!isMinimized && (
          <div className="vc-videos">
            {/* Remote video — full size */}
            <div className="vc-video-remote">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }}
              />
              {status !== 'connected' && (
                <div className="vc-video-placeholder">
                  <div className="vc-avatar-large">{getInitials(partnerName)}</div>
                  <p>{partnerName}</p>
                </div>
              )}
              {zoomLevel > 1 && <div className="vc-zoom-badge">{zoomLevel}×</div>}
            </div>

            {/* Local video — small PiP bottom-right */}
            <div className="vc-video-local">
              {/* Main local feed: screen during share, camera otherwise */}
              <video ref={localVideoRef} autoPlay playsInline muted />

              {/* ✅ NEW: Camera face PiP shown on top when screen sharing */}
              {screenSharing && (
                <video
                  ref={pipCameraRef}
                  autoPlay
                  playsInline
                  muted
                  className="vc-cam-pip"
                />
              )}

              {!camOn && !screenSharing && (
                <div className="vc-cam-off">
                  <CamIcon off />
                </div>
              )}
              {screenSharing && <div className="vc-screen-badge">Sharing</div>}
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="vc-controls">
          {status === 'idle' && (
            <button className="vc-btn vc-btn-call" onClick={startCall}>
              <PhoneAnswerIcon /> Start Video Call
            </button>
          )}

          {status === 'calling' && (
            <div className="vc-calling-layout">
              <span className="vc-calling-pulse">Calling {partnerName}…</span>
              <div className="vc-end-wrap">
                <button className="vc-end-btn" onClick={endCall} title="Cancel call" aria-label="Cancel call">
                  <PhoneEndIcon />
                </button>
                <span className="vc-end-label">End Call</span>
              </div>
            </div>
          )}

          {status === 'incoming' && (
            <div className="vc-incoming-btns">
              <div className="vc-incoming-btn-wrap">
                <button className="vc-ans-btn" onClick={answerCall} title="Answer" aria-label="Answer call">
                  <PhoneAnswerIcon />
                </button>
                <span className="vc-ans-label">Answer</span>
              </div>
              <div className="vc-incoming-btn-wrap">
                <button className="vc-dec-btn" onClick={rejectCall} title="Decline" aria-label="Decline call">
                  <PhoneEndIcon />
                </button>
                <span className="vc-dec-label">Decline</span>
              </div>
            </div>
          )}

          {status === 'connecting' && (
            <span className="vc-calling-pulse">Connecting…</span>
          )}

          {status === 'connected' && (
            <>
              <CtrlBtn onClick={toggleMic} isOff={!micOn} title={micOn ? 'Mute' : 'Unmute'} label={micOn ? 'Mute' : 'Unmute'}>
                <MicIcon muted={!micOn} />
              </CtrlBtn>

              <CtrlBtn onClick={toggleCam} isOff={!camOn} title={camOn ? 'Camera off' : 'Camera on'} label={camOn ? 'Camera' : 'Cam off'}>
                <CamIcon off={!camOn} />
              </CtrlBtn>

              <CtrlBtn onClick={toggleScreenShare} isActive={screenSharing} title={screenSharing ? 'Stop sharing' : 'Share screen'} label={screenSharing ? 'Stop' : 'Share'}>
                <ScreenIcon active={screenSharing} />
              </CtrlBtn>

              <CtrlBtn onClick={toggleZoom} title={`Zoom (${zoomLevel}×)`} label={`${zoomLevel}×`}>
                <ZoomIcon />
              </CtrlBtn>

              <CtrlBtn title="More options" label="More">
                <MoreIcon />
              </CtrlBtn>

              <div className="vc-end-wrap">
                <button className="vc-end-btn" onClick={endCall} title="End call" aria-label="End call">
                  <PhoneEndIcon />
                </button>
                <span className="vc-end-label">End</span>
              </div>
            </>
          )}

          {status === 'ended' && <span className="vc-ended-msg">Call ended</span>}
        </div>
      </div>
    </div>
  );
}

export default VideoCall;