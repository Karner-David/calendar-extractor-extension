require('dotenv').config();
const express = require('express')
const multer = require('multer')
const pdfRead = require('pdf-parse')
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const eventSchema = {
  description: "List of events extracted from text",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      summary: { type: SchemaType.STRING, description: "Title of the event" },
      location: { type: SchemaType.STRING, description: "Location if available" },
      startDateTime: { type: SchemaType.STRING, description: "ISO 8601 string (YYYY-MM-DDTHH:mm:ss)" },
      endDateTime: { type: SchemaType.STRING, description: "ISO 8601 string (YYYY-MM-DDTHH:mm:ss)" },
    },
    required: ["summary", "startDateTime", "endDateTime"],
  },
};

app.post('/extract', upload.single('file'), async (req, res) => {
    try {
        // get text
        let text = ""

        if (req.file) {
            const data = await pdfRead(req.file.buffer)
            text = data.text
        } else if (req.body.text) {
            text = req.body.text
        }

        if (!text) return res.status(400).json({ error: "No text given" })

        // call gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application.json",
                responseSchema: eventSchema
            }
        })

        const prompt = `Extract all the event dates from the following text. If the year is missing, assume the current year is ${new Date().getFullYear}. 
        Text: ${text.substring(0, 30000)}`

        const result = await model.generateContent(prompt)
        const events = JSON.parse(result.response.text())

        res.json({ events })
    } catch (err) {
        res.status(500).json({ error: "Extraction Failed" })
    }

})

app.listen(3000, () => console.log('Backend running on port 3000.'))