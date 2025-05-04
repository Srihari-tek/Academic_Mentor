import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ExplanationTabs({ topic }) {
  const [explanations, setExplanations] = useState({});
  const [activeTab, setActiveTab] = useState('beginner');
  const navigate = useNavigate();

  useEffect(() => {
    if (topic) {
      axios
        .post('http://localhost:5000/explanation', { topic })
        .then((res) => {
          console.log('Fetched explanations:', res.data); // Debugging line
          setExplanations(res.data);
        })
        .catch((err) => console.error('Error fetching explanation:', err));
    }
  }, [topic]);

  const renderFormatted = (text) => {
    if (!text) return { __html: 'Loading...' };

    // Format markdown-like text to HTML
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
      .replace(/(?:^|\n)[*•\-] (.+)/g, '<li>$1</li>') // bullets
      .replace(/\n{2,}/g, '</ul><ul>') // break lists
      .replace(/\n/g, '<br/>'); // line breaks

    return { __html: `<ul>${formatted}</ul>` };
  };

  if (!topic) return null;

  return (
    <div className="mt-6 p-4 border rounded bg-white shadow">
      <div className="flex space-x-4 mb-4">
        {['beginner', 'intermediate', 'advanced'].map((level) => (
          <button
            key={level}
            onClick={() => setActiveTab(level)}
            className={`px-4 py-2 rounded ${
              activeTab === level ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="text-gray-800 prose max-w-none mb-4"
        dangerouslySetInnerHTML={renderFormatted(explanations[activeTab])}
      />

      <button
        onClick={() => navigate(`/quiz/${activeTab}`)}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        Take Quiz
      </button>
    </div>
  );
}
