import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { AudioSample } from '../utils/audio-processor';

interface SampleCardProps {
  sample: AudioSample;
  index: number;
}

export function SampleCard({ sample, index }: SampleCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio(sample.url);
      audioRef.current = audio;
      audio.addEventListener('ended', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, '0')}s`;
  };

  const formatDbfs = (dbfs: number) => {
    return `${dbfs.toFixed(1)} dB`;
  };

  return (
    <div 
      className="retro-outset retro-pattern" 
      style={{ 
        margin: '4px',
        background: isPlaying ? '#ffffcc' : 'var(--retro-gray)',
        border: isPlaying ? '2px outset #ffff88' : '2px outset var(--retro-gray)'
      }}
    >
      {/* Title Bar */}
      <div style={{ 
        background: isPlaying ? '#0080ff' : '#008080',
        color: 'white',
        padding: '2px 4px',
        fontSize: '10px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{sample.filename}</span>
        <button
          onClick={togglePlay}
          className="retro-button"
          style={{ 
            width: '20px',
            height: '16px',
            padding: '0',
            fontSize: '8px',
            minHeight: 'auto'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <div style={{ padding: '8px' }}>
        {/* Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div className="retro-inset" style={{ 
            padding: '4px', 
            textAlign: 'center',
            fontSize: '10px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Duration</div>
            <div style={{ 
              background: '#001100', 
              color: '#00ff00',
              fontFamily: '"Courier New", monospace',
              padding: '2px',
              fontSize: '9px'
            }}>
              {formatDuration(sample.duration_ms)}
            </div>
          </div>
          <div className="retro-inset" style={{ 
            padding: '4px', 
            textAlign: 'center',
            fontSize: '10px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Level</div>
            <div style={{ 
              background: '#001100', 
              color: '#00ff00',
              fontFamily: '"Courier New", monospace',
              padding: '2px',
              fontSize: '9px'
            }}>
              {formatDbfs(sample.dbfs)}
            </div>
          </div>
        </div>

        {/* Waveform */}
        <div className="retro-waveform">
          {Array.from({ length: 24 }).map((_, i) => {
            const height = Math.random() * 32 + 4;
            return (
              <div
                key={i}
                className="retro-waveform-bar"
                style={{
                  height: `${height}px`,
                  left: `${(i * 100) / 24}%`,
                  opacity: isPlaying ? 1 : 0.6
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}