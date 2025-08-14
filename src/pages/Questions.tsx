import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const AdminDashboard = () => {
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [qaEntries, setQaEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("unanswered");
  const [isLoading, setIsLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [answeringQuestion, setAnsweringQuestion] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("mitAdminUser") || "{}");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
    };

    try {
      const [unansweredResponse, qaResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/unanswered-questions`, config),
        axios.get(`${API_BASE}/api/admin/qa-entries`, config),
      ]);

      setUnansweredQuestions(unansweredResponse.data.data);
      setQaEntries(qaResponse.data.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("mitAdminUser");
        navigate("/admin/login");
      } else {
        console.error("Error fetching data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerQuestion = async (questionId: number) => {
    if (!answerText.trim()) return;

    const token = user.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      await axios.post(
        `${API_BASE}/api/admin/answer-question/${questionId}`,
        { answer: answerText },
        config
      );

      setAnswerText("");
      setAnsweringQuestion(null);
      fetchData();
    } catch (error) {
      console.error("Error answering question:", error);
      alert("Error answering question. Please try again.");
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-tabs">
        <button
          className={activeTab === "unanswered" ? "active" : ""}
          onClick={() => setActiveTab("unanswered")}
        >
          Unanswered Questions ({unansweredQuestions.length})
        </button>
        <button
          className={activeTab === "qa" ? "active" : ""}
          onClick={() => setActiveTab("qa")}
        >
          Q&A Database ({qaEntries.length})
        </button>
      </div>

      {activeTab === "unanswered" && (
        <div className="tab-content">
          {unansweredQuestions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No unanswered questions</h3>
              <p>All student questions have been answered!</p>
            </div>
          ) : (
            <div className="questions-list">
              {unansweredQuestions.map((question: any) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-date">
                      {formatDate(question.created_at)}
                    </span>
                    <span className="user-id">User #{question.user_id}</span>
                  </div>

                  <div className="question-content">
                    <h4>Question:</h4>
                    <p>{question.question}</p>
                  </div>

                  {answeringQuestion === question.id ? (
                    <div className="answer-form">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={4}
                      />
                      <div className="answer-actions">
                        <button
                          onClick={() => handleAnswerQuestion(question.id)}
                          className="submit-answer"
                          disabled={!answerText.trim()}
                        >
                          Submit Answer
                        </button>
                        <button
                          onClick={() => {
                            setAnsweringQuestion(null);
                            setAnswerText("");
                          }}
                          className="cancel-answer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAnsweringQuestion(question.id)}
                      className="answer-btn"
                    >
                      Answer Question
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "qa" && (
        <div className="tab-content">
          {qaEntries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💡</div>
              <h3>No Q&A entries yet</h3>
              <p>
                Start answering student questions to build the knowledge base!
              </p>
            </div>
          ) : (
            <div className="qa-list">
              {qaEntries.map((entry: any) => (
                <div key={entry.id} className="qa-card">
                  <div className="qa-question">
                    <h4>Q:</h4>
                    <p>{entry.question}</p>
                  </div>
                  <div className="qa-answer">
                    <h4>A:</h4>
                    <p>{entry.answer}</p>
                  </div>
                  <div className="qa-date">
                    Added: {formatDate(entry.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
