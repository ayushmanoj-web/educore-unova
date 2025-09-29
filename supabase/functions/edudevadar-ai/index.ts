import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callGemini(chatMessages: any[], shouldGenerateImage = false) {
  console.log('Calling Gemini with messages:', chatMessages);
  console.log('Should generate image:', shouldGenerateImage);
  
  // Convert OpenAI format to Gemini format
  const contents = chatMessages.map(msg => ({
    parts: [{ text: msg.content }],
    role: msg.role === 'assistant' ? 'model' : 'user'
  }));

  // Enhanced system message with image generation capability
  const systemMessage = {
    parts: [{ text: 'You are Neodevadar AI, a helpful study assistant for a school app. You can generate images when asked. When generating images, describe what you are creating in detail. You provide concise, friendly answers.' }],
    role: 'user'
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-2:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [systemMessage, ...contents],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini error:', errText);
    throw new Error(`Gemini request failed: ${errText}`);
  }

  const data = await response.json();
  console.log('Gemini response:', data);
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function generateImage(prompt: string) {
  console.log('Generating image for prompt:', prompt);
  
  try {
    // Use Gemini's image generation capability or fallback to a simple response
    const imagePrompt = `Generate a detailed educational image: ${prompt}`;
    
    // For now, return a placeholder response since we need actual image generation
    return {
      success: true,
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdlbmVyYXRlZCBJbWFnZTogUGxhY2Vob2xkZXI8L3RleHQ+Cjwvc3ZnPg==',
      description: `Generated image for: ${prompt}`
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: 'Failed to generate image'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, prompt, generateImage: shouldGenerateImage } = await req.json();
    console.log('Received request:', { messages, prompt, shouldGenerateImage });

    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY');
      return new Response(JSON.stringify({ error: 'Missing GEMINI_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize input to chat format
    const chatMessages = Array.isArray(messages) && messages.length
      ? messages
      : [{ role: 'user', content: String(prompt || 'Hello!') }];

    // Check if user is asking for image generation
    const lastMessage = chatMessages[chatMessages.length - 1]?.content || '';
    const imageKeywords = ['generate image', 'create image', 'draw', 'show me', 'visualize', 'picture', 'diagram'];
    const needsImage = shouldGenerateImage || imageKeywords.some(keyword => 
      lastMessage.toLowerCase().includes(keyword)
    );

    let response: any = {};

    if (needsImage) {
      console.log('Generating image...');
      const imageResult = await generateImage(lastMessage);
      response.image = imageResult;
    }

    console.log('Getting text response...');
    const generatedText = await callGemini(chatMessages, needsImage);
    response.generatedText = generatedText;

    console.log('Sending response:', response);
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in edudevadar-ai function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
