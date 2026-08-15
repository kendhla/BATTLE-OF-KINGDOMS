import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Question Generator Endpoint
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic, count = 10, difficulty = 'Medium' } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'A valid topic string is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is missing in server environment variables.',
      });
    }

    const prompt = `Generate ${count} educational multiple-choice quiz questions on the topic "${topic}" with difficulty level "${difficulty}" suitable for classroom students.
Ensure each question has 4 distinct option choices (1 correct, 3 plausible distractors) and a clear, brief explanation of the correct answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: 'The quiz question statement.',
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Four multiple choice options.',
              },
              correctIndex: {
                type: Type.INTEGER,
                description: '0-based index of the correct option (0 to 3).',
              },
              explanation: {
                type: Type.STRING,
                description: 'Short explanation of why the answer is correct.',
              },
            },
            required: ['question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
    });

    if (!response.text) {
      throw new Error('No response text returned from Gemini API.');
    }

    const questions = JSON.parse(response.text.trim());
    return res.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate questions.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏰 Battle of Kingdoms server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
