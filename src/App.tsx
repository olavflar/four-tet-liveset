import { useState, useRef } from 'react';
import { AudioWaveform, Folder, Settings, Music, Download } from 'lucide-react';
import { DraggableWindow } from './components/draggable-window';
import { UploadSection } from './components/upload-section';
import { SettingsSection } from './components/settings-section';
import { ResultsSection } from './components/results-section';
import { AppToaster } from './components/toaster';
import { AudioProcessor, AudioSample } from './utils/audio-processor';
import { ZipCreator } from './utils/zip-creator';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [minSilenceLen, setMinSilenceLen] = useState(500);
  const [silenceThresh, setSilenceThresh] = useState(-40);
  const [samples, setSamples] = useState<AudioSample[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<string>('main');
  const audioProcessorRef = useRef<AudioProcessor | null>(null);

  const generateSamplePack = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    try {
      if (!audioProcessorRef.current) {
        audioProcessorRef.current = new AudioProcessor();
      }

      toast.info('Processing audio file...');
      
      const processedSamples = await audioProcessorRef.current.processFile(
        selectedFile,
        minSilenceLen,
        silenceThresh
      );

      if (processedSamples.length === 0) {
        toast.warning('No samples found. Try adjusting the silence detection settings.');
        setSamples([]);
      } else {
        setSamples(processedSamples);
        toast.success(`Successfully created ${processedSamples.length} samples!`);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process audio file');
      setSamples([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSamplePack = async () => {
    if (samples.length === 0) return;

    try {
      toast.info('Creating sample pack...');
      
      const zipBlob = await ZipCreator.createSamplePackZip(
        samples, 
        selectedFile?.name || 'audio'
      );
      
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sample_pack_${selectedFile?.name?.split('.')[0] || 'audio'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Sample pack downloaded successfully!');
    } catch (error) {
      console.error('Error creating zip:', error);
      toast.error('Failed to create sample pack');
    }
  };

  const getZIndex = (windowId: string) => {
    return focusedWindow === windowId ? 1000 : 
           windowId === 'main' ? 999 : 
           windowId === 'results' ? 998 : 997;
  };

  return (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      position: 'relative',
      fontFamily: '"MS Sans Serif", "Tahoma", sans-serif',
      overflow: 'hidden'
    }}>
      {/* Background Desktop Icons */}
      <div style={{ 
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 1
      }}>
        <div className="retro-icon">
          <div className="retro-icon-image">🖥️</div>
          <span>My Computer</span>
        </div>
        <div className="retro-icon">
          <div className="retro-icon-image">🗂️</div>
          <span>My Documents</span>
        </div>
        <div className="retro-icon">
          <div className="retro-icon-image">🗑️</div>
          <span>Recycle Bin</span>
        </div>
        <div className="retro-icon">
          <div className="retro-icon-image">🎵</div>
          <span>Sample Pack Creator</span>
        </div>
      </div>

      {/* Taskbar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30px',
        background: 'var(--retro-gray)',
        border: '2px outset var(--retro-gray)',
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        gap: '4px',
        zIndex: 10000
      }}>
        <button 
          className="retro-button"
          style={{ 
            height: '24px',
            padding: '0 8px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          Start
        </button>
        <div style={{ width: '2px', height: '20px', background: 'var(--retro-dark-gray)' }} />
        <button 
          className={`retro-button ${focusedWindow === 'main' ? 'retro-button-primary' : ''}`}
          onClick={() => setFocusedWindow('main')}
          style={{ height: '24px', padding: '0 8px', fontSize: '10px' }}
        >
          Sample Pack Creator
        </button>
        {samples.length > 0 && (
          <button 
            className={`retro-button ${focusedWindow === 'results' ? 'retro-button-primary' : ''}`}
            onClick={() => setFocusedWindow('results')}
            style={{ height: '24px', padding: '0 8px', fontSize: '10px' }}
          >
            Generated Samples ({samples.length})
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div className="retro-inset" style={{ 
            padding: '2px 6px', 
            fontSize: '10px',
            background: '#001100',
            color: '#00ff00',
            fontFamily: '"Courier New", monospace'
          }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Main Audio Processor Window */}
      <DraggableWindow
        title="Sample Pack Creator v1.0"
        icon={<AudioWaveform style={{ width: '16px', height: '16px' }} />}
        initialPosition={{ x: 100, y: 50 }}
        width="600px"
        height="500px"
        zIndex={getZIndex('main')}
        onFocus={() => setFocusedWindow('main')}
        statusBar={
          <>
            <div className="retro-status-section">Ready</div>
            <div className="retro-status-section">
              {selectedFile ? `File: ${selectedFile.name}` : 'No file selected'}
            </div>
            <div className="retro-status-section">{samples.length} samples</div>
          </>
        }
      >
        {/* Menu Bar */}
        <div style={{ 
          background: 'var(--retro-gray)',
          borderBottom: '1px solid var(--retro-dark-gray)',
          padding: '2px 4px',
          fontSize: '11px',
          display: 'flex',
          gap: '12px'
        }}>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }}>File</span>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }}>Edit</span>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }}>Options</span>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }}>Help</span>
        </div>

        {/* Main Content */}
        <div className="retro-panel" style={{ padding: '12px', height: 'calc(100% - 25px)', overflow: 'auto' }}>
          {/* Upload Section */}
          <div className="retro-outset" style={{ marginBottom: '12px' }}>
            <div style={{ 
              background: '#008080', 
              color: 'white',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              <Folder style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
              Audio Input
            </div>
            <div style={{ padding: '8px' }}>
              <UploadSection
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="retro-outset" style={{ marginBottom: '12px' }}>
            <div style={{ 
              background: '#008080', 
              color: 'white',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              <Settings style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
              Detection Settings
            </div>
            <div style={{ padding: '8px' }}>
              <SettingsSection
                minSilenceLen={minSilenceLen}
                silenceThresh={silenceThresh}
                onMinSilenceLenChange={setMinSilenceLen}
                onSilenceThreshChange={setSilenceThresh}
              />
            </div>
          </div>

          {/* Process Button */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <button
              onClick={generateSamplePack}
              disabled={!selectedFile || isProcessing}
              className={`retro-button ${(!selectedFile || isProcessing) ? '' : 'retro-button-primary'}`}
              style={{ 
                fontSize: '11px',
                padding: '4px 16px',
                minWidth: '140px'
              }}
            >
              {isProcessing ? 'Processing...' : 'Generate Sample Pack'}
            </button>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div style={{ marginBottom: '12px' }}>
              <div className="retro-progress">
                <div className="retro-progress-bar" style={{ width: '100%', animation: 'pulse 1s infinite' }} />
              </div>
              <p style={{ fontSize: '10px', textAlign: 'center', margin: '4px 0' }}>
                Analyzing audio file and detecting silence...
              </p>
            </div>
          )}
        </div>
      </DraggableWindow>

      {/* Results Window - Only show when samples exist */}
      {samples.length > 0 && (
        <DraggableWindow
          title="Generated Samples"
          icon={<Music style={{ width: '16px', height: '16px' }} />}
          initialPosition={{ x: 150, y: 100 }}
          width="650px"
          height="400px"
          zIndex={getZIndex('results')}
          onFocus={() => setFocusedWindow('results')}
          statusBar={
            <>
              <div className="retro-status-section">{samples.length} items</div>
              <div className="retro-status-section">
                {(samples.reduce((acc, sample) => acc + sample.duration_ms, 0) / 1000).toFixed(1)}s total
              </div>
              <div className="retro-status-section">Ready for download</div>
            </>
          }
        >
          <div className="retro-panel" style={{ padding: '12px', height: '100%', overflow: 'auto' }}>
            <ResultsSection 
              samples={samples} 
              isProcessing={isProcessing} 
              onDownload={downloadSamplePack}
            />
          </div>
        </DraggableWindow>
      )}


      
      <AppToaster />
    </div>
  );
}