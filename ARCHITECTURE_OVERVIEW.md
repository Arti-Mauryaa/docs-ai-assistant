# Architecture Overview: MERN RAG Chatbot

This document outlines the high-level architecture of the **MERN RAG Chatbot**, which is built using the **MERN (MongoDB, Express.js, React.js, Node.js)** stack and incorporates **Retrieval Augmented Generation (RAG)** using **Google Gemini** and **FAISS** to provide intelligent document-based conversational AI.

## 1. System Components

The system is primarily composed of two main applications: a **Frontend (Client-side)** and a **Backend (Server-side)**, which communicate via RESTful APIs. Additionally, it integrates with external services for database management, vector storage, and Large Language Models (LLMs).

### 1.1. Frontend Application

* **Technology**: React.js (Vite)

* **Purpose**: Provides the user interface for interacting with the platform. This includes:

  * User authentication (Login, Registration)
  * Document uploading and management
  * Chat interface for conversational AI
  * Viewing uploaded documents and chat history

* **Key Features**:

  * Responsive UI/UX for various devices.
  * JWT-based authentication and protected routes.
  * Handles user input and displays responses from the backend.

### 1.2. Backend Application

* **Technology**: Node.js with Express.js

* **Purpose**: Serves as the core logic and data provider for the frontend. It handles:

  * **API Endpoints**: Exposes RESTful APIs for authentication, document management, and chat.
  * **Authentication & Authorization**: Manages user registration, login, and secure access using JWT.
  * **Document Processing**: Receives uploaded documents, extracts text content, and processes them for indexing.
  * **Chunk Generation**: Splits documents into chunks using LangChain.
  * **LLM Integration**: Uses Google Gemini for generating responses based on retrieved document context.
  * **Database Interactions**: Manages users, documents, document chunks, and chat history.

* **Key Modules**:

  * `controllers`: Contains the business logic for handling API requests.
  * `routes`: Defines the API endpoints and maps them to controller functions.
  * `models`: Defines the Mongoose schemas for MongoDB collections.
  * `middlewares`: Implements authentication, authorization, and file upload handling.
  * `config`: Manages database connections, LangChain, FAISS, and LLM configurations.
  * `utils`: Contains utility functions such as automatic cleanup.

### 1.3. Database Layer

* **Primary Database**: MongoDB Atlas

  * **Purpose**: Stores structured and application data including:

    * User profiles (`users` collection)
    * Document metadata (`documents` collection)
    * Document chunks (`document_chunks` collection)
    * Chat sessions and messages (`chat_sessions`, `chat_messages` collections)

* **Vector Store**: FAISS

  * **Purpose**: Stores vector embeddings generated from document chunks.
  * **Role in RAG**: Performs efficient similarity search to retrieve relevant document chunks before sending context to the language model.

### 1.4. Large Language Models (LLMs)

* **Technology**: Google Gemini
* **Purpose**: Powers the conversational AI interface.
* **Role in RAG**: Receives user queries along with the retrieved document chunks to generate accurate and context-aware responses.

## 2. Data Flow and Interactions

### 2.1. User Authentication

1. User interacts with the Frontend (Login or Register page).
2. Frontend sends credentials to the Backend API.
3. Backend authenticates/registers the user, generates a JWT, and sends it back to the Frontend.
4. Frontend stores the JWT for authenticated requests.

### 2.2. Document Upload and Processing

1. User uploads a document through the frontend.
2. Frontend sends the document to the Backend API.
3. Backend extracts text using LangChain document loaders.
4. The extracted text is split into smaller chunks.
5. Document metadata and chunks are stored in MongoDB.
6. Embeddings are generated using Google Gemini Embeddings.
7. Embeddings are stored in the FAISS Vector Store.
8. The temporary uploaded file is deleted after successful processing.

### 2.3. Conversational AI (RAG Flow)

1. User types a query in the chat interface.
2. Frontend sends the query to the Backend API.
3. Backend processes the query:

   * Generates an embedding for the user's question.
   * Performs similarity search in FAISS.
   * Retrieves the most relevant document chunks.
   * Sends the retrieved context and user query to Google Gemini.
   * Receives the generated response.
4. Backend sends the response back to the frontend.
5. Frontend displays the AI response to the user.

### 2.4. Document Management

1. Users can upload, view, and delete documents.
2. When a document is deleted, its chunks are removed from MongoDB.
3. The FAISS vector store is automatically rebuilt to keep embeddings synchronized.
4. Old uploaded documents are automatically cleaned up to optimize storage.

## 3. Scalability and Performance Considerations

* **Stateless Backend**: The backend is designed to be stateless, making deployment and scaling easier.
* **Efficient Vector Search**: FAISS enables fast similarity search for document retrieval.
* **Chunk-based Retrieval**: Improves answer quality while reducing unnecessary context.
* **Automatic Cleanup**: Removes expired documents and keeps the vector database synchronized.
* **Environment-based Configuration**: Supports seamless deployment across development and production environments.

This architecture provides a robust foundation for a **Retrieval-Augmented Generation (RAG) chatbot**, leveraging modern web technologies, Google Gemini, and FAISS to enable users to upload documents and receive intelligent, context-aware responses through an AI-powered conversational interface.
