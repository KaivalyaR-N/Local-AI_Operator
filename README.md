# 🚀 Local AI Operator

Local AI Operator is a **React + TypeScript AI-powered project generator** that uses **Google Gemini API** to automatically create software project structures based on a user’s goal.

Instead of manually writing boilerplate code, users can simply describe what they want to build, and the system generates the **project files and code structure instantly**.

---

# 🧠 Features

* 🤖 **AI Project Generation** using Google Gemini
* 📁 Generates **complete project structures**
* ⚡ Built with **React + Vite + TypeScript**
* 🔐 Secure API configuration using `.env.local`
* 🧩 Modular architecture with components and services
* ⚡ Fast development environment with Vite

---

# 🏗️ Tech Stack

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| React             | Frontend UI                      |
| TypeScript        | Type safety                      |
| Vite              | Fast development build tool      |
| Google Gemini API | AI code generation               |
| Node.js           | Package management & environment |

---

# 📂 Project Structure

```
local-ai-operator
│
├── components/        # UI Components
├── services/          # API service layer
│   └── geminiService.ts
│
├── App.tsx            # Main application component
├── index.tsx          # Entry point
├── types.ts           # Type definitions
├── metadata.json
│
├── vite.config.ts
├── tsconfig.json
├── package.json
│
├── .env.local         # Environment variables
├── README.md
```

---

# ⚙️ Installation

Clone the repository:

```
git clone https://github.com/KaivalyaR-N/Local-AI-Operator.git
```

Navigate into the project directory:

```
cd Local-AI-Operator
```

Install dependencies:

```
npm install
```

---

# 🔑 Environment Setup

Create a `.env.local` file in the root folder and add your **Google Gemini API key**.

```
GEMINI_API_KEY=your_api_key_here
```

---

# ▶️ Running the Project

Start the development server:

```
npm run dev
```

Open the app in your browser:

```
http://localhost:5173
```

---

# 📌 How It Works

1. User enters a **project goal**
2. The application sends the prompt to **Google Gemini API**
3. Gemini generates a **structured project with files**
4. The application displays ge
