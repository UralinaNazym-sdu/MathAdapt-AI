# MathAdapt AI — Personalized Mathematics Learning

**SDU University | Educational Technology & AI**

**Topic 8: AI for Differentiated Learning**

## Project Overview

MathAdapt AI is a web-based educational application developed to help students learn mathematics at different difficulty levels using Artificial Intelligence.

The application focuses on solving linear equations. Students can select their preferred difficulty level, generate new mathematical problems, check their answers, and receive helpful hints and step-by-step solutions.

The main goal of this project is to demonstrate how AI can support differentiated learning and make mathematics more accessible to students with different levels of knowledge.

## Main Features

- **Student Registration:** Students enter their full name and year of study before accessing the learning platform.
- **Three Difficulty Levels:** Foundation, Standard, and Advanced.
- **AI Problem Generation:** Google Gemini generates new linear equations according to the selected level.
- **Instant Feedback:** Students can submit their answers and check whether they are correct.
- **AI Hints:** Students receive guidance adapted to the difficulty level.
- **Step-by-Step Solutions:** Detailed explanations help students understand how to solve equations.
- **Mathematical Validation:** The backend independently checks the numerical solutions of supported linear equations before displaying AI-generated problems.
- **Responsive Design:** The website supports desktop and mobile screens.

## Difficulty Levels

| Level | Description |
|---|---|
| Foundation | Simple one-step linear equations with direct hints |
| Standard | Linear equations requiring two or three steps |
| Advanced | More complex equations involving brackets and multiple operations |

## Technologies Used

**Frontend:** React, JavaScript, HTML, CSS, Vite

**Backend:** Node.js, Express

**Artificial Intelligence:** Google Gemini API

**Mathematical Validation:** Math.js

**Version Control:** Git and GitHub

**Deployment:** Render

## How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/UralinaNazym-sdu/MathAdapt-AI.git
cd MathAdapt-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Gemini API

Create a `.env` file in the main project directory and add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Keep your API key private. Do not upload the `.env` file to GitHub.

### 4. Start the Backend Server

```bash
node server/index.js
```

### 5. Start the React Application

Open another terminal and run:

```bash
npm run dev
```

Open `http://localhost:5173/` in your browser.

## AI Prompt Design

The Gemini API receives instructions based on the student's selected difficulty level.

- **Foundation:** Generate a simple one-step linear equation.
- **Standard:** Generate a linear equation requiring two or three steps.
- **Advanced:** Generate a multi-step linear equation involving brackets.

The AI is instructed to provide a numerical answer, a helpful hint, and step-by-step explanations. The server independently validates the numerical answer for supported linear equations and rejects invalid problems.

## Live Website

https://mathadapt-ai.onrender.com

## GitHub Repository

https://github.com/UralinaNazym-sdu/MathAdapt-AI

## Conclusion

MathAdapt AI demonstrates how Artificial Intelligence can be used to support differentiated mathematics learning. The project combines an interactive website, AI-generated mathematical exercises, instant feedback, and explanations to create a more personalized learning experience.

---

**Developed by:** Uralina Nazym

**University:** SDU University

**Course:** Educational Technology & AI
