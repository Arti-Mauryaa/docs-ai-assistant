const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document } = require("@langchain/core/documents");
const { TaskType } = require("@google/generative-ai");

require('dotenv').config();

// Gemini LLM for the response generation (Shifted to 1.5-flash to bypass 2.0 quota limits)
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0, 
  apiKey: process.env.GOOGLE_API_KEY
});

// Text splitter configuration
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Google embedding model instance
const embeddingsModel = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Function to create document chunks
const createDocumentChunks = async (text) => {
  const chunks = await textSplitter.splitText(text);
  return chunks.map(chunk => new Document({ pageContent: chunk }));
};

// Function to generate embeddings safely using correct instance variable (embeddingsModel)
const generateEmbeddings = async (documents) => {
  const embeddings = [];
  for (const doc of documents) {
    // FIX: Using embeddingsModel instead of undefined "embeddings"
    const embedding = await embeddingsModel.embedQuery(doc.pageContent);
    embeddings.push(embedding);
  }
  return embeddings;
};

const findSimilarDocuments = async (query, documents, topK = 3) => {
  // FIX: Using embeddingsModel instead of undefined "embeddings"
  const queryEmbedding = await embeddingsModel.embedQuery(query);

  // Calculate cosine similarity between query and documents
  const similarities = documents.map((doc, index) => ({
    document: doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding)
  }));

  // Sort by similarity score and return top K results
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

// Utility function to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB);
};

module.exports = {
  llm,
  textSplitter,
  embeddingsModel,
  generateEmbeddings,
  findSimilarDocuments,
  createDocumentChunks
};