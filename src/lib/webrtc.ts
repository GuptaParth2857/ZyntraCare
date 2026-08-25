export function isWebRTCSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!window.RTCPeerConnection
  );
}

export async function getUserMedia(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
  if (!isWebRTCSupported()) {
    throw new Error('WebRTC is not supported in this browser');
  }
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          throw new Error('Camera/Microphone permission denied');
        case 'NotFoundError':
          throw new Error('No camera or microphone found');
        case 'NotReadableError':
          throw new Error('Camera/Microphone is already in use by another application');
        default:
          throw new Error(`Media access error: ${error.message}`);
      }
    }
    throw error;
  }
}

export async function enumerateDevices(): Promise<MediaDeviceInfo[]> {
  if (!isWebRTCSupported() || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'videoinput' || d.kind === 'audioinput');
  } catch {
    return [];
  }
}

export class WebRTCManager {
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  peerConnection: RTCPeerConnection | null = null;
  connectionState: 'idle' | 'calling' | 'connected' | 'disconnected' | 'failed' = 'idle';
  isAudioEnabled: boolean = true;
  isVideoEnabled: boolean = true;
  iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: process.env.NEXT_PUBLIC_TURN_URL || 'turn:openrelay.metered.ca:80',
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || 'openrelayproject',
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || 'openrelayproject',
    },
  ];

  private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: string) => void) | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  async startLocalStream(video: boolean = true, audio: boolean = true): Promise<void> {
    try {
      this.localStream = await getUserMedia({ video, audio });
      this.isAudioEnabled = audio;
      this.isVideoEnabled = video;
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to start local stream'));
      throw error;
    }
  }

  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStreamCallback?.(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.onIceCandidateCallback?.(event.candidate);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      switch (state) {
        case 'connected':
        case 'completed':
          this.connectionState = 'connected';
          break;
        case 'disconnected':
          this.connectionState = 'disconnected';
          break;
        case 'failed':
          this.connectionState = 'failed';
          break;
        default:
          break;
      }
      this.onConnectionStateChangeCallback?.(state || 'unknown');
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'failed') {
        this.connectionState = 'failed';
        this.onConnectionStateChangeCallback?.('failed');
      } else if (state === 'disconnected') {
        this.connectionState = 'disconnected';
        this.onConnectionStateChangeCallback?.('disconnected');
      } else if (state === 'connected') {
        this.connectionState = 'connected';
        this.onConnectionStateChangeCallback?.('connected');
      }
    };
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.connectionState = 'calling';
    this.createPeerConnection();

    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      this.connectionState = 'failed';
      this.handleError(error instanceof Error ? error : new Error('Failed to create offer'));
      throw error;
    }
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    this.connectionState = 'calling';
    this.createPeerConnection();

    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      this.connectionState = 'failed';
      this.handleError(error instanceof Error ? error : new Error('Failed to create answer'));
      throw error;
    }
  }

  async setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to set remote description'));
      throw error;
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to add ICE candidate'));
    }
  }

  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioEnabled = audioTrack.enabled;
      }
    }
    return this.isAudioEnabled;
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoEnabled = videoTrack.enabled;
      }
    }
    return this.isVideoEnabled;
  }

  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  disconnect(): void {
    this.stopLocalStream();

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.connectionState = 'disconnected';
    this.onConnectionStateChangeCallback?.('disconnected');
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback;
  }

  onConnectionStateChange(callback: (state: string) => void): void {
    this.onConnectionStateChangeCallback = callback;
  }

  onRemoteStream(callback: (stream: MediaStream) => void): void {
    this.onRemoteStreamCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  private handleError(error: Error): void {
    this.onErrorCallback?.(error);
  }
}
