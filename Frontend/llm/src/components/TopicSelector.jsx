import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const topics = [
  'Operating Systems',
  'Data Structures',
  'Algorithms',
  'DBMS',
  'Computer Networks',
  'OOPs',
  'Machine Learning'
];

const TopicSelector = ({ onTopicConfirmed }) => {
  const [topic, setTopic] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!topic) return;

    try {
      await axios.post('http://localhost:5000/topic', { topic });
      onTopicConfirmed(topic); // Update state in App
      navigate('/explanation'); // Route to ExplanationTabs
    } catch (error) {
      console.error('Failed to send topic:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <select
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="p-2 border border-gray-300 rounded"
      >
        <option value="">-- Select a Topic --</option>
        {topics.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Confirm Topic
      </button>
    </div>
  );
};

export default TopicSelector;
