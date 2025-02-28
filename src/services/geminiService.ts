
import { GoogleGenerativeAI } from '@google/generative-ai';

// This would typically come from an environment variable
// For a frontend-only app, this is directly included but not ideal for production
const API_KEY = 'AIzaSyASSMhpzPoP1VcrFxTySGU3TF002PTQqHQ'; // Updated with provided API key

// Initialize the API
const genAI = new GoogleGenerativeAI(API_KEY);

export const processTextWithAI = async (text: string): Promise<string> => {
  try {
    // For demonstration purposes, we'll check if the API key is set
    // Instead of comparing to a literal string, check if it's empty or not defined
    if (!API_KEY || API_KEY.trim() === '') {
      console.warn('Gemini API key not set. Using fallback response.');
      // Provide a fallback response for demo purposes
      return simulateFallbackResponse(text);
    }

    // Use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(text);
    const response = await result.response;
    const textResponse = response.text();
    
    return textResponse;
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return 'Sorry, I encountered an error while processing your request. Please try again.';
  }
};

// Fallback function for demo when API key is not set
const simulateFallbackResponse = (text: string): string => {
  // Simple responses for demo purposes
  const responses = [
    "I understand you're asking about " + text.split(' ').slice(0, 3).join(' ') + "... That's an interesting topic!",
    "Thanks for your question. In a real implementation, I would use Gemini API to provide a detailed answer about " + text.split(' ').slice(0, 2).join(' '),
    "That's a great question! To give you a proper answer, you would need to configure the app with a valid Gemini API key.",
    "I'd love to help with your question about " + text.split(' ').slice(0, 3).join(' ') + ". This is where the AI would generate a response using the Gemini API.",
    "Interesting query! In a production environment, I would connect to Gemini API to give you insights about " + text.split(' ').slice(0, 2).join(' '),
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};
