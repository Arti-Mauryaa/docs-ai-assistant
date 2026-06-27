const { ChatSession } = require('../models/Chat');
const { llm } = require('../config/langchain');
const { querySimilarChunks } = require('../config/vectorStore');

const createSession = async (req, res) => {
  try {
    const session = new ChatSession({
      userId: req.user._id,
      title: req.body.title || 'New Chat'
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat session' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const relevantDocs = await querySimilarChunks(message, req.user._id) || [];

    // FIX 1: Safe extraction and trimming for Token Quota protection
    const context = relevantDocs
      .map(doc => (doc.pageContent ? doc.pageContent.substring(0, 400) : ''))
      .filter(Boolean)
      .join('\n\n')
      .substring(0, 1200);

    // FIX 2: Correct role mapping for Google Gemini API compatibility
    const recentHistory = session.messages.slice(-4).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user', // LangChain-Gemini expects 'model' instead of 'assistant'
      content: msg.content
    }));

    // Invoke LLM safely
    const response = await llm.invoke([
      {
        role: 'system',
        content: `You are a helpful AI assistant. Use this context to answer efficiently:\n${context || "No context available."}`
      },
      ...recentHistory,
      {
        role: 'user',
        content: message
      }
    ]);

    console.log("Response:", response.content);

    // Save messages to MongoDB session
    session.messages.push(
      { role: 'user', content: message },
      {
        role: 'assistant',
        content: response.content,
        sourceDocs: relevantDocs.map(doc => ({
          documentId: doc.metadata?.documentId || null,
          relevanceScore: doc.score || 0
        }))
      }
    );

    await session.save();

    res.json({
      message: response.content,
      sources: relevantDocs.map(doc => ({
        documentId: doc.metadata?.documentId || null,
        filename: doc.metadata?.filename || 'Document Chunk',
        relevanceScore: doc.score || 0
      }))
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error processing message' });
  }
};

const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user._id
    }).populate('messages.sourceDocs.documentId', 'filename');

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOneAndDelete({ _id: sessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    console.log("deleted");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting chat session' });
  }
};

const editSessionTitle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId: req.user._id },
      { title },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Error updating chat session title' });
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id })
      .select('_id title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat sessions' });
  }
};

module.exports = {
  createSession,
  sendMessage,
  getHistory,
  getSessions,
  deleteSession,
  editSessionTitle
};