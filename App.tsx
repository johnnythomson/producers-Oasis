
import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import ChordGenerator from './components/ChordGenerator';
import VibeGenerator from './components/VibeGenerator';
import BlockBreaker from './components/BlockBreaker';
import SchedulePlanner from './components/SchedulePlanner';
import { Tab } from './types';
import { TABS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);

  const renderContent = () => {
    switch (activeTab.id) {
      case 'chords':
        return <ChordGenerator />;
      case 'vibe':
        return <VibeGenerator />;
      case 'breaker':
        return <BlockBreaker />;
      case 'schedule':
        return <SchedulePlanner />;
      default:
        return <ChordGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <Header />
        <main className="mt-8">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl shadow-purple-500/10 border border-gray-700/50 p-6 sm:p-8 min-h-[500px]">
            {renderContent()}
          </div>
        </main>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Producer's Oasis &copy; {new Date().getFullYear()}. Fuel your creativity.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
