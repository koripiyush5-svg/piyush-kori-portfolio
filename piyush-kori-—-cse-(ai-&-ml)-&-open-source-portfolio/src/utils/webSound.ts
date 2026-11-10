import { WebFluidMode, computeWebSoundProfile } from './spiderPhysics';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {
      // Ignore autoplay restrictions if not triggered by direct gesture
    });
  }
  return sharedAudioCtx;
}

/**
 * Synthesizes a subtle, iconic Spider-Man "thwip!" web-shooter sound effect
 * using Web Audio API (combining a pneumatic bandpass silk hiss with a fast
 * mechanical frequency sweep).
 */
export function playWebShootSound(mode: WebFluidMode = 'classic', enabled: boolean = true): boolean {
  if (!enabled) return false;

  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    const profile = computeWebSoundProfile(mode);
    const now = ctx.currentTime;
    const end = now + profile.durationSec;

    // 1. Pitched Mechanical Wrist-Shooter "Thwip" Oscillator Sweep
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = profile.oscType;

    osc.frequency.setValueAtTime(profile.startOscFreq, now);
    osc.frequency.exponentialRampToValueAtTime(profile.peakOscFreq, now + profile.durationSec * 0.42);
    osc.frequency.exponentialRampToValueAtTime(profile.endOscFreq, end);

    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(profile.peakGain, now + 0.018);
    oscGain.gain.exponentialRampToValueAtTime(0.0008, end);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(end + 0.01);

    // 2. Pneumatic Silk Strand Air Burst (Bandpass-Filtered White Noise)
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * profile.durationSec));
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const channelData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Exponentially decaying envelope shaped into the noise buffer
      const decay = 1 - i / bufferSize;
      channelData[i] = (Math.random() * 2 - 1) * decay;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(profile.filterQ, now);
    bandpass.frequency.setValueAtTime(profile.startFilterFreq, now);
    bandpass.frequency.exponentialRampToValueAtTime(profile.endFilterFreq, end);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(profile.noiseGain, now + 0.012);
    noiseGain.gain.exponentialRampToValueAtTime(0.0008, end);

    noiseSource.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(end + 0.01);

    return true;
  } catch {
    return false;
  }
}
