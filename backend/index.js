require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/Auth');
const documentRouter = require('./routes/Document');
const chatRouter = require('./routes/Chat');
const connectDB = require('./config/database');
const { cleanupOldDocuments } = require('./utils/cleanup');

const app = express();

connectDB();

// Server start hote hi cleanup
cleanupOldDocuments();

// Har 24 ghante cleanup
setInterval(cleanupOldDocuments, 24 * 60 * 60 * 1000);

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/document', documentRouter);
app.use('/api/v1/chat', chatRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
