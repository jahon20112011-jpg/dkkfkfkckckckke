
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

app.get('/', (req, res) => {
  res.send('IDROK AI serveri ishlayapti');
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY sozlanmagan'
      });
    }

    const { messages = [], image } = req.body || {};

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content) }]
    }));

    if (image && contents.length) {
      contents[contents.length - 1].parts.push({
        inlineData: {
          mimeType: image.mime,
          data: image.data
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': KEY
        },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: data.error?.message || 'Gemini xatosi'
      });
    }

    const parts = data.candidates?.[0]?.content?.parts || [];

    res.json({
      text: parts.map(p => p.text || '').join('') || '(bo‘sh javob)'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000);
  
