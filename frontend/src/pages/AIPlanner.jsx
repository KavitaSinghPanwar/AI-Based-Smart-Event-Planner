import React, { useState } from 'react';
import Header from '../components/Header';
import { 
  VenueRecommendations, 
  CrowdPrediction, 
  BudgetEstimation, 
  ScheduleGenerator 
} from '../components/AIPlannerTools';

const AIPlanner = () => {
  const [activeTab, setActiveTab] = useState('venue');

  const tabs = [
    { id: 'venue', label: 'Venue Recommendations' },
    { id: 'crowd', label: 'Crowd Turnout Predictor' },
    { id: 'budget', label: 'Budget Planner' },
    { id: 'schedule', label: 'Itinerary Generator' },
  ];

  return (
    <div className="main-layout">
      <Header title="AI Planning Suite" />
      
      <div className="content-body">
        {/* Navigation Tabs */}
        <div className="ai-planner-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div>
          {activeTab === 'venue' && <VenueRecommendations />}
          {activeTab === 'crowd' && <CrowdPrediction />}
          {activeTab === 'budget' && <BudgetEstimation />}
          {activeTab === 'schedule' && <ScheduleGenerator />}
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
