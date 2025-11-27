import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ImageGenerator } from './features/ImageGenerator';
import { ImageEditor } from './features/ImageEditor';
import { ImageAnalyzer } from './features/ImageAnalyzer';
import { AppMode } from './types';

const App: React.FC = () => {
  // Simple state-based routing for a single-page feel
  const [activeMode, setActiveMode] = useState<string>(AppMode.GENERATE);

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.GENERATE:
        return <ImageGenerator />;
      case AppMode.EDIT:
        return <ImageEditor />;
      case AppMode.ANALYZE:
        return <ImageAnalyzer />;
      default:
        return <ImageGenerator />;
    }
  };

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;