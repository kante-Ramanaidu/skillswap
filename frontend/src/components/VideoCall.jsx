import { useEffect, useRef, useState } from 'react';
import '../styles/VideoCall.css';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

function VideoCall({ roomId, partnerName, onClose, socket }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [status, setStatus] = useState('idle');
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const onIncomingCall = ({ offer }) => {
      setIncomingOffer(offer);
      setStatus('incoming');
    };

    const onCallAnswered = async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setStatus('connected');
    };

    const onIceCandidate = async ({ candidate }) => {
      try {
        await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {}
    };

    const onCallEnded = () => {
      cleanup();
      setStatus('ended');
      setTimeout(onClose, 1500);
    };

    const onCallRejected = () => {
      cleanup();
      setStatus('idle');
    };

    socket.on('incomingCall', onIncomingCall);
    socket.on('callAnswered', onCallAnswered);
    socket.on('iceCandidate', onIceCandidate);
    socket.on('callEnded', onCallEnded);
    socket.on('callRejected', onCallRejected);

    return () => {
      socket.off('incomingCall', onIncomingCall);
      socket.off('callAnswered', onCallAnswered);
      socket.off('iceCandidate', onIceCandidate);
      socket.off('callEnded', onCallEnded);
      socket.off('callRejected', onCallRejected);
    };
  }, [socket]);

  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPeer = (stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) socket.emit('iceCandidate', { roomId, candidate: e.candidate });
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') setStatus('connected');
    };

    peerRef.current = peer;
    return peer;
  };

  const startCall = async () => {
    setStatus('calling');
    try {
      const stream = await getMedia();
      const peer = createPeer(stream);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('callUser', { roomId, offer });
    } catch (err) {
      console.error('Start call error:', err);
      setStatus('idle');
    }
  };

  const answerCall = async () => {
    setStatus('connected');
    try {
      const stream = await getMedia();
      const peer = createPeer(stream);
      await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('answerCall', { roomId, answer });
    } catch (err) {
      console.error('Answer error:', err);
    }
  };

  const rejectCall = () => {
    socket.emit('rejectCall', { roomId });
    setStatus('idle');
    setIncomingOffer(null);
  };

  const endCall = () => {
    socket.emit('endCall', { roomId });
    cleanup();
    setStatus('ended');
    setTimeout(onClose, 1000);
  };

  const cleanup = () => {
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div className="vc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vc-modal">
        <div className="vc-header">
          <div className="vc-header-info">
            <div className="vc-header-avatar">{getInitials(partnerName)}</div>
            <div>
              <div className="vc-header-name">{partnerName}</div>
              <div className={`vc-header-status ${status}`}>
                {status === 'idle' && 'Ready to call'}
                {status === 'calling' && '🔔 Calling…'}
                {status === 'incoming' && '📞 Incoming call'}
                {status === 'connected' && '🟢 Connected'}
                {status === 'ended' && 'Call ended'}
              </div>
            </div>
          </div>
          <button className="vc-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="vc-videos">
          <div className="vc-video-remote">
            <video ref={remoteVideoRef} autoPlay playsInline />
            {status !== 'connected' && (
              <div className="vc-video-placeholder">
                <div className="vc-avatar-large">{getInitials(partnerName)}</div>
                <p>{partnerName}</p>
              </div>
            )}
          </div>
          <div className="vc-video-local">
            <video ref={localVideoRef} autoPlay playsInline muted />
            {!camOn && <div className="vc-cam-off">📷 off</div>}
          </div>
        </div>

        <div className="vc-controls">
          {status === 'idle' && (
            <button className="vc-btn vc-btn-call" onClick={startCall}>
              📹 Start Video Call
            </button>
          )}
          {status === 'calling' && (
            <>
              <span className="vc-calling-pulse">Calling {partnerName}…</span>
              <button className="vc-btn vc-btn-end" onClick={endCall}>Cancel</button>
            </>
          )}
          {status === 'incoming' && (
            <>
              <button className="vc-btn vc-btn-call" onClick={answerCall}>✅ Answer</button>
              <button className="vc-btn vc-btn-end" onClick={rejectCall}>❌ Decline</button>
            </>
          )}
          {status === 'connected' && (
            <>
              <button className={`vc-btn vc-btn-toggle ${!micOn ? 'off' : ''}`} onClick={toggleMic}>
                {micOn ? '🎤' : '🔇'}
              </button>
              <button className={`vc-btn vc-btn-toggle ${!camOn ? 'off' : ''}`} onClick={toggleCam}>
                {camOn ? '📹' : '🚫'}
              </button>
              <button className="vc-btn vc-btn-end" onClick={endCall}>📵 End Call</button>
            </>
          )}
          {status === 'ended' && <span className="vc-ended-msg">Call ended</span>}
        </div>
      </div>
    </div>
  );
}

export default VideoCall;