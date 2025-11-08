export interface AudioSample {
  filename: string;
  duration_ms: number;
  dbfs: number;
  audioBuffer: AudioBuffer;
  blob: Blob;
}

export class AudioProcessor {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async processFile(
    file: File, 
    minSilenceLen: number = 500, 
    silenceThresh: number = -40
  ): Promise<AudioSample[]> {
    try {
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Find silence points and split
      const samples = await this.splitOnSilence(
        audioBuffer, 
        minSilenceLen, 
        silenceThresh
      );

      return samples;
    } catch (error) {
      console.error('Error processing audio:', error);
      throw new Error('Failed to process audio file. Please ensure it\'s a valid audio file.');
    }
  }

  private async splitOnSilence(
    audioBuffer: AudioBuffer,
    minSilenceLen: number,
    silenceThresh: number
  ): Promise<AudioSample[]> {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const minSilenceSamples = Math.floor((minSilenceLen / 1000) * sampleRate);
    
    // Convert dB threshold to linear
    const linearThreshold = Math.pow(10, silenceThresh / 20);
    
    // Find silence regions
    const silenceRegions = this.findSilenceRegions(
      channelData, 
      linearThreshold, 
      minSilenceSamples
    );

    // Split audio at silence regions
    const samples: AudioSample[] = [];
    let lastEnd = 0;

    for (let i = 0; i < silenceRegions.length; i++) {
      const silenceStart = silenceRegions[i].start;
      
      if (silenceStart > lastEnd) {
        // Create sample from lastEnd to silenceStart
        const sampleBuffer = this.extractAudioSegment(
          audioBuffer, 
          lastEnd, 
          silenceStart
        );
        
        if (sampleBuffer && sampleBuffer.length > sampleRate * 0.1) { // At least 0.1 seconds
          const sample = await this.createSample(sampleBuffer, samples.length + 1);
          samples.push(sample);
        }
      }
      
      lastEnd = silenceRegions[i].end;
    }

    // Don't forget the last segment
    if (lastEnd < channelData.length) {
      const sampleBuffer = this.extractAudioSegment(
        audioBuffer, 
        lastEnd, 
        channelData.length
      );
      
      if (sampleBuffer && sampleBuffer.length > sampleRate * 0.1) {
        const sample = await this.createSample(sampleBuffer, samples.length + 1);
        samples.push(sample);
      }
    }

    return samples;
  }

  private findSilenceRegions(
    channelData: Float32Array,
    threshold: number,
    minSilenceSamples: number
  ): Array<{ start: number; end: number }> {
    const silenceRegions: Array<{ start: number; end: number }> = [];
    let silenceStart = -1;
    let silentSamples = 0;

    for (let i = 0; i < channelData.length; i++) {
      const amplitude = Math.abs(channelData[i]);
      
      if (amplitude < threshold) {
        if (silenceStart === -1) {
          silenceStart = i;
        }
        silentSamples++;
      } else {
        if (silenceStart !== -1 && silentSamples >= minSilenceSamples) {
          silenceRegions.push({
            start: silenceStart,
            end: i
          });
        }
        silenceStart = -1;
        silentSamples = 0;
      }
    }

    // Handle silence at the end
    if (silenceStart !== -1 && silentSamples >= minSilenceSamples) {
      silenceRegions.push({
        start: silenceStart,
        end: channelData.length
      });
    }

    return silenceRegions;
  }

  private extractAudioSegment(
    audioBuffer: AudioBuffer,
    startSample: number,
    endSample: number
  ): AudioBuffer | null {
    const length = endSample - startSample;
    if (length <= 0) return null;

    const newBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      length,
      audioBuffer.sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const newChannelData = newBuffer.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        newChannelData[i] = channelData[startSample + i];
      }
    }

    return newBuffer;
  }

  private async createSample(audioBuffer: AudioBuffer, index: number): Promise<AudioSample> {
    // Calculate RMS and convert to dBFS
    const channelData = audioBuffer.getChannelData(0);
    let rms = 0;
    for (let i = 0; i < channelData.length; i++) {
      rms += channelData[i] * channelData[i];
    }
    rms = Math.sqrt(rms / channelData.length);
    const dbfs = rms > 0 ? 20 * Math.log10(rms) : -60;

    // Convert to WAV blob
    const blob = await this.audioBufferToWavBlob(audioBuffer);

    return {
      filename: `sample_${index}.wav`,
      duration_ms: (audioBuffer.length / audioBuffer.sampleRate) * 1000,
      dbfs: dbfs,
      audioBuffer: audioBuffer,
      blob: blob
    };
  }

  private async audioBufferToWavBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    // Create WAV header
    const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }

  cleanup() {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}