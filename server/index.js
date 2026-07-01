import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

import bcrypt from 'bcryptjs';
import User from './models/user.model.js';
import routes from './routes/route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080",
    credentials: true,
  },
});

// Map userId -> socketId for targeted notifications
export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }

  socket.on('disconnect', () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected`);
    }
  });
});

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api", routes);

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('Connected to MongoDB');
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Seeding default users...');
      
      const hrPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        employeeId: 'MGR001',
        name: 'HR Manager',
        email: 'hr@nexahr.com',
        password: hrPassword,
        role: 'Manager',
        isActive: true
      });
      
      const empPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        employeeId: 'EMP001',
        name: 'John Employee',
        email: 'employee@nexahr.com',
        password: empPassword,
        role: 'Employee',
        isActive: true
      });
      
      console.log('Database seeded successfully!');
    }
  } catch (seedErr) {
    console.error('Error seeding database:', seedErr);
  }
})
.catch((err) => console.error('Error connecting to MongoDB:', err));

app.get("/",(req,res) => {
    res.send("server is running");
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});