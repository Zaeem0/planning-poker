import { useEffect, useRef, useMemo } from 'react';
import { Vote, useGameStore } from '@/lib/store';
import { hasUnanimousVote } from '@/lib/vote-utils';

function playChimeSound() {
  if (typeof window === 'undefined') return;

  const audioContext =
    new // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.AudioContext || (window as any).webkitAudioContext)();

  // Realistic crowd celebration sound - 5+ seconds
  // Multiple layers for natural, modern sound

  // Create realistic clap sound with proper envelope
  function createClap(startTime: number, gain: number, pan = 0) {
    const bufferSize = audioContext.sampleRate * 0.08;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);

    // Generate pink noise (more natural than white noise)
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const noise = audioContext.createBufferSource();
    const highpass = audioContext.createBiquadFilter();
    const lowpass = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();
    const panner = audioContext.createStereoPanner();

    noise.buffer = buffer;

    // Multi-stage filtering for realistic clap sound
    highpass.type = 'highpass';
    highpass.frequency.value = 800;
    highpass.Q.value = 0.5;

    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4000;
    lowpass.Q.value = 1;

    panner.pan.value = pan;

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(audioContext.destination);

    const now = audioContext.currentTime + startTime;
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.start(now);
    noise.stop(now + 0.08);
  }

  // Generate natural crowd clapping pattern over 5+ seconds
  const totalDuration = 5.5;
  const clapsPerSecond = 12; // Realistic clapping rate
  const totalClaps = Math.floor(totalDuration * clapsPerSecond);

  for (let i = 0; i < totalClaps; i++) {
    const baseTime = (i / clapsPerSecond) * (1 + (Math.random() - 0.5) * 0.3);
    const gain = 0.15 + Math.random() * 0.15;
    const pan = (Math.random() - 0.5) * 1.5; // Stereo spread

    // Fade out gradually over time
    const fadeMultiplier = 1 - baseTime / totalDuration;
    createClap(baseTime, gain * fadeMultiplier, pan);
  }

  // Create crowd ambience with filtered noise
  function createAmbience() {
    const bufferSize = audioContext.sampleRate * totalDuration;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);

    // Generate low-frequency noise for crowd murmur
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();

    noise.buffer = buffer;

    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 2;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.3);
    gainNode.gain.linearRampToValueAtTime(
      0.04,
      audioContext.currentTime + totalDuration - 1
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + totalDuration
    );

    noise.start(audioContext.currentTime);
    noise.stop(audioContext.currentTime + totalDuration);
  }

  createAmbience();

  // Cleanup after sound finishes
  setTimeout(() => {
    audioContext.close();
  }, 6000);
}

export function useUnanimousChime(votes: Vote[], revealed: boolean): void {
  const prevRevealedRef = useRef(revealed);
  const isMuted = useGameStore((state) => state.isMuted);

  const isUnanimous = useMemo(() => hasUnanimousVote(votes), [votes]);

  useEffect(() => {
    const wasRevealed = prevRevealedRef.current;
    prevRevealedRef.current = revealed;

    // Play chime when votes are revealed and unanimous (and not muted)
    if (!wasRevealed && revealed && isUnanimous && !isMuted) {
      try {
        playChimeSound();
      } catch (error) {
        // Silently fail if audio context is not supported
        console.debug('Chime sound failed:', error);
      }
    }
  }, [revealed, isUnanimous, isMuted]);
}
