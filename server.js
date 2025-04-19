const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { exec } = require("child_process");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname))
app.use(express.json());
app.use(cors());

// ✅ Gemini API key check
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Missing API key in .env (GEMINI_API_KEY)");
  process.exit(1);
}
console.log("✅ Gemini API key loaded");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash" // ✅ this is the correct full model path
});
 



// 🏠 Root route
app.get("/api", (req, res) => {
  res.send("✅ Server running!");
});

// 🔁 Restart route
app.get("/api/restart", (req, res) => {

  res.send("Restarting...");
  const cmd = process.platform === "win32" ? "shutdown -r -t 0" : "sudo reboot";
  exec(cmd, (err) => err && console.error("Restart Error:", err));
});

// ⏹️ Shutdown route
app.get("/api/shutdown", (req, res) => {
  res.send("Shutting down...");
  const cmd = process.platform === "win32" ? "shutdown -s -t 0" : "sudo shutdown -h now";
  exec(cmd, (err) => err && console.error("Shutdown Error:", err));
});

// 🧠 Ask Gemini route
app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required." });
 
    // ✅ Call Gemini API
    const result = await model.generateContent(question);
    const replyText = await result.response.text();

    res.json({ text: replyText || "No response." });
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

// 🚀 Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
