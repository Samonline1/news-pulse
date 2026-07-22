# NewsPulse AI

> **AI-powered news intelligence platform** that aggregates news from multiple publishers, groups related stories using semantic embeddings, and generates AI-powered titles and summaries for faster news discovery.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express-4-black?style=flat-square&logo=express)
![Python](https://img.shields.io/badge/Python-3-blue?style=flat-square&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Groq](https://img.shields.io/badge/Groq-LLM-orange?style=flat-square)
![SentenceTransformers](https://img.shields.io/badge/Sentence-Transformers-red?style=flat-square)

##  Live Demo

- **Frontend:** https://news-pulsei.vercel.app/
- Backend: Render
- Database: MongoDB Atlas

---

#  Demo

## Demo

<p align="center">
  <img src="/assets/demo.gif" alt="NewsPulse AI Demo" width="900"/>
</p>


---

#  Features

##  AI

- Semantic clustering using **Sentence Transformers (all-MiniLM-L6-v2)**
- AI-generated cluster titles using **Groq LLM**
- AI-generated news summaries
- Cached summaries stored in MongoDB
- AI assistant for summarized news insights

##  News Processing

- RSS aggregation from multiple publishers
- Full article extraction
- Duplicate detection
- Semantic article clustering
- Multi-source event grouping

##  Frontend

- Modern Next.js dashboard
- Search
- Timeline visualization
- Cluster detail pages
- Dark mode
- Responsive design
- Loading states & skeletons

##  Backend

- REST API
- Health endpoint
- MongoDB integration
- Automatic scheduled ingestion pipeline

---

#  Architecture

```text
RSS Feeds
(BBC • NPR • Reuters)
        │
        ▼
Python Scraper
        │
Extract Full Articles
        │
        ▼
Sentence Transformers
(all-MiniLM-L6-v2)
        │
Semantic Clustering
        │
        ▼
Groq LLM
Titles + Summaries
        │
        ▼
MongoDB Atlas
        │
        ▼
Express REST API
        │
        ▼
Next.js Frontend
```

---

## Features

- Automated RSS ingestion from configurable news feeds
- Full-text extraction from each article source URL
- Duplicate detection using article links
- Keyword-based article clustering with union-find
- Human-readable cluster labels from frequent terms
- On-demand refresh from the dashboard
- Live polling after refresh so new data appears automatically
- Dashboard, timeline, and cluster detail views
- Health check endpoint for backend monitoring

---

#  Tech Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Axios |
| Backend | Node.js, Express, Mongoose, Groq API |
| AI | Sentence Transformers (all-MiniLM-L6-v2), Groq LLM |
| Scraper | Python, feedparser, trafilatura, requests, scikit-learn |
| Database | MongoDB Atlas |
| Deployment | Vercel, Render |

---

#  Project Structure

```text
news-pulse/
│
├── frontend/
├── backend/
├── scraper/
└── docs/
```

---

#  Quick Start

<details>
<summary>Run locally</summary>

```bash
git clone https://github.com/Samonline1/news-pulse.git
cd news-pulse

cd backend
npm install

cd ../frontend
npm install

cd ../scraper
pip install -r requirements.txt
```

Run services:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Scraper
cd scraper
python3 main.py
```

</details>

---

#  Environment Variables

### Backend

```env
PORT=
MONGODB_URI=
NODE_ENV=
GROQ_API_KEY=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=
```

### Scraper

```env
MONGODB_URI=
RSS_FEEDS=
```

---

#  API Overview

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /health | Health check |
| GET | /api/clusters | All clusters |
| GET | /api/clusters/:id | Cluster details |
| GET | /api/timeline | Timeline |
| POST | /api/ingest/trigger | Trigger ingestion |

---

#  Deployment

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

#  Roadmap

- React Query caching
- Authentication for ingestion endpoints
- Pagination
- Trending analytics
- GitHub Actions scheduled scraping

---

#  Limitations

- Semantic clustering depends on embedding quality and similarity thresholds.
- AI-generated titles and summaries may occasionally be inaccurate.
- Reuters RSS may be unavailable because of upstream feed issues.
- Free-tier hosting can introduce cold starts.
- Automatic scheduled scraping is limited on free hosting.

This approach is intentionally lightweight and practical, but these limitations should be kept in mind when interpreting cluster results.

