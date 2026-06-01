import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Port and Host configuration
const PORT = 3000;
const HOST = "0.0.0.0";

// Lazy-loaded Gemini AI client to prevent startup failures if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it via Secrets panel in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API router
  app.post("/api/ai-assistant", async (req, res) => {
    try {
      const { prompt, chatHistory, systemInstruction } = req.body;
      const ai = getGeminiClient();

      // Format messages for chat
      // Express can proxy this to Gemini 3.5 Flash
      const contents = [];
      
      // Inject chat history
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }
      
      // Add current client user message
      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemInstruction || "Vous êtes un assistant IA expert en gestion de copropriété (syndic d'immeuble) en France. Vous aidez à répondre aux questions juridiques, techniques, financières et administratives. Répondez avec précision et d'un ton professionnel et rassurant.",
          temperature: 0.7,
        }
      });

      const replyText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
      res.json({ success: true, text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Une erreur interne est survenue lors de la communication de l'assistant.",
        missingApiKey: !process.env.GEMINI_API_KEY
      });
    }
  });

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date().toISOString() });
  });

  // Handle Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html as fallback for any frontend routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
