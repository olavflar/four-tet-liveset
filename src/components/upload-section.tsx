import { useState } from 'react';
import { Upload, FileAudio } from 'lucide-react';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export function UploadSection({ onFileSelect, selectedFile }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => 
      file.type.startsWith('audio/') || 
      file.name.endsWith('.wav') || 
      file.name.endsWith('.mp3')
    );
    
    if (audioFile) {
      onFileSelect(audioFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>
        Select an audio file to split into samples:
      </p>
      
      <div
        className="retro-inset"
        style={{ 
          background: isDragging ? '#ffffcc' : 'white', 
          padding: '16px', 
          textAlign: 'center',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
          border: isDragging ? '2px dashed #0080ff' : '2px inset var(--retro-gray)'
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div style={{ 
          width: '32px', 
          height: '32px', 
          background: selectedFile ? '#0080ff' : 'var(--retro-gray)', 
          border: selectedFile ? '2px inset #0080ff' : '2px outset var(--retro-gray)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          {selectedFile ? (
            <FileAudio style={{ width: '16px', height: '16px', color: 'white' }} />
          ) : (
            <Upload style={{ width: '16px', height: '16px', color: 'black' }} />
          )}
        </div>
        
        {selectedFile ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '11px' }}>
              {selectedFile.name}
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: 'var(--retro-dark-gray)' }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px' }}>
              {isDragging ? 'Drop file here' : 'Drag and drop an audio file here'}
            </p>
            <p style={{ margin: 0, fontSize: '10px', color: 'var(--retro-dark-gray)' }}>
              or click Browse below
            </p>
          </div>
        )}
        
        <input
          type="file"
          accept="audio/*,.wav,.mp3"
          onChange={handleFileSelect}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
      </div>

      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <button 
          className={`retro-button ${selectedFile ? 'retro-button-primary' : ''}`}
          style={{ fontSize: '11px' }}
        >
          {selectedFile ? 'Change File...' : 'Browse...'}
        </button>
      </div>

      <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: 'var(--retro-dark-gray)', textAlign: 'center' }}>
        Supported: WAV, MP3 (max 100MB)
      </p>
    </div>
  );
}