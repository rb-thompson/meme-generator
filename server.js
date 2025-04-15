const express = require("express");
const axios = require("axios");
const { TwitterApi } = require("twitter-api-v2"); // Import the new library
const app = express();
const port = 3000;

app.use(express.static("."));
app.use(express.json({ limit: "10mb" }));

// Configure TwitterApi with your X API credentials
const client = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

// Test the client initialization
console.log("Twitter API client initialized:", client.v2 !== undefined ? "Success" : "Failed");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post("/generate-meme", async (req, res) => {
  const userInput = req.body.input;
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-3",
          messages: [
            {
              role: "system",
              content: "You are a master meme creator. Generate a short, funny meme caption (under 50 characters) for the given topic. Use a humorous tone and avoid being too serious."
            },
            {
              role: "user",
              content: userInput
            }
          ],
          max_tokens: 50,
          temperature: 0.8
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROK_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
      let memeCaption = response.data.choices[0].message.content.trim();
      memeCaption = memeCaption.replace(/\.$/, "");
      if (memeCaption.length < 10) {
        throw new Error("Caption too short, retrying...");
      }
      return res.json({ caption: memeCaption });
    } catch (error) {
      attempt++;
      if (error.response) {
        if (error.response.status === 400) {
          return res.status(400).json({ error: `Bad request to Grok API: ${error.response.data.error}` });
        } else if (error.response.status === 503) {
          console.log(`Attempt ${attempt} failed with 503. Retrying...`);
          if (attempt === maxRetries) {
            return res.status(503).json({ error: "AI service is down. Please try again later." });
          }
          await delay(2000);
        } else if (error.response.status === 429) {
          return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        } else {
          console.error(error.response.data);
          return res.status(error.response.status).json({ error: `Grok API error: ${error.response.data.error}` });
        }
      } else {
        console.error(error);
        return res.status(500).json({ error: "Failed to generate meme" });
      }
    }
  }
});

app.post("/share-on-x", async (req, res) => {
    try {
      const imageData = req.body.imageData;
      if (!imageData) {
        return res.status(400).json({ error: "No image data provided." });
      }
  
      console.log("Image data received:", imageData.slice(0, 50) + "...");
  
      const base64Image = imageData.split(",")[1];
      if (!base64Image) {
        return res.status(400).json({ error: "Invalid image data format." });
      }
  
      console.log("Base64 image extracted:", base64Image.slice(0, 50) + "...");
  
      const imageBuffer = Buffer.from(base64Image, "base64");
      console.log("Image buffer created, length:", imageBuffer.length);
  
      // Upload the media using v1 API with proper MIME type format
      const mediaUpload = await client.v1.uploadMedia(imageBuffer, { mimeType: "image/png" });
      console.log("Media uploaded (v1), ID:", mediaUpload);
  
      // Post the tweet with media using v2 API
      await client.v2.tweet({
        text: "Memes make the web go round! 🖼️",
        media: { media_ids: [mediaUpload] }
      });
  
      return res.json({ success: true });
    } catch (error) {
      console.error("Error sharing on X:", error);
      return res.status(500).json({ error: "Error sharing on X: " + (error.message || "Unknown error") });
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});