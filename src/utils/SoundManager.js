class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  createSpinSound() {
    if (!this.audioContext) return null;

    const duration = 3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + (t * 100);
      const decay = Math.exp(-t * 2);
      const noise = (Math.random() - 0.5) * 0.3;
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * decay * 0.3 + noise * decay * 0.1;
    }

    return buffer;
  }

  playSpinSound() {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.createSpinSound();
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2.5);
      
      source.start();
      source.stop(this.audioContext.currentTime + 3);
      
      return source;
    } catch (error) {
      console.warn('Failed to play spin sound:', error);
      return null;
    }
  }

  createClickSound() {
    if (!this.audioContext) return null;

    const duration = 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 800;
      const decay = Math.exp(-t * 50);
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * decay * 0.5;
    }

    return buffer;
  }

  playClickSound() {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.createClickSound();
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      
      source.start();
      source.stop(this.audioContext.currentTime + 0.1);
      
      return source;
    } catch (error) {
      console.warn('Failed to play click sound:', error);
      return null;
    }
  }

  createWinSound() {
    if (!this.audioContext) return null;

    const duration = 1.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency1 = 523.25 + (t * 100);
      const frequency2 = 659.25 + (t * 50);
      const decay = Math.exp(-t * 1.5);
      
      data[i] = (Math.sin(2 * Math.PI * frequency1 * t) + 
                Math.sin(2 * Math.PI * frequency2 * t)) * decay * 0.2;
    }

    return buffer;
  }

  playWinSound() {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.createWinSound();
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      
      source.start();
      source.stop(this.audioContext.currentTime + 1.5);
      
      return source;
    } catch (error) {
      console.warn('Failed to play win sound:', error);
      return null;
    }
  }

  createTickSound() {
    if (!this.audioContext) return null;

    const duration = 0.05;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 1200;
      const decay = Math.exp(-t * 40);
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * decay * 0.3;
    }

    return buffer;
  }

  playTickSound() {
    if (!this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.createTickSound();
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      
      source.start();
      source.stop(this.audioContext.currentTime + 0.05);
      
      return source;
    } catch (error) {
      console.warn('Failed to play tick sound:', error);
      return null;
    }
  }
}

export default new SoundManager();