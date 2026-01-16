const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); 
    // Actually, there is a specific list command:
    
    console.log("Fetching available models...");
    // This is a direct API call hack if the SDK listModels function changed
    // But usually this works in the standard SDK:
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("\n=== AVAILABLE MODELS ===");
      data.models.forEach(m => {
        if (m.name.includes("gemini")) {
          console.log(`ID: ${m.name.replace("models/", "")}`);
          console.log(`    - ${m.description.substring(0, 60)}...`);
        }
      });
    } else {
      console.log("Error:", data);
    }
    
  } catch (err) {
    console.error(err);
  }
}

listModels();