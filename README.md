# Grok Powered Meme Generator

The Grok Powered Meme Generator is a web-based application that allows users to create and share memes effortlessly. Powered by AI, it generates humorous captions based on user input and provides tools for customization and sharing.

## Features

- **AI-Powered Caption Generation**: Generate witty and creative captions using Grok AI.
- **Custom Image Upload**: Upload your own images to create personalized memes.
- **Meme Preview**: View your meme in real-time on a canvas.
- **Caption Regeneration**: Regenerate captions for the same image with a single click.
- **Download Option**: Save your memes locally as PNG files.
- **Social Sharing**: Share your memes directly on X (formerly Twitter).
- **Responsive Design**: User-friendly interface for both desktop and mobile devices.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-username/meme-generator.git
   cd meme-generator
   npm install

2. Obtain your *Grok API Access Token* and *X AI Developer* credentials:
- Sign up for Grok AI and generate an API token.
- Register for X AI Developer credentials to enable social sharing.

3. Create a `.env` file in the root directory and add the following:
- GROK_API_TOKEN=your-grok-api-key
- X_API_KEY=your-x-api-key
- X_API_SECRET=your-x-api-secret
- ACCESS_TOKEN=your-x-ai-access-token
- ACCESS_SECRET=your-x-ai-access-secret

4. Start the server:
```bash
npm start
```

5. Open `http://localhost:3000` in your browser to use the app.

## Deployment

This project is configured for deployment on Vercel. Simply push the code to your Vercel-connected repository to deploy.

## License

This project is licensed under the ISC License. 