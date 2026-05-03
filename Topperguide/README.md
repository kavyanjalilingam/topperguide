# TopperGuide 🎓

## AI-Powered Past Paper Analyzer & Smart Study Planner

TopperGuide is an intelligent exam preparation system that analyzes past question papers, identifies patterns, predicts important topics, and generates personalized study plans. Built with FastAPI, React, and **Ollama (local AI)** for privacy-first, offline-capable AI analysis.

![TopperGuide Banner](https://img.shields.io/badge/TopperGuide-Smart%20Exam%20Prep-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-green?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal?style=flat-square&logo=fastapi)
![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-purple?style=flat-square)

---

## 📹 Demo Video

🎥 **[Watch the Demo Video on Google Drive](YOUR_GOOGLE_DRIVE_LINK_HERE)**

> *Upload your demo video to Google Drive and replace the link above*

---

## ✨ Features

### 1. 📄 Multi-Paper Upload
- Upload multiple past papers (PDF/Images) spanning different years
- Supports OCR for scanned papers and images
- Batch upload with automatic year tagging
- Syllabus upload for coverage analysis

### 2. 🤖 AI Pattern Analysis
- **Topic Extraction**: Automatically identifies topics from questions
- **Frequency Analysis**: Calculates how often each topic appears
- **Difficulty Distribution**: Maps easy/medium/hard questions per topic
- **Question Type Analysis**: MCQ, Short Answer, Long Answer, Numerical
- **Year-wise Trends**: Track topic popularity over time

### 3. 📊 Syllabus Cross-Referencing
- Upload your official syllabus
- Map analyzed topics against syllabus
- Identify coverage gaps
- Get recommendations for uncovered topics

### 4. 🎯 Topic Importance Scoring
- AI-powered importance score (0-100) for each topic
- Factors considered:
  - Historical frequency
  - Recency of appearance
  - Average marks allocated
  - Trend direction (increasing/decreasing/stable)

### 5. 📅 Smart Study Planner
- Generate personalized study schedules
- Configure duration and daily hours
- Phased approach (High Priority → Medium → Review)
- Daily breakdowns with specific activities
- Milestones and self-test recommendations

### 6. 📈 Visual Analytics Dashboard
- Interactive charts and graphs
- Topic frequency bar charts
- Difficulty distribution pie charts
- Year-wise trend line charts
- Topic comparison radar charts
- Coverage heatmaps

### 7. ❓ Practice Question Generator
- AI-generated practice questions
- Customizable difficulty levels
- Multiple question types
- Instant answers with explanations
- Focus on high-yield topics

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python API framework
- **SQLAlchemy** - Database ORM
- **Ollama** - Local AI for privacy-first analysis (supports llama3.2, mistral, etc.)
- **PyPDF2 & pdf2image** - PDF processing
- **Pytesseract** - OCR for image text extraction
- **SQLite** - Local database

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling with custom dark theme
- **Framer Motion** - Premium animations and transitions
- **Three.js + React Three Fiber** - 3D visual elements
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - API client
- **Lucide React** - Icons

### Design Features
- 🌙 Premium dark theme with neon accents
- 🎨 Glassmorphism cards and effects
- ✨ Smooth page transitions and micro-animations
- 🌐 3D animated elements
- 📊 Interactive data visualizations

---

## 📦 Installation

### ⚡ Quick Setup (Recommended)

**For macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

The setup script will automatically install all dependencies for you!

---

### 📋 Prerequisites
- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Ollama** - [Download](https://ollama.ai/)
- **Tesseract OCR** (optional, for scanned PDFs)

---

### Manual Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/topperguide.git
cd topperguide
```

#### 2. Install Ollama

| Platform | Installation |
|----------|-------------|
| **macOS** | `brew install ollama` or download from [ollama.ai](https://ollama.ai) |
| **Linux** | `curl -fsSL https://ollama.ai/install.sh \| sh` |
| **Windows** | Download from [ollama.ai/download/windows](https://ollama.ai/download/windows) |

**Start Ollama and pull a model:**
```bash
# Start Ollama service
ollama serve

# In another terminal, pull the recommended model
ollama pull llama3.2
```

#### 3. Backend Setup

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

**Windows (Command Prompt):**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

#### 4. Install Tesseract OCR (Optional - for scanned PDFs)

| Platform | Installation |
|----------|-------------|
| **macOS** | `brew install tesseract` |
| **Ubuntu/Debian** | `sudo apt-get install tesseract-ocr` |
| **Windows** | Download from [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki) |

> **Note:** Tesseract is optional. Digital PDFs work without it. Only scanned PDFs require OCR.

#### 5. Frontend Setup

```bash
cd frontend
npm install
```

---

## 🚀 Running the Application

### Using Start Scripts (Easy Way)

**macOS/Linux:**
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Backend
./start-backend.sh

# Terminal 3: Start Frontend
./start-frontend.sh
```

**Windows:**
```cmd
:: Terminal 1: Start Ollama
ollama serve

:: Terminal 2: Start Backend (double-click or run)
start-backend.bat

:: Terminal 3: Start Frontend (double-click or run)
start-frontend.bat
```

### Manual Start

**Terminal 1 - Ollama:**
```bash
ollama serve
```

**Terminal 2 - Backend:**

macOS/Linux:
```bash
cd backend
source venv/bin/activate
python main.py
```

Windows:
```cmd
cd backend
venv\Scripts\activate.bat
python main.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

---

## � Docker Installation (Alternative)

If you prefer using Docker, Docker Compose, Podman, or Rancher Desktop:

### Prerequisites
- Docker / Docker Desktop / Rancher Desktop / Podman
- Ollama running on host machine

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/topperguide.git
cd topperguide

# Start Ollama on your host machine first
ollama serve

# Pull the AI model (in another terminal)
ollama pull llama3.2

# Build and run with Docker Compose
docker-compose up --build
```

### Using Podman

```bash
# With Podman Compose
podman-compose up --build

# Or manually
podman build -t topperguide-backend ./backend
podman build -t topperguide-frontend ./frontend

podman run -d -p 8000:8000 --name backend topperguide-backend
podman run -d -p 3000:3000 --name frontend topperguide-frontend
```

### Access Points (Docker)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📁 Project Structure

```
topperguide/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database models and connection
│   ├── models.py            # Pydantic models for API
│   ├── utils.py             # Utility functions
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend Docker configuration
│   ├── .dockerignore        # Docker ignore file
│   ├── .env.example         # Environment variables template
│   └── services/
│       ├── __init__.py
│       ├── document_processor.py  # PDF/Image text extraction
│       └── ai_analyzer.py         # Ollama-powered AI analysis
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile           # Frontend Docker configuration
│   ├── .dockerignore        # Docker ignore file
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js           # API client
│       ├── index.css        # Global styles
│       ├── components/
│       │   └── Layout.jsx   # Main layout component
│       └── pages/
│           ├── Home.jsx              # Landing page
│           ├── SubjectDashboard.jsx  # Subject overview
│           ├── UploadPapers.jsx      # File upload interface
│           ├── TopicAnalysis.jsx     # Analysis & predictions
│           ├── StudyPlanner.jsx      # Study plan generator
│           └── PracticeQuestions.jsx # Question generator
│
├── docker-compose.yml       # Docker Compose configuration
├── setup.sh                 # Setup script for macOS/Linux
├── setup.bat                # Setup script for Windows
├── start-backend.sh         # Start backend (macOS/Linux)
├── start-backend.bat        # Start backend (Windows)
├── start-frontend.sh        # Start frontend (macOS/Linux)
├── start-frontend.bat       # Start frontend (Windows)
└── README.md
```

---

## 🔧 API Endpoints

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subjects` | Create a new subject |
| GET | `/api/subjects` | List all subjects |
| GET | `/api/subjects/{id}` | Get subject details |

### Syllabus
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/syllabus/upload` | Upload syllabus document |
| GET | `/api/syllabus/{subject_id}` | Get syllabus for subject |

### Papers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/papers/upload` | Upload single paper |
| POST | `/api/papers/upload-multiple` | Upload multiple papers |
| GET | `/api/papers/{subject_id}` | List papers for subject |
| GET | `/api/papers/{paper_id}/details` | Get paper analysis |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analysis/topic-rankings/{subject_id}` | Get ranked topics |
| GET | `/api/analysis/syllabus-mapping/{subject_id}` | Get coverage analysis |
| GET | `/api/analysis/predictions/{subject_id}` | Get AI predictions |
| GET | `/api/analysis/summary/{subject_id}` | Get full analytics |

### Study Planner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study-plan/generate` | Generate study plan |
| GET | `/api/study-plan/{subject_id}` | Get saved plans |

### Practice
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/practice/generate` | Generate practice questions |
| GET | `/api/practice/similar/{question_id}` | Get similar questions |

---

## 📊 Screenshots

### Home Page
*Subject management and quick feature overview*

### Analytics Dashboard
*Visual representation of topic frequency, difficulty trends, and coverage*

### Topic Analysis
*Detailed breakdown of topics with importance scores and predictions*

### Study Planner
*AI-generated personalized study schedules with daily breakdowns*

### Practice Questions
*Interactive practice mode with instant feedback*

---

## 🎯 How It Works

1. **Upload Papers**: Add past question papers (PDF or images)
2. **AI Extraction**: Text is extracted using OCR and NLP
3. **Pattern Analysis**: Local AI (Ollama) identifies questions, topics, and patterns
4. **Scoring**: Topics are scored based on frequency, recency, and marks
5. **Visualization**: Results displayed in interactive charts
6. **Planning**: AI generates optimized study schedules
7. **Practice**: Generate topic-specific practice questions

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_HOST` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | AI model to use | `llama3.2` |
| `DATABASE_URL` | Database connection string | SQLite (local) |
| `UPLOAD_DIR` | Directory for uploaded files | `./uploads` |

### Supported Ollama Models

TopperGuide works with various Ollama models. Recommended:
- `llama3.2` (default) - Best balance of quality and speed
- `llama3.1` - More capable, requires more resources
- `mistral` - Good alternative for lower-end hardware
- `codellama` - If you want code-focused analysis

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ollama** for enabling local, privacy-first AI
- **Meta** for the Llama family of models
- FastAPI for the excellent Python framework
- React and Vite for the frontend stack
- Framer Motion for beautiful animations
- All contributors and testers

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub or reach out to the maintainers.

---

**Built with ❤️ for students who want to study smarter, not harder.**
