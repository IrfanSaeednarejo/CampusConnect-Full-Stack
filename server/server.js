// Import Express
import express from 'express';

// Import Socket.IO Server class
import { Server } from 'socket.io';
// If we have to use cors as middleware --- so we can use in api
import cors from 'cors';


// Create Express app
const app = express();

// Server port
const PORT = 5000;

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },));

// Test route
app.get("/", (req, res) => {
  res.send("Campus Connect Server/Backend Setup Working🚀");
});

// Start HTTP server (IMPORTANT: use server.listen, not app.listen(which creates a new instance))
server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
