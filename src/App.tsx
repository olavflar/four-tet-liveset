import React, { useState } from 'react';
import CoolEditWindow from './components/cool-edit-window';

// Other existing imports

const App = () => {
  // Other existing state variables 
  const [coolEditVisible, setCoolEditVisible] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState<string>('main');
  // Other existing code...

  return (
    <div>
      {/* Other existing components... */}

      {/* Four Tet Liveset icon */}
      <div 
        className="retro-icon"
        onClick={() => {
          setCoolEditVisible(true);
          setFocusedWindow('cooledit');
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="retro-icon-image">🎛️</div>
        <span>Four Tet Liveset</span>
      </div>

      {/* Other existing components... */}

      {coolEditVisible && (
        <button 
          className={`retro-button ${focusedWindow === 'cooledit' ? 'retro-button-primary' : ''}`}
          onClick={() => setFocusedWindow('cooledit')}
          style={{ height: '24px', padding: '0 8px', fontSize: '10px' }}
        >
          Cool Edit Pro
        </button>
      )}

      {/* Cool Edit Pro Window */}
      <CoolEditWindow
        isVisible={coolEditVisible}
        onClose={() => setCoolEditVisible(false)}
        focusedWindow={focusedWindow}
        setFocusedWindow={setFocusedWindow}
      />

      {/* Other existing components... */}
    </div>
  );
};

export default App;