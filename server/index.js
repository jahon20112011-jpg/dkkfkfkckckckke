
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("IDROK AI server ishlayapti");
});

app.post("/api/chat", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash"
    });

    const messages = req.body.messages || [];
    const prompt = messages
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const result = await model.generateContent(prompt);

    res.json({ text: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI server xatosi" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("IDROK AI server ishga tushdi"));
                   
  
