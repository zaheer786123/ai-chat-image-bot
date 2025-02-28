
import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import './App.css';

const App = () => {
  const [activeMode, setActiveMode] = useState<'chat' | 'upload' | 'generate' | null>(null);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {!activeMode && (
          <div className="welcome-section">
            <h2>What can I help?</h2>
            <div className="action-buttons">
              <button 
                className="action-button upload-button"
                onClick={() => setActiveMode('upload')}
              >
                <span className="icon">🖼️</span>
                Upload Image
              </button>
              <button 
                className="action-button generate-button"
                onClick={() => setActiveMode('generate')}
              >
                <span className="icon">🎨</span>
                Generate Image
              </button>
              <button 
                className="action-button chat-button"
                onClick={() => setActiveMode('chat')}
              >
                <span className="icon">💬</span>
                Let's Chat
              </button>
            </div>
          </div>
        )}
        {activeMode && <ChatInterface mode={activeMode} setMode={setActiveMode} />}
      </main>
    </div>
  );
};

export default App;
