const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const fs = require('fs');
const { Document } = require('../models/Document');
const { embeddingsModel } = require('./langchain');
require('dotenv').config();

// Initialize FAISS store instance
const getVectorStore = async () => {
  const directory = process.env.FAISS_DB_PATH || './faissdb';
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  try {
    const faissIndexPath = `${directory}/faiss.index`;
    if (!fs.existsSync(faissIndexPath)) {
      console.log("FAISS index file not found, returning null.");
      return null; // Indicate that no store exists yet
    }
    const vectorStore = await FaissStore.load(directory, embeddingsModel);
    return vectorStore;
  } catch (error) {
    console.log("Error loading FAISS store, likely not found:", error.message);
    return null; // Indicate that no store exists yet
  }
};

// Add document chunks to faiss db
const addDocumentChunks = async (chunks) => {
  let vectorStore = await getVectorStore();

  const documents = chunks.map(chunk => chunk.content);

  const metadatas = chunks.map(chunk => ({
    documentId: chunk.documentId.toString(),
    position: chunk.position,
    filename: chunk.filename || 'unknown' // Safeguard if filename isn't passed down
  }));

  // Prepare documents in Langchain format
  const langchainDocuments = documents.map((doc, index) => ({
    pageContent: doc,
    metadata: metadatas[index],
  }));

  // Ensure the directory exists for saving
  const directory = process.env.FAISS_DB_PATH || './faissdb';
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!vectorStore) {
    // If no existing store, create a new one from documents
    vectorStore = await FaissStore.fromDocuments(langchainDocuments, embeddingsModel);
  } else {
    // Otherwise, add documents to the existing store
    await vectorStore.addDocuments(langchainDocuments);
  }

  await vectorStore.save(directory);
  console.log("FAISS index saved successfully.");
};

// Query similar chunks
const querySimilarChunks = async (query, userId, n = 5) => {
  const vectorStore = await getVectorStore();

  // FIX: Defensive guard check to prevent reading properties of null crashing the server
  if (!vectorStore) {
    console.log("Query cancelled: No vector database index built yet.");
    return [];
  }

  const resultsWithScore = await vectorStore.similaritySearchWithScore(query, n);
  
  const results = resultsWithScore.map(([doc, score]) => {
    doc.score = score; // Attach score to the document object
    return doc;
  });

  // Filter results by userId
  const userDocuments = await Document.find({ userId: userId });
  const userDocumentIds = new Set(userDocuments.map(doc => doc._id.toString()));

  return results.filter(doc => userDocumentIds.has(doc.metadata.documentId));
};

// FAISS index rebuild karo remaining chunks se
const rebuildVectorStore = async () => {
  const directory = process.env.FAISS_DB_PATH || './faissdb';
  
  // Saare remaining chunks MongoDB se lo
  const { DocumentChunk } = require('../models/Document');
  const allChunks = await DocumentChunk.find({});

  if (allChunks.length === 0) {
    // Koi chunks nahi — FAISS files delete karo
    const faissIndexPath = `${directory}/faiss.index`;
    const docstorePath = `${directory}/docstore.json`;
    
    if (fs.existsSync(faissIndexPath)) fs.unlinkSync(faissIndexPath);
    if (fs.existsSync(docstorePath)) fs.unlinkSync(docstorePath);
    
    console.log("FAISS index cleared - no chunks remaining.");
    return;
  }

  // Naya FAISS index banao remaining chunks se
  const langchainDocuments = allChunks.map(chunk => ({
    pageContent: chunk.content,
    metadata: {
      documentId: chunk.documentId.toString(),
      position: chunk.position,
      filename: chunk.filename || 'unknown'
    }
  }));

  const vectorStore = await FaissStore.fromDocuments(langchainDocuments, embeddingsModel);
  await vectorStore.save(directory);
  console.log(`FAISS index rebuilt with ${allChunks.length} chunks.`);
};

module.exports = {
  getVectorStore,
  addDocumentChunks,
  querySimilarChunks,
  rebuildVectorStore,
};