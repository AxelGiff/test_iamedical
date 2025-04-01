import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import '../App.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isMarkdown = (text) => /[#*_>`-]/.test(text);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message) => {
    try {
      setIsLoading(true);
      const response = await axios.post('https://15af0837fca124cf6d.gradio.live/gradio_api/run/predict', {
        data: [message, null],
        fn_index: 0
      });
      const botResponse = response.data.data[0];
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: message },
        { sender: 'bot', text: botResponse }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur:", error);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: message },
        { sender: 'bot', text: "Désolé, une erreur s'est produite. Veuillez réessayer." }
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="no-messages-view">
          <div className="welcome-message">
            <p>Bonjour ! Comment puis-je vous aider aujourd'hui ?</p>
          </div>
          <div className="input-container centered">
            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tapez votre message ici..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || inputMessage.trim() === ''}>
                Envoyer
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <h2>Medic.ial</h2>
          </div>
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {isMarkdown(msg.text) ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-content loading">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-container">
            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tapez votre message ici..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || inputMessage.trim() === ''}>
                Envoyer
              </button>
            </form>
          </div>
        </>
      )}

      {/* Les composants AddUser et UserList */}
      <AddUser />
      <UserList />
    </div>
  );
};

const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/.netlify/functions/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Add User</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add User</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/.netlify/functions/get_users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('An error occurred while fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user[1]} - {user[2]}</li>
        ))}
      </ul>
    </div>
  );
};

export default ChatInterface;
