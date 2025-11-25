// // Import React (required for JSX)
// import React, { useEffect, useState } from "react";

// // Import SCSS from the correct relative path
// import "../../styles/components/chat.scss";

// import { io } from 'socket.io-client';
// import ChatLayout from './ChatLayout';

// // Import JSON data instead of JSX
// import mockUsers from '../data/mockUser.json';
// import mockGroups from '../data/mockGroup.json';
// import mockMessages from '../data/mockMessages.json';

// /**
//  * Main ChatApp component - represents the chat interface
//  * Handles socket connections and manages chat state
//  */
// const ChatApp = () => {
//   const [messages, setMessages] = useState([]);
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   // Convert JSON date strings back to Date objects
//   const processedMockMessages = {};
//   Object.keys(mockMessages).forEach(key => {
//     processedMockMessages[key] = mockMessages[key].map(msg => ({
//       ...msg,
//       timestamp: new Date(msg.timestamp)
//     }));
//   });

//   const processedMockUsers = mockUsers.map(user => ({
//     ...user,
//     timestamp: new Date(user.timestamp)
//   }));

//   const processedMockGroups = mockGroups.map(group => ({
//     ...group,
//     timestamp: new Date(group.timestamp)
//   }));

//   useEffect(() => {
//     // Create socket connection inside useEffect
//     const newSocket = io("http://localhost:5000", {
//       transports: ["websocket"], // ensures websocket transport
//     });

//     // Set socket in state for later use
//     setSocket(newSocket);

//     // Listen for successful connection
//     newSocket.on("connect", () => {
//       console.log("Socket connected with id:", newSocket.id);
//       setIsConnected(true);
      
//       // Join user to their room or perform initial setup
//       newSocket.emit("join", { userId: "user123" });
//     });

//     // Listen for incoming messages
//     newSocket.on("message", (data) => {
//       console.log("Received message:", data);
//       // Update messages state with new message
//       setMessages(prevMessages => [...prevMessages, data]);
//     });

//     // Listen for user status updates
//     newSocket.on("userStatus", (data) => {
//       console.log("User status update:", data);
//       // Handle user online/offline status
//     });

//     // Listen for disconnection
//     newSocket.on("disconnect", () => {
//       console.log("Disconnected from server");
//       setIsConnected(false);
//     });

//     // Handle connection errors
//     newSocket.on("connect_error", (error) => {
//       console.error("Socket connection error:", error);
//       setIsConnected(false);
//     });

//     // Cleanup on unmount
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []); // Empty dependency array ensures this runs only once

//   /**
//    * Function to send messages via socket
//    * @param {Object} messageData - The message data to send
//    */
//   const sendMessage = (messageData) => {
//     if (socket && isConnected) {
//       socket.emit("sendMessage", {
//         ...messageData,
//         timestamp: new Date().toISOString(),
//         messageId: Date.now().toString() // Simple ID generation
//       });
//     } else {
//       console.warn("Socket not connected - message not sent");
//       // In a real app, you might queue messages or show an error
//     }
//   };

//   /**
//    * Function to simulate receiving a message (for testing)
//    */
//   const simulateIncomingMessage = () => {
//     const mockMessage = {
//       id: Date.now(),
//       text: "This is a test message from the server",
//       sender: "other",
//       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       isOwn: false
//     };
//     setMessages(prev => [...prev, mockMessage]);
//   };

//   // Return JSX for rendering the UI
//   return (
//     <div className="chatApp-container">
//       {/* Connection status indicator (optional - for debugging) */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className={`connection-status ${!isConnected ? 'disconnected' : ''}`}>
//           {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
//         </div>
//       )}
      
//       {/* Main chat interface */}
//       <div className="chat-app">
//         <ChatLayout 
//           messages={messages}
//           onSendMessage={sendMessage}
//           socket={socket}
//           isConnected={isConnected}
//           onSimulateMessage={simulateIncomingMessage}
//           mockUsers={processedMockUsers}
//           mockGroups={processedMockGroups}
//           mockMessages={processedMockMessages}
//         />
//       </div>
//     </div>
//   );
// };

// // Export the component so it can be imported in main.jsx
// export default ChatApp;