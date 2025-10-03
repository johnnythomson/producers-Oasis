
import React from 'react';
import { Tab } from '../types';
import { TABS } from '../constants';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center border-b border-gray-700">
      <div className="flex space-x-2 sm:space-x-4" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center px-3 sm:px-4 py-3 text-sm sm:text-base font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-t-md ${
              activeTab.id === tab.id
                ? 'border-b-2 border-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            role="tab"
            aria-selected={activeTab.id === tab.id}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
