import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './knowledgeprofile.css';

// Registering necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const KnowledgeProfile = () => {
  const { state } = useLocation();
  console.log('State:', state);
  const { questions = [], feedback = [] } = state || {};

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (questions.length && feedback.length) {
      axios.post('http://localhost:5000/knowledge_profile', { questions, feedback })
        .then(res => setProfile(res.data))
        .catch(err => console.error('Error loading profile', err));
    }
  }, [questions, feedback]);

  useEffect(() => {
    // Cleanup chart when the component unmounts
    return () => {
      if (window.Chart) {
        window.Chart.instances.forEach((chart) => {
          chart.destroy();
        });
      }
    };
  }, []);

  if (!profile) return <p className="loading-message">Loading feedback...</p>;

  const chartData = {
    labels: ["Correctness", "Depth", "Clarity"],
    datasets: [
      {
        label: "Skill Score (%)",
        data: [
          profile.skills_chart.correctness,
          profile.skills_chart.depth,
          profile.skills_chart.clarity
        ],
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"]
      }
    ]
  };

  return (
    <div className="knowledge-profile-container">
      <h2 className="knowledge-profile-title">Knowledge Profile</h2>

      <div className="section">
        <h3 className="section-heading mastered-title">✅ Mastered Topics:</h3>
        <ul className="topic-list">
          {profile.topics_mastered.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>

      <div className="section">
        <h3 className="section-heading improvement-title">⚠️ Needs Improvement:</h3>
        <ul className="topic-list">
          {profile.needs_improvement.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>

      <div className="section">
        <h3 className="section-heading tips-title">💡 LLM Tips:</h3>
        <ul className="topic-list">
          {profile.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </div>

      <div className="chart-section">
        <h3 className="section-heading">📊 Skill Breakdown</h3>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default KnowledgeProfile;
