import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
interface Message {
  id: number;
  content: string;
  is_bot: boolean;
  created_at: string | Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [username, setUsername] = useState("");
  const [isExistingStudent, setIsExistingStudent] = useState(false);
  const [step, setStep] = useState("username");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("mitChatBotUser") || "{}");

  useEffect(() => {
    const storedIdentifier = user.unique_identifier;
    const backendIdentifier = user.unique_identifier ?? user.username;
    if (storedIdentifier) {
      setUsername(user.username);
      setUserIdentifier(storedIdentifier);
      setIsNewUser(false);
      setStep("chat");
      loadChatHistory(backendIdentifier);
    } else {
      setShowUsernameForm(true);
    }
  }, [user.unique_identifier]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async (identifier: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/messages/${identifier}`
      );
      const backendMessages = response.data.data || [];

      setMessages((prev) => {
        const prevArr = prev ?? [];

        const existingIds = new Set(prevArr.map((m) => m.id));

        const newBackend = backendMessages.filter(
          (m: { id: number }) => !existingIds.has(m.id)
        );
        const merged = [...newBackend, ...prevArr];

        // If you prefer backend (newer) last, do:
        // const merged = [...prevArr, ...newBackend];
        merged.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return merged;
      });
    } catch (error) {
      setErrorMessage("Error loading chat history");
      console.error("Error loading chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setStep("student_type");
    setMessages([
      {
        id: Date.now(),
        content: `Hi ${username}! Are you a new or existing student?`,
        is_bot: true,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handleStudentTypeSelection = async (isExisting: boolean) => {
    setIsExistingStudent(isExisting);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/student`, {
        username: username.toLowerCase(),
        is_existing_student: isExisting,
      });
      const data = response.data.data;
      const identifier = data.unique_identifier;
      setUserIdentifier(identifier);
      localStorage.setItem("mitChatBotUser", JSON.stringify(data));

      const welcomeMessage = isExisting
        ? `Welcome, ${username}. I'm Kee, I'm here to help answer any questions you might have. How can I help you today?`
        : `Welcome to our university, ${username}! I'm Kee, I'm here to help answer any questions you might have. What would you like to know?`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: welcomeMessage,
          is_bot: true,
          created_at: new Date().toISOString(),
        },
      ]);

      setStep("chat");
      setShowUsernameForm(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.response?.status === 400) {
        alert("Username already exists. Please choose a different one.");
        setStep("username");
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      is_bot: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE}/api/message/`, {
        content: inputValue,
        user_identifier: userIdentifier,
      });

      const botMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        is_bot: true,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        content:
          "Sorry, I'm having trouble responding right now. Please try again.",
        is_bot: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (showUsernameForm && step === "username") {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h2>MIT Smart Chatbot Assistant</h2>
        </div>
        <div className="welcome-form">
          <h3>Welcome! Let's get started</h3>
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="username-input"
              required
            />
            <button type="submit" className="submit-btn">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "student_type") {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h2>MIT Smart Chatbot Assistant</h2>
        </div>
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.is_bot ? "bot" : "user"}`}
            >
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {formatTime(message.created_at)}
              </div>
            </div>
          ))}
        </div>
        <div className="student-type-buttons">
          <button
            onClick={() => handleStudentTypeSelection(false)}
            className="student-type-btn new-student"
          >
            New Student
          </button>
          <button
            onClick={() => handleStudentTypeSelection(true)}
            className="student-type-btn existing-student"
          >
            Existing Student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>MIT Smart Chatbot Assistant</h2>
        <span className="user-info">Hello, {username.toUpperCase()}!</span>
      </div>

      <div className="messages-container">
        {isLoading && (
          <div className="admin-dashboard">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading chat history...</p>
            </div>
          </div>
        )}
        {errorMessage && <p>{errorMessage}</p>}
        {!isLoading &&
          !errorMessage &&
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.is_bot ? "bot" : "user"}`}
            >
              <div
                className="message-content"
                dangerouslySetInnerHTML={{ __html: message.content }}
              ></div>
              <div className="message-time">
                {formatTime(message.created_at)}
              </div>
            </div>
          ))}

        {isTyping && (
          <div className="message bot typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};
