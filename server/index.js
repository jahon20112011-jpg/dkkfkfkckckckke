
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
      return res.status(500).json({ error: "API kalit yo'q" });
    }

    const messages = req.body.messages || [];
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }]
    }));

    let response;
    let data;

    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents })
        }
      );

      data = await response.json();

      if (response.ok) break;
      if (response.status !== 503 && response.status !== 429) break;

      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }

    if (!response.ok) {
      console.error(data);
      return res.status(response.status).json({
        error: data.error?.message || "Gemini xatosi"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") ||
      "Javob olinmadi";

    res.json({ text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server xatosi" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("IDROK AI ishga tushdi"));
    
