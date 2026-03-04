🌱 Verdant

Verdant is a full-stack platform designed to measure, analyze, and reduce carbon footprints. It empowers individuals to track their day-to-day activity emissions while also providing tools to evaluate website carbon footprints using performance audits, heuristics, and AI-powered insights.

🚀 Tech Stack

Frontend: HTML, CSS, JavaScript, Bootstrap

Backend: Node.js, Express, Lighthouse, Puppeteer, Green Web API, Heuristics Service, Google Gemini API

AI/ML: Python, FastAPI, Jinja2, OpenAI API

Database: MongoDB

✨ Features

Track personal carbon footprint from daily activities.

Audit website carbon footprints using Lighthouse & Puppeteer.

Integration with Green Web API for sustainable hosting checks.

AI-powered analysis & summarization using Google Gemini and OpenAI.

Modular architecture with separate Node.js backend and Python AI service.

🔑 Environment Variables

Create a .env file in the backend folder based on .env.example.

.env.example MONGODB_URI=mongodb+srv://:@cluster.mongodb.net/ GOOGLE_GEMINI_API_KEY=your_gemini_key_here OPENAI_API_KEY=your_openai_key_here GREEN_WEB_API_KEY=your_greenweb_key_here PORT=3000

🔐 Getting API Keys

MongoDB URI → MongoDB Atlas → Create a free cluster → Connect → Copy your connection string.

Google Gemini API Key → Google AI Studio → Generate API key.

OpenAI API Key → OpenAI API Keys .

Green Web API Key → The Green Web Foundation .

⚠️ Do not commit your .env file. Make sure .env is added to .gitignore.

⚙️ Installation & Setup

Clone the repository:

git clone cd verdant

Start Node.js Backend cd backend node server.js

Start Python AI Service cd backend/pythonAI python -m uvicorn main:app --reload --port 8001

🔮 Future Enhancements

Secure Login/Signup functionality

User session management for personalized tracking

Expanded AI-driven insights and recommendation engine

👨‍💻 Team Members

Tanishq Lokhane – Backend Developer

Sejal Choudhary – Frontend Developer

Sarvesh Parmar – Python AI Developer

Mansi Nigam – Frontend Developer
