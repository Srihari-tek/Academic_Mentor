import React, { useState } from 'react';
import TopicSelector from './components/TopicSelector';
import ExplanationTabs from './components/ExplanationTabs';
import QuizPage from './components/Quiz';
import KnowledgeProfile from './components/KnowledgeProfile'; // ✅ Import knowledge profile
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function Home({ onTopicConfirmed }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">LLM Academic Assistant</h1>
      <TopicSelector onTopicConfirmed={onTopicConfirmed} />
    </div>
  );
}

function App() {
  const [selectedTopic, setSelectedTopic] = useState('');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onTopicConfirmed={setSelectedTopic} />} />
        <Route
          path="/explanation"
          element={<ExplanationTabs topic={selectedTopic} />}
        />
        <Route
          path="/quiz/:level"
          element={<QuizPage topic={selectedTopic} />}
        />
        <Route
          path="/profile"
          element={<KnowledgeProfile />} // ✅ New route for knowledge profile
        />
      </Routes>
    </Router>
  );
}

export default App;
