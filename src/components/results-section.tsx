import { SampleCard } from './sample-card';
import { AudioSample } from '../utils/audio-processor';
import { Download } from 'lucide-react';

interface ResultsSectionProps {
  samples: AudioSample[];
  isProcessing: boolean;
  onDownload?: () => void;
}

export function ResultsSection({ samples, isProcessing, onDownload }: ResultsSectionProps) {
  if (isProcessing) {
    return (
      <div>
        <p style={{ margin: '0 0 12px 0', fontSize: '11px' }}>
          Processing audio file, please wait...
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '8px' 
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="retro-outset"
              style={{
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--retro-gray)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div className="retro-progress" style={{ 
                  width: '80px', 
                  height: '12px', 
                  margin: '0 auto 8px auto'
                }}>
                  <div className="retro-progress-bar" style={{ width: '100%' }} />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--retro-dark-gray)' }}>
                  Loading...
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="retro-inset" style={{ 
        textAlign: 'center', 
        padding: '32px',
        background: 'white'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'var(--retro-gray)',
          border: '2px outset var(--retro-gray)',
          margin: '0 auto 16px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          🎵
        </div>
        <p style={{ 
          margin: 0, 
          fontSize: '11px'
        }}>
          Upload an audio file and click "Generate Sample Pack" to see your samples here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="retro-outset" style={{ 
        marginBottom: '12px',
        background: '#008080',
        color: 'white',
        padding: '4px 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
            Generated Samples
          </span>
          <span style={{ 
            fontSize: '10px', 
            background: 'white',
            color: 'black',
            padding: '2px 6px',
            fontWeight: 'bold'
          }}>
            {samples.length}
          </span>
        </div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="retro-button retro-button-primary"
            style={{ 
              fontSize: '10px',
              padding: '2px 8px',
              minHeight: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Download style={{ width: '10px', height: '10px' }} />
            Download ZIP
          </button>
        )}
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '8px',
        maxHeight: '400px',
        overflowY: 'auto'
      }} className="retro-scrollbar">
        {samples.map((sample, index) => (
          <SampleCard
            key={index}
            sample={sample}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}