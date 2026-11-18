
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("IDROK AI server ishlayapti");
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API kalit sozlanmagan" });
    }

    const messages = req.body.messages || [];
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }]
    }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({ error: "Gemini bilan bog‘lanishda xato" });
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("") || "Javob olinmadi";

    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("IDROK AI ishga tushdi"));
    
