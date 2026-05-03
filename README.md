# 🎓 TopperGuide

**AI-Powered Past Paper Analyzer & Smart Study Planner**

🎥 **Demo Video:** https://drive.google.com/file/d/1ZTi0NEi72B1kUMq3hkfIhEPSwxw7tBF-/view?usp=drivesdk





---

## 🚀 Overview

TopperGuide is an intelligent exam preparation platform that helps students:

* 📊 Analyze past question papers
* 🎯 Identify high-weightage topics
* 📅 Generate personalized study plans
* ❓ Practice with AI-generated questions

It uses AI to detect patterns, predict trends, and optimize study strategies.

---

## ✨ Key Features

### 📄 Multi-Paper Upload

* Upload multiple PDFs/images
* OCR support for scanned papers
* Automatic year tagging
* Syllabus upload for coverage analysis

### 🤖 AI-Powered Analysis

* Topic extraction from questions
* Frequency & trend analysis
* Difficulty classification
* Question type detection (MCQ, long answer, etc.)

### 🎯 Smart Topic Scoring

Each topic gets an importance score (0–100) based on:

* Frequency
* Recency
* Marks weightage
* Trend patterns

### 📅 Study Planner

* Personalized study schedules
* Configurable days & hours
* Phase-based planning (High → Medium → Revision)
* Daily breakdown + milestones

### 📊 Analytics Dashboard

* Topic frequency charts
* Difficulty distribution
* Year-wise trends
* Coverage heatmaps

### ❓ Practice Question Generator

* AI-generated questions
* Difficulty & topic filters
* Instant answers + explanations

---

## 🛠️ Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* PyPDF2, pdf2image
* Pytesseract (OCR)

### Frontend

* React + Vite
* Tailwind CSS
* Framer Motion
* Recharts
* Axios

### AI Integration

* 🧠 Ollama (local models like `llama3.2`)
* ☁️ OpenAI / NVIDIA API (optional)

---

## 🧠 AI Setup (Choose One)

### ✅ Option 1: Local AI (Ollama)

```bash
ollama serve
ollama pull llama3.2
```

### ☁️ Option 2: Cloud AI (OpenAI / NVIDIA)

Create `.env` in `/backend`:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
```

> NVIDIA API keys also work with OpenAI-compatible endpoints.

---

## 📦 Installation

### ⚡ Quick Setup

#### macOS/Linux

```bash
chmod +x setup.sh
./setup.sh
```

#### Windows

```bat
setup.bat
```

---

## 📋 Prerequisites

* Python 3.9+
* Node.js 18+
* (Optional) Tesseract OCR

---

## 🛠 Manual Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/topperguide.git
cd topperguide
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend

```bash
cd frontend
npm install
```

---

## 🚀 Running the App

### Start Services

```bash
# Terminal 1
ollama serve

# Terminal 2
cd backend
python main.py

# Terminal 3
cd frontend
npm run dev
```

---

## 📁 Project Structure

```
topperguide/
├── backend/
├── frontend/
├── docker-compose.yml
├── setup.sh / setup.bat
└── README.md
```

## 🎯 How It Works

1. Upload past papers
2. Extract text (OCR + NLP)
3. Analyze patterns using AI
4. Identify important topics
5. Generate study plan
6. Practice with generated questions

---

## 🤝 Contributing

1. Fork repo
2. Create branch
3. Commit changes
4. Open PR

---

## 📝 License

MIT License

---

## 📧 Contact
Kavyanjali Lingam
+919553578418
kavyanjalilingam@gmail.com

✨ Built for students who want to **study smarter, not harder**
