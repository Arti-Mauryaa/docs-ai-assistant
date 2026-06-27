const { Document, DocumentChunk } = require('../models/Document');
const { rebuildVectorStore } = require('../config/vectorStore');

const cleanupOldDocuments = async () => {
  try {
    console.log(' Cleanup started...');

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const oldDocs = await Document.find({
      createdAt: { $lt: sevenDaysAgo }
    });

    if (oldDocs.length === 0) {
      console.log('No old documents found.');
      return;
    }

    const oldDocIds = oldDocs.map(doc => doc._id);

    await DocumentChunk.deleteMany({
      documentId: { $in: oldDocIds }
    });

    await Document.deleteMany({
      _id: { $in: oldDocIds }
    });

    console.log(`${oldDocs.length} old documents deleted.`);

    await rebuildVectorStore();
    console.log('FAISS rebuilt successfully.');

  } catch (error) {
    console.error(' Cleanup error:', error);
  }
};

module.exports = { cleanupOldDocuments };