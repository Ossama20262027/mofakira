// Web Audio API chime, alarm clock, and interactive hover sound generator
class SoundAlertService {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private lastHoverTime: number = 0;
  private activeAlarmOscillators: Array<{ stop: () => void }> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('click', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
      window.addEventListener('keydown', unlock, { once: true, passive: true });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Explicitly unlock audio context upon user gesture
  unlockAudio(): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Play a silent brief buffer to unlock iOS audio pipeline
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      this.isUnlocked = true;
    } catch {}
    return true;
  }

  // Clear, piercing Alarm Clock (منبه تنبيهي واضح وقوي)
  // Rhythmic dual-tone bursts that sound exactly like an alarm clock
  playAlarm() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopAlarm();

    const now = ctx.currentTime;
    // Two cycles of 4 rapid beep pulses (8 beeps total)
    const pulses = [
      0.0, 0.12, 0.24, 0.36,
      0.65, 0.77, 0.89, 1.01,
      1.30, 1.42, 1.54, 1.66
    ];

    pulses.forEach((pulseOffset) => {
      const startTime = now + pulseOffset;
      const duration = 0.08;

      // Primary tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, startTime); // C6 high alarm pitch
      osc1.frequency.setValueAtTime(1318.5, startTime + 0.04); // E6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2093.0, startTime); // C7 overtone

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.015);
      gain.gain.setValueAtTime(0.35, startTime + duration - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);

      this.activeAlarmOscillators.push({
        stop: () => {
          try {
            osc1.stop();
            osc2.stop();
          } catch {}
        },
      });
    });
  }

  // Mechanical / School Bell Alarm (صوت جرس المنبه المدرسي الرنان)
  playAlarmBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.stopAlarm();

    const now = ctx.currentTime;
    // 6 rapid alternating clapper rings followed by ringing resonance
    for (let i = 0; i < 6; i++) {
      const ringTime = now + i * 0.15;
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = i % 2 === 0 ? 880 : 932; // A5 to Bb5 bell tremolo
      osc.frequency.setValueAtTime(baseFreq, ringTime);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(baseFreq * 2.5, ringTime);

      gain.gain.setValueAtTime(0.001, ringTime);
      gain.gain.linearRampToValueAtTime(0.3, ringTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ringTime + 0.5);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ringTime);
      oscHarmonic.start(ringTime);
      osc.stop(ringTime + 0.5);
      oscHarmonic.stop(ringTime + 0.5);
    }
  }

  // Stop any active alarm beeping
  stopAlarm() {
    this.activeAlarmOscillators.forEach((item) => item.stop());
    this.activeAlarmOscillators = [];
  }

  // Hover Tick Sound for Buttons (صوت نقرة خفيف عند مرور الفأرة أو اللمس)
  // Short (18ms), subtle, snappy, highly performant
  playHoverTick() {
    const nowMs = Date.now();
    // Throttle to prevent acoustic clutter during rapid mouse movement
    if (nowMs - this.lastHoverTime < 50) return;
    this.lastHoverTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle high pitch sweep (1400Hz -> 800Hz)
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // Button Tap/Click Sound (صوت نقر الزر)
  playButtonTap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Soft administrative chime
  playChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.15);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);
  }

  // School bell / alert tone
  playBell() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  playSoft() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playByType(type: 'alarm' | 'alarm_bell' | 'chime' | 'bell' | 'soft' | 'marimba' = 'alarm') {
    switch (type) {
      case 'alarm':
        this.playAlarm();
        break;
      case 'alarm_bell':
        this.playAlarmBell();
        break;
      case 'chime':
        this.playChime();
        break;
      case 'soft':
        this.playSoft();
        break;
      case 'bell':
      case 'marimba':
      default:
        this.playAlarm();
        break;
    }
  }
}

export const soundAlerts = new SoundAlertService();

export const playAdminChime = (type: 'alarm' | 'alarm_bell' | 'chime' | 'bell' | 'soft' | 'marimba' | 'urgent' = 'alarm') => {
  if (type === 'urgent' || type === 'alarm') {
    soundAlerts.playAlarm();
  } else if (type === 'alarm_bell') {
    soundAlerts.playAlarmBell();
  } else {
    soundAlerts.playByType(type as any);
  }
};

