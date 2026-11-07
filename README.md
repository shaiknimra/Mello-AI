# Mello AI

> **Think. Ask. Discover.**  
> A resume-worthy, public, multi-agent AI assistant built with FastAPI, LangGraph, and React.

---

## 🎨 Identity & Brand

- **Identity Name:** Mello
- **Product Name:** Mello AI
- **Tagline:** Think. Ask. Discover.
- **Brand Palette:** Charcoal base (`#121118`) with Purple accents (`#7C3AED` / `#A855F7`). Dark mode by default, light mode available.
- **Typography:** Geist Sans (interface), Inter (chat content), JetBrains Mono (code blocks), STIX Two Math (mathematics).

---

## 🏗️ Architecture Overview

- **Frontend (`/frontend`):** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + React-Markdown (GFM support, syntax highlighting, copyable code blocks).
- **Backend (`/backend`):** Python 3.12 + FastAPI + Pydantic v2 + swappable LLM Adapter pattern (`GeminiLLMAdapter` and `MockLLMAdapter`).
- **Testing:** Pytest with FastAPI TestClient for automated endpoint verification.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 20+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies (already created during Phase 1)
pip install -r requirements.txt

# Run the FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
Backend will start at: `http://localhost:8000`  
Interactive API Documentation: `http://localhost:8000/docs`  
Health check: `http://localhost:8000/api/v1/health`

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Run development server
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
```bash
# From the project root:
backend\.venv\Scripts\pytest backend\tests
```

### Frontend TypeScript & Build Verification
```bash
# From the frontend directory:
npm run build
```

---

## 📋 Delivery Roadmap

- [x] **Phase 0:** Discovery & System Architecture
- [x] **Phase 1:** Basic Chatbot (Vertical Slice: React UI, FastAPI Backend, LLM Adapter, Dark/Light mode, Tests)
- [ ] **Phase 2:** Authentication & Persistence (PostgreSQL schema, migrations, user isolation)
- [ ] **Phase 3:** Agent Orchestration (LangGraph Coordinator + Specialist Agents)
- [ ] **Phase 4:** Controlled Tool Execution (Permissions, web research with citations)
- [ ] **Phase 5:** RAG & Multi-Format Document Ingestion (PDF, DOCX, TXT, images)
- [ ] **Phase 6:** User-Controlled Long-Term Memory
- [ ] **Phase 7:** Productivity Features & Document Exports (PDF/TXT)
- [ ] **Phase 8:** User Dashboard & Public Landing Page
- [ ] **Phase 9:** Launch Hardening, Security Auditing & Deployment
