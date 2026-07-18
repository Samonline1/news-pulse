<div align="center">

# News Pulse

**A news aggregation dashboard that scrapes RSS feeds, groups related stories into clusters, and presents them in a clean dashboard and timeline experience.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4-339933?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-Scraper-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

Frontend: **https://news-pulsei.vercel.app/**

</div>

---

## Project Overview

News Pulse is a news aggregation dashboard that collects RSS feeds, extracts the full article text, groups related stories into topic clusters, and presents the results in a clean dashboard and timeline experience.

## Problem Statement

News stories about the same event are often published by multiple outlets at different times and with different wording. News Pulse exists to reduce that noise by collecting articles from several sources, removing duplicates, clustering related coverage, and making it easier to follow a story across publishers.

## Architecture Diagram

```text
                    RSS Feeds
            BBC | NPR | Reuters
                     |
                     v
             Python Scraper
                     |
      RSS Parsing + Article Extraction
                     |
                     v
          Duplicate Detection
                     |
                     v
      Keyword-based Article Clustering
                     |
                     v
               MongoDB Atlas
      Articles Collection + Clusters Collection
                     |
                     v
            Express.js Backend API
                     |
                     v
              Next.js Frontend
                     |
                     v
      Dashboard | Timeline | Cluster Details
```

## System Architecture

News Pulse is built as three connected parts:

1. The Python scraper fetches and processes news articles.
2. The Express backend reads the processed data from MongoDB and exposes REST APIs.
3. The Next.js frontend consumes those APIs and renders the user interface.

The backend and scraper do not communicate through a direct internal API. They both work with the same MongoDB database.


*3 Services*

### Python Scraper

* Fetches RSS feeds
* Extracts full article content
* Removes duplicates
* Groups similar articles into clusters
* Stores processed data in MongoDB

↓

### Node.js Backend

* Reads data from MongoDB
* Exposes REST APIs
* Serves clusters, articles and timeline

↓

### Next.js Frontend

* Fetches backend APIs
* Displays Dashboard
* Timeline
* Cluster Details


---

## How The App Works

### Step 1 - Fetch RSS Feeds

The scraper periodically reads RSS feeds from multiple news providers.

## News Sources

Current sources include:

- BBC RSS
- NPR RSS
- Reuters RSS

Reuters may occasionally be unavailable because of DNS or network issues, but the scraper continues processing the remaining sources.

Each RSS feed provides:

- Title
- Article URL
- Published date
- Summary

### Step 2 - Extract Full Article Content

RSS feeds only contain short summaries.

For every RSS item, the scraper downloads the original webpage and extracts the complete readable article.

```text
RSS URL
  |
  v
Download HTML
  |
  v
Extract Main Content
```

This produces much richer content for clustering than RSS summaries alone.

### Step 3 - Remove Duplicate Articles

Before storing an article, the scraper checks whether it already exists.

```text
Article URL
  |
  v
Already Exists?
  |
+-+--+
|    |
Yes  No
|    |
Skip Insert
```

This ensures repeated scraper runs do not create duplicate records.

### Step 4 - Cluster Similar Articles

After storing articles, the scraper groups articles discussing the same event.

The clustering process:

1. Remove stop words from article text.
2. Extract and compare overlapping keywords.
3. Measure keyword similarity between articles.
4. Generate a cluster label from the most frequent keywords.
5. Assign articles to a cluster.

Example:

```text
BBC
NPR
Reuters

v

World Cup Match

v

Cluster-7
```

Each cluster represents one news event reported by multiple publishers.

## Topic Grouping

Topic grouping is keyword-based. The scraper removes stop words, compares overlapping keywords, and groups articles that share enough related terms. Once a cluster is formed, the label is generated from the strongest keywords in that group.

### Step 5 - Store Processed Data

Processed information is stored inside MongoDB.

#### Articles Collection

Each article contains:

- Title
- Link
- Summary
- Content
- Published date
- Source
- Cluster ID

#### Clusters Collection

Each cluster stores:

- Cluster ID
- Cluster label
- Number of articles
- Sources
- Start time
- End time

### Step 6 - Backend API

The Express backend reads processed data from MongoDB and exposes REST APIs for the frontend.

```text
MongoDB
  |
  v
Express API
  |
  v
JSON Response
```

### Backend API Endpoints

The main API routes are:

- `GET /health` - health check and database connectivity
- `GET /api/clusters` - fetch all cluster summaries
- `GET /api/clusters/:clusterId` - fetch details for one cluster
- `GET /api/timeline` - fetch timeline-friendly article or cluster data
- `POST /api/ingest/trigger` - start a new scraper run

The response format is consistent across endpoints:

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

Note: the first scraper run can take a little time because it downloads feeds, extracts articles, and rebuilds clusters. Later refreshes usually feel quicker.

### Step 7 - Frontend

The Next.js application consumes the backend APIs and displays:

- Dashboard
- Cluster list
- Cluster details
- Timeline view

```text
Browser
  |
  v
Next.js Frontend
  |
  v
Express API
  |
  v
MongoDB
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

## What’s New

This update makes News Pulse smarter and easier to use:

- AI-generated cluster titles with Groq
- AI summaries for clusters, with cached results
- Refresh option for summary regeneration
- Smarter summary updates when new articles arrive
- Better clustering using semantic embeddings instead of only keyword matching
- AI assistant modal and better loading states in the frontend
- Reusable backend AI services with cached responses
- Less repeated AI usage by reusing existing summaries where possible

---

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express 4
- Mongoose
- CORS
- dotenv

### Scraper

- Python 3
- `feedparser`
- `trafilatura`
- `requests`
- `pymongo`

### Database

- MongoDB Atlas
- Collections: `articles`, `clusters`

---

## Environment Variables

### `backend/.env`

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | Port for the Express server, defaults to `5000` |
| `MONGODB_URI` | Yes | MongoDB connection string used by the backend |
| `NODE_ENV` | No | Server environment, defaults to `development` |

### `scraper/.env`

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` or `MONGODB_URI` | Yes | MongoDB connection string used by the scraper |
| `RSS_FEEDS` | No | Optional override for the feed list |

### `frontend/.env.local`

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API, for example `https://your-api-domain/api` |

---

## Setup Instructions

Set up the backend, frontend, and scraper with the following commands.

```bash
git clone https://github.com/Samonline1/news-pulse.git
cd news-pulse

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Scraper
cd ../scraper
pip install -r requirements.txt
```

Then run each service separately:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Scraper for a one-off ingestion
cd scraper
python3 main.py
```

By default:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/health`

---

## Deployment Notes

- Frontend is hosted on Vercel at `https://news-pulsei.vercel.app/`
- Backend should be deployed separately and referenced through `NEXT_PUBLIC_API_URL`
- The scraper uses the same MongoDB database as the backend
- Refreshing news in production requires Python and the scraper dependencies to be available where the backend runs

---

## Scripts

### Backend

| Script | Command | Description |
|---|---|---|
| `start` | `node src/server.js` | Runs the server |
| `dev` | `node src/server.js` | Same as start unless you add a watcher |

### Frontend

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Starts the development server |
| `build` | `next build` | Builds the app |
| `start` | `next start` | Runs the production build |
| `lint` | `next lint` | Lints the frontend |

---

## Future Improvements

- Add scheduled scraping runs 
- Add authentication for ingestion endpoints
- Improve clustering with embedding-based similarity
- Add pagination for large timelines and cluster lists
- Persist scraper logs and run history in MongoDB

## Limitations

- Keyword-based clustering can miss articles that describe the same event with different vocabulary.
- Cluster labels are generated from keywords and may not always be human-friendly.
- Free-tier hosting can introduce cold starts.
- Automatic scheduled scraping is limited on free hosting.

This approach is intentionally lightweight and practical, but these limitations should be kept in mind when interpreting cluster results.
