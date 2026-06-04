/** Decode browser audio (webm, mp3, etc.) and encode as 16-bit PCM WAV for the ML service. */

function mixToMono(buffer: AudioBuffer): Float32Array {
  if (buffer.numberOfChannels === 1) {
    return buffer.getChannelData(0);
  }
  const length = buffer.length;
  const mono = new Float32Array(length);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const channel = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += channel[i] / buffer.numberOfChannels;
    }
  }
  return mono;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Resample to target rate via OfflineAudioContext, then export WAV.
 * Matches librosa training default sr=22050.
 */
export async function convertBlobToWav(
  blob: Blob,
  targetSampleRate = 22050,
): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const duration = decoded.duration;
    const frames = Math.max(1, Math.ceil(duration * targetSampleRate));
    const offline = new OfflineAudioContext(1, frames, targetSampleRate);
    const source = offline.createBufferSource();

    const monoBuffer = offline.createBuffer(1, decoded.length, decoded.sampleRate);
    monoBuffer.copyToChannel(mixToMono(decoded), 0);
    source.buffer = monoBuffer;
    source.connect(offline.destination);
    source.start(0);

    const rendered = await offline.startRendering();
    return encodeWav(rendered.getChannelData(0), targetSampleRate);
  } finally {
    await ctx.close();
  }
}
