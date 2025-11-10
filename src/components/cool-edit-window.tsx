import React, { useState, useRef, useEffect } from 'react';
import { DraggableWindow } from './draggable-window';

interface CoolEditWindowProps {
  isVisible: boolean;
  onClose: () => void;
  focusedWindow: string;
  setFocusedWindow: (id: string) => void;
}

export function CoolEditWindow({ 
  isVisible, 
  onClose, 
  focusedWindow, 
  setFocusedWindow 
}: CoolEditWindowProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [clickPosition, setClickPosition] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
      audioContextRef.current?.close();
    };
  }, []);

  const handleFileLoad = async (file: File) => {
    if (!audioContextRef.current) return;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setAudioFile(file);
      drawWaveform(buffer);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.stroke();
  };

  const handleWaveformClick = (event: React.MouseEvent) => {
    if (!audioBuffer) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickRatio = x / rect.width;
    const position = clickRatio * audioBuffer.duration;
    
    setClickPosition(position);
    playFromPosition(position);
  };

  const playFromPosition = (startTime: number) => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    sourceRef.current = source;

    if (isLooping) {
      source.loop = true;
      source.loopStart = startTime;
      source.loopEnd = Math.min(startTime + 2.0, audioBuffer.duration);
    }

    source.start(0, startTime);
    setIsPlaying(true);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  if (!isVisible) return null;

  return (
    <DraggableWindow
      title="Cool Edit Pro - Four Tet Mode"
      icon="🎵"
      initialPosition={{ x: 150, y: 150 }}
      width="650px"
      height="450px"
      zIndex={focusedWindow === 'cooledit' ? 1000 : 999}
      onFocus={() => setFocusedWindow('cooledit')}
      onClose={onClose}
    >
      <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ border: '2px inset #c0c0c0', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#008080' }}>
            📁 Audio Input
          </div>
          <input
            type="file"
            accept="audio/*,.wav,.mp3"
            onChange={(e) => e.target.files?.[0] && handleFileLoad(e.target.files[0])}
            style={{ width: '100%', fontSize: '11px' }}
          />
          {audioFile && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'green', fontFamily: 'monospace' }}>
              ♪ {audioFile.name}
            </div>
          )}
        </div>

        <div style={{ border: '2px inset #c0c0c0', flex: 1, padding: '8px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#008080' }}>
            🎵 Click Anywhere to Loop from That Position
          </div>
          <canvas
            ref={canvasRef}
            width={600}
            height={220}
            style={{ width: '100%', backgroundColor: 'black', border: '1px solid gray', cursor: 'crosshair' }}
            onClick={handleWaveformClick}
          />
        </div>

        <div style={{ border: '2px outset #c0c0c0', padding: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              style={{
                padding: '4px 16px',
                border: isPlaying ? '2px inset #c0c0c0' : '2px outset #c0c0c0',
                backgroundColor: '#c0c0c0',
                cursor: audioBuffer ? 'pointer' : 'not-allowed'
              }}
              onClick={() => playFromPosition(clickPosition)}
              disabled={!audioBuffer}
            >
              {isPlaying ? '⏹ Stop' : '▶ Play'}
            </button>
            
            <button
              style={{
                padding: '4px 16px',
                border: isLooping ? '2px inset #c0c0c0' : '2px outset #c0c0c0',
                backgroundColor: '#c0c0c0',
                cursor: 'pointer'
              }}
              onClick={toggleLoop}
            >
              🔄 Loop: {isLooping ? 'ON' : 'OFF'}
            </button>

            <div style={{ 
              marginLeft: 'auto', 
              fontSize: '11px', 
              fontFamily: 'monospace', 
              color: 'green',
              backgroundColor: 'black',
              padding: '4px 8px'
            }}>
              {clickPosition.toFixed(2)}s
            </div>
          </div>
        </div>
      </div>
    </DraggableWindow>
  );
}