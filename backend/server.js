const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const cors = require("cors");
require("dotenv").config();


const app = express();

const apiKey = process.env.GEMINI_API_KEY;
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST",
  credentials: true,
}))

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "I want you to be a coding language translator. You will be given a code in a given programming language and you have to translate it to a specified programming language while preserving all of its logic. Please respond to the prompt in a format specified as follows : (1. Code, 2. Explanation of the translation). You are not a chatbot. Please give the explanation in a markdown format in bullet points. Do not include any other information in your response.",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseModalities: [],
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        Code: {
          type: "string",
        },
        Explanation: {
          type: "string",
        },
      },
    },
  },
});

app.post("/api/generate", async (req, res) => {
  const { currentLanguage, code, targetLanguage } = req.body;

  try {
    const promptText = `Convert/Translate the given code written in ${currentLanguage} to ${targetLanguage}. Code: ${code}`;
    const result = await model.generateContent(promptText)
    const response = await result.response;
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response.text());
    } catch (parseError) {
      const text = response.text();
      parsedResponse = { 
        Code: text,
        Explanation: "No structured explanation available" 
      };
    }

    res.status(200).json(parsedResponse);
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});