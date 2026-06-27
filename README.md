# 📄 AI Document Chat (MERN + RAG + Gemini)

An AI-powered Retrieval-Augmented Generation (RAG) application built with the MERN stack. Users can upload PDF, DOCX, or TXT documents and ask natural language questions to receive context-aware answers powered by Google Gemini.

---

## 🌐 Live Demo

🚀 https://your-project.vercel.app


---

## 🚀 Features

- 🔐 JWT Authentication
- 📄 Upload PDF, DOCX & TXT documents
- 🤖 AI-powered document chat using Google Gemini
- 🧠 RAG with LangChain & FAISS Vector Store
- ✂️ Automatic document chunking & embeddings
- 💬 Chat history management
- 👤 User-specific document isolation
- 🗑️ Delete documents with automatic FAISS rebuild
- ⏳ Automatic cleanup of old documents
- 📱 Responsive UI

---

## ⭐ Tech Highlights

- Built a complete Retrieval-Augmented Generation (RAG) pipeline.
- Integrated Google Gemini for embeddings and response generation.
- Implemented semantic document search using FAISS.
- Secure authentication using JWT.
- Automatic document chunking and vector indexing.
- Production-ready backend with document cleanup and FAISS synchronization.

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer

### AI & Vector Database
- Google Gemini API
- LangChain
- FAISS

---

## ⚙️ Local Setup

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/MERN-RAG-Chatbot.git
cd MERN-RAG-Chatbot
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_API_KEY=your_gemini_key
FAISS_DB_PATH=./faissdb
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Deployment

### Frontend
- Vercel

### Backend
- Render

### Database
- MongoDB Atlas

---

## 🔮 Future Improvements

- Support multiple document collections
- Streaming AI responses
- OCR support for scanned PDFs
- Cloud file storage
- Admin dashboard

---

## 📚 Documentation

- 📖 Project Architecture → `ARCHITECTURE.md`
- 🤖 RAG Workflow & LLM Details → `LLM.md`

---

## 👩‍💻 Author

**Arti Maurya**

- GitHub: https://github.com/YOUR_GITHUB_USERNAME
- LinkedIn: https://linkedin.com/in/YOUR_LINKEDIN_PROFILE

---

⭐ If you found this project helpful, consider giving it a star.