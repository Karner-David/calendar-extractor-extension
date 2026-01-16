require('dotenv').config();
const express = require('express')
const multer = require('multer')
const pdf = require('pdf-parse')
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai')
const cors = require('cors')
const { OAuth2Client } = require('google-auth-library');

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const eventSchema = {
  description: "List of events extracted from text",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      summary: { 
        type: SchemaType.STRING, 
        description: "The main title or name of the event" 
      },
      description: { 
        type: SchemaType.STRING, 
        description: "Extra notes, details. Return an empty string if no details found." 
      },
      location: { 
        type: SchemaType.STRING, 
        description: "Location if available. Return 'Not Specified' if not found." 
      },
      startDateTime: { type: SchemaType.STRING, description: "ISO 8601 string (YYYY-MM-DDTHH:mm:ss)" },
      endDateTime: { type: SchemaType.STRING, description: "ISO 8601 string (YYYY-MM-DDTHH:mm:ss)" },
    },
    required: ["summary", "startDateTime", "endDateTime", "location", "description"],
  },
};

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(' ')[1];
    
    await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
    });
    
    next(); 
  } catch (error) {
    console.error("Auth failed:", error.message);
    return res.status(401).json({ error: "Invalid User Token" });
  }
};

app.post('/extract', upload.single('file'), async (req, res) => {
    try {
        // get text
        let text = ""

        if (req.file) {
            console.log(`File received: ${req.file.originalname} (${req.file.size} bytes)`)

            const pdfData = await pdf(req.file.buffer)

            text = pdfData.text
            console.log("PDF Text extracted length:", text.length);
        } else if (req.body.text) {
            text = req.body.text
        }

        if (!text) return res.status(400).json({ error: "No text given" })

        // call gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: eventSchema
            },
        })
        const currentYear = new Date().getFullYear()

        const prompt = `Extract all events from the following text. 
          For each event, extract the summary, date, exact location, and any description/notes.
          If the year is missing, assume the current year is ${currentYear}. 
          Text: ${text.substring(0, 30000)}`

        const result = await model.generateContent(prompt)
        const events = JSON.parse(result.response.text())

        res.json({ events })
    } catch (err) {
        console.error("CRASH INSIDE ROUTE:", err);
        res.status(500).json({ error: err.message || "Extraction failed" });
    }

})

app.use((err, req, res, next) => {
  console.error("GLOBAL CRASH:", err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`Server running on port ${PORT}`))