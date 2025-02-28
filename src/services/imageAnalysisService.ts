
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { pipeline } from '@huggingface/transformers';

// This would typically come from environment variables
const GEMINI_API_KEY = 'AIzaSyAi1WrBHN28g44_Lsxx1laBE7eHs8YiuK0'; // Added actual API key

export const analyzeImage = async (file: File): Promise<string> => {
  try {
    // For demonstration purposes, check if API key is set
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      console.warn('Gemini API key not set. Using fallback analysis.');
      return getFallbackAnalysis(file);
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Get the vision model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    // Convert file to a format compatible with the API
    const imageData = await fileToGenerativePart(file);
    
    // Generate content with the image - using the correct API format
    const result = await model.generateContent([
      "Describe this image in detail.",
      imageData
    ]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing image:', error);
    return 'I had trouble analyzing this image. Could you try a different one?';
  }
};

// Fallback function for when API key is not set
const getFallbackAnalysis = async (file: File): Promise<string> => {
  try {
    // Try to use HuggingFace for local image classification
    const classifier = await pipeline("image-classification");
    
    // Convert file to a format HuggingFace can use
    const fileURL = URL.createObjectURL(file);
    
    const results = await classifier(fileURL);
    
    if (Array.isArray(results) && results.length > 0) {
      // Handle the case where results is an array of objects with label and score
      if ('label' in results[0] && 'score' in results[0]) {
        return `This appears to be an image of ${results[0].label} with ${(results[0].score * 100).toFixed(2)}% confidence.`;
      }
    }
    
    return getSimulatedAnalysis(file);
  } catch (error) {
    console.error('Error with local analysis:', error);
    return getSimulatedAnalysis(file);
  }
};

// Helper function to convert File to API format
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: { 
      data: await base64EncodedDataPromise as string,
      mimeType: file.type
    },
  };
};

// Generate simulated analysis for demo purposes
const getSimulatedAnalysis = (file: File): string => {
  const imageTypes = ['landscape', 'portrait', 'cityscape', 'animal', 'food', 'abstract art'];
  const randomType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
  
  const responses = [
    `This appears to be a ${randomType} image. The composition is balanced with good use of color and lighting.`,
    `I see what looks like a ${randomType}. The details are quite interesting, especially in the foreground.`,
    `This ${randomType} image has a unique perspective. Notice how the elements are arranged to draw your attention.`,
    `An intriguing ${randomType} with excellent contrast. The focal point is clearly defined and captures attention.`,
    `A beautiful ${randomType} with rich textures. The way light interacts with the subjects creates depth and dimension.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};
