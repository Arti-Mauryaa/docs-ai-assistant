# Large Language Model (LLM) Usage in the MERN RAG Chatbot

This document explains how **Google Gemini** and **LangChain** are used within the MERN RAG Chatbot to provide intelligent, document-aware conversations using the **Retrieval Augmented Generation (RAG)** approach.

## 1. Core Functionality: Conversational AI (Retrieval Augmented Generation - RAG)

The primary use of the Large Language Model (LLM) is to answer user questions based only on the uploaded documents. Instead of relying solely on the model's knowledge, the chatbot retrieves relevant document content before generating a response.

### 1.1. RAG Workflow Steps

When a user submits a question, the following process takes place:

1. **Document Upload & Processing**

   * Users upload PDF, DOCX, TXT, or Markdown files.
   * LangChain document loaders extract the text.
   * The extracted text is divided into smaller chunks.
   * Document metadata and chunks are stored in MongoDB.

2. **Embedding Generation**

   * Each document chunk is converted into vector embeddings using **Google Gemini Embeddings**.
   * The embeddings are stored inside the **FAISS Vector Store** for efficient similarity search.

3. **User Query Processing**

   * When the user asks a question, the query is converted into an embedding.
   * FAISS performs a similarity search to retrieve the most relevant document chunks.

4. **Prompt Construction**

   * The retrieved document chunks are combined with the user's question to create a contextual prompt.

   Example:

   ```
   Context:

   [Retrieved Chunk 1]

   [Retrieved Chunk 2]

   User Question:
   Explain the topic in simple words.
   ```

5. **Response Generation**

   * The contextual prompt is sent to **Google Gemini**.
   * Gemini generates a response using the retrieved document context.
   * The response is returned to the frontend chat interface.

## 2. Technologies Used

| Technology    | Purpose                                          |
| ------------- | ------------------------------------------------ |
| Google Gemini | Generates AI responses                           |
| LangChain     | Document loading, chunking and prompt management |
| FAISS         | Stores embeddings and performs similarity search |
| MongoDB       | Stores users, documents, chunks and chat history |
| Express.js    | Backend API                                      |
| React.js      | Frontend user interface                          |

## 3. Benefits of Using RAG

* Produces responses based on uploaded documents instead of relying only on the LLM.
* Reduces hallucinations by providing document context.
* Enables semantic search using FAISS.
* Supports multiple document formats including PDF, DOCX, TXT and Markdown.
* Automatically updates the vector database when documents are added or deleted.

## 4. Current Features

* User Authentication using JWT.
* Upload and manage documents.
* Automatic text extraction and chunk generation.
* Semantic search using FAISS.
* AI-powered question answering with Google Gemini.
* Chat history stored in MongoDB.
* Automatic cleanup of old documents.
* Automatic rebuilding of the FAISS vector store after document deletion.

## 5. Future Enhancements

Potential improvements for future versions include:

* Document summarization.
* Source citations for AI responses.
* Multi-document comparison.
* Conversation memory across sessions.
* Support for additional document formats.
* Streaming AI responses for faster interaction.

This implementation combines **Google Gemini**, **LangChain**, **MongoDB**, and **FAISS** to build a Retrieval Augmented Generation (RAG) chatbot capable of answering questions accurately based on user-uploaded documents.
