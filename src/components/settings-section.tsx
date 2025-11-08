interface SettingsSectionProps {
  minSilenceLen: number;
  silenceThresh: number;
  onMinSilenceLenChange: (value: number) => void;
  onSilenceThreshChange: (value: number) => void;
}

export function SettingsSection({ 
  minSilenceLen, 
  silenceThresh, 
  onMinSilenceLenChange, 
  onSilenceThreshChange 
}: SettingsSectionProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Minimum Silence Length */}
      <div>
        <label style={{ 
          fontWeight: 'bold', 
          fontSize: '11px',
          display: 'block',
          marginBottom: '6px'
        }}>
          Min. Silence Length:
        </label>
        <div style={{ marginBottom: '8px' }}>
          <input
            type="range"
            min={100}
            max={2000}
            step={50}
            value={minSilenceLen}
            onChange={(e) => onMinSilenceLenChange(Number(e.target.value))}
            className="retro-slider"
            style={{ width: '100%' }}
          />
        </div>
        <div className="retro-inset" style={{ 
          textAlign: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          background: '#001100',
          color: '#00ff00',
          fontFamily: '"Courier New", monospace',
          padding: '4px'
        }}>
          {minSilenceLen} ms
        </div>
        <p style={{ fontSize: '10px', marginTop: '6px', color: 'var(--retro-dark-gray)' }}>
          Duration of silence needed to split
        </p>
      </div>

      {/* Silence Threshold */}
      <div>
        <label style={{ 
          fontWeight: 'bold', 
          fontSize: '11px',
          display: 'block',
          marginBottom: '6px'
        }}>
          Silence Threshold:
        </label>
        <div style={{ marginBottom: '8px' }}>
          <input
            type="range"
            min={-60}
            max={-10}
            step={1}
            value={silenceThresh}
            onChange={(e) => onSilenceThreshChange(Number(e.target.value))}
            className="retro-slider"
            style={{ width: '100%' }}
          />
        </div>
        <div className="retro-inset" style={{ 
          textAlign: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          background: '#001100',
          color: '#00ff00',
          fontFamily: '"Courier New", monospace',
          padding: '4px'
        }}>
          {silenceThresh} dB
        </div>
        <p style={{ fontSize: '10px', marginTop: '6px', color: 'var(--retro-dark-gray)' }}>
          Volume level considered silence
        </p>
      </div>
    </div>
  );
}