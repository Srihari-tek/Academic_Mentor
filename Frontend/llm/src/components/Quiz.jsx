import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';
import { useNavigate } from 'react-router-dom';


export default function Quiz({ topic }) {
  const { level } = useParams();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    if (topic) {
      axios
        .post('http://localhost:5000/generate_quiz', { topic })
        .then((res) => {
          setQuestions(res.data[level] || []);
          setSelectedAnswers({});
          setFeedback([]);
          setSubmitted(false);
        })
        .catch((err) => console.error('Quiz fetch error:', err));
    }
  }, [level, topic]);

  const handleSelect = (qIndex, optionKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: optionKey
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const response = await axios.post('http://localhost:5000/evaluate_answers', {
        questions,
        answers: selectedAnswers
      });
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Evaluation error:', error);
    }
  };

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Quiz - {level}</h2>

      {!questions.length && <p className="loading-message">Loading quiz...</p>}

      {questions.map((q, index) => (
        <div key={index} className="question-card">
          <p className="question-text">{index + 1}. {q.question}</p>
          <div className="options-grid">
            {Object.entries(q.options).map(([key, text]) => (
              <button
                key={key}
                onClick={() => handleSelect(index, key)}
                className={`option-button ${selectedAnswers[index] === key ? 'selected' : ''} ${submitted ? 'disabled' : ''}`}
                disabled={submitted}
              >
                {key}. {text}
              </button>
            ))}
          </div>

          {submitted && feedback[index] && (
            <div className="feedback">
              <p className="feedback-correctness"><strong>✅ Correctness:</strong> {feedback[index].correctness}</p>
              <p className="feedback-depth"><strong>📘 Technical Depth:</strong> {feedback[index].depth}</p>
              <p className="feedback-clarity"><strong>✨ Clarity:</strong> {feedback[index].clarity}</p>
              <p className="feedback-comment text-blue-700 mt-1"><strong>💬 Feedback:</strong> {feedback[index].comment}</p>
            </div>
          )}
        </div>
      ))}

      {!submitted && questions.length > 0 && (
        <div className="submit-button-container">
          <button
            onClick={handleSubmit}
            className="submit-button"
          >
            Submit Quiz
          </button>
        </div>
      )}

      {submitted && feedback.length > 0 && (
        <div className="view-profile-container mt-4">
          <button
            className="view-profile-button bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() =>
              navigate('/profile', {
                state: { questions, feedback }
              })
            }>
            View Knowledge Profile
          </button>
        </div>
      )}

    </div>
  );
}
