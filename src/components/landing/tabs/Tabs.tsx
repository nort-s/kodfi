"use client";

import React, { useState } from 'react';

interface TabsProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
  defaultActiveTab?: string;
}

interface TabProps {
  label: string;
  name: string; // Nom unique pour l'onglet
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultActiveTab }) => {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.props.name);

  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.props.name}
            className={`px-6 py-3 text-lg font-medium transition-all duration-200 
                        ${activeTab === tab.props.name
                          ? 'border-b-4 border-brand-600 text-brand-700 dark:text-brand-500'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
            onClick={() => setActiveTab(tab.props.name)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.map((tab) => (
          <div key={tab.props.name} className={activeTab === tab.props.name ? 'block' : 'hidden'}>
            {tab.props.children}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};