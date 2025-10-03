// netlify/functions/gemini-proxy.js
// This function will run on Netlify's server, keeping your API key secret.

import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: The API_KEY is accessed from Netlify's secure environment variables.
// This key will NOT be exposed to the client-side.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// You can specify your desired model here.
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Prompt is required' }),
        headers: { "Content-Type": "application/json" }
      };
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" }
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing your request', error: error.message }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
