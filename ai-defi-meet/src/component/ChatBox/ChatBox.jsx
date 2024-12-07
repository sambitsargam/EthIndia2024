import { useDataMessage, useLocalPeer } from '@huddle01/react/hooks';
import { useState } from 'react';
import LocalMessageBubble from './LocalMessageBubble';
import RemoteMessageBubble from './RemoteMessageBubble';

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false); // State to prevent double sending

  const { peerId } = useLocalPeer();
  const { sendData } = useDataMessage({
    onMessage: (payload, from, label) => {
      if (label === 'chat') {
        setMessages((prev) => [...prev, { text: payload, sender: from }]);
      }
    },
  });

  // Function to send message
  const sendMessage = async () => {
    if (isSending || text.trim() === '') return; // Prevent sending when already sending

    setIsSending(true); // Set sending state to true

    // Send the local message first
    setMessages((prev) => [...prev, { text, sender: peerId }]);

    try {
      // Send message to the backend AI API localhost 3000
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response to the chat
        setMessages((prev) => [
          ...prev,
          { text: data.response, sender: 'AI' },
        ]);
      } else {
        console.error('AI response error:', data);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
    }

    setIsSending(false); // Reset sending state
    setText(''); // Clear the input field
  };

  return (
    <div className="chat-container">
      {/* Fixing the position to the right and taking 32% of the width */}
      <div className="chat-box">
        <h1 className="text-center text-2xl my-2 border-b border-blue-400">
          Chat Room
        </h1>
        <div className="messages-container">
          {messages.map((message, index) =>
            message.sender === peerId ? (
              <LocalMessageBubble key={index} message={message} />
            ) : (
              <RemoteMessageBubble key={index} message={message} />
            )
          )}
        </div>
        <div className="input-container">
          <input
            type="text"
            className="message-input"
            placeholder="Type Message..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                sendMessage(); // Send message when Enter is pressed
              }
            }}
          />
          <button
            onClick={() => {
              sendMessage(); // Send message on button click
            }}
            disabled={isSending || !text.trim()} // Disable if sending or input is empty
            className="send-button"
          >
            <svg
              width="24"
              height="24"
              viewBox="-2.4 -2.4 28.80 28.80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#000000"
              strokeWidth="0.00024000000000000003"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.265 4.42619C1.04293 2.87167 2.6169 1.67931 4.05323 2.31397L21.8341 10.1706C23.423 10.8727 23.423 13.1273 21.8341 13.8294L4.05323 21.686C2.6169 22.3207 1.04293 21.1283 1.265 19.5738L1.99102 14.4917C2.06002 14.0087 2.41458 13.6156 2.88791 13.4972L8.87688 12L2.88791 10.5028C2.41458 10.3844 2.06002 9.99129 1.99102 9.50829L1.265 4.42619ZM21.0257 12L3.2449 4.14335L3.89484 8.69294L12.8545 10.9328C13.9654 11.2106 13.9654 12.7894 12.8545 13.0672L3.89484 15.3071L3.2449 19.8566L21.0257 12Z"
                fill="#ffffff"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
