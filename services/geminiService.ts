import { GoogleGenAI } from "@google/genai";
import { GeoLocation, WeatherData, DisasterType, DisasterPrediction, ClimateAnalytics } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  // 1. Get Real-time Weather Analysis using Google Search Grounding
  getWeatherAnalysis: async (location: GeoLocation | string): Promise<WeatherData> => {
    try {
      let prompt = '';
      if (typeof location === 'string') {
        prompt = `Find the current live, real-time weather conditions for "${location}". 
        I need the latest data including temperature, sky condition, humidity, wind speed, and any active weather warnings.
        Ensure the data is for right now.`;
      } else {
        prompt = `Find the current live, real-time weather for the location at coordinates ${location.lat}, ${location.lng}. 
        First, identify the nearest city or town name for these coordinates. 
        Then, provide the temperature, sky condition, humidity, wind speed, and any active weather warnings for that specific place.`;
      }
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      // Extract grounding sources
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => ({
            title: chunk.web?.title || 'Weather Source',
            uri: chunk.web?.uri || ''
        }))
        .filter((s: any) => s.uri);

      const jsonPrompt = `Based on the weather report above, generate a strict JSON object with these keys:
      {
        "temp": "temperature with unit (e.g., 24°C)",
        "condition": "short summary (e.g., Partly Cloudy)",
        "humidity": "percentage (e.g., 65%)",
        "wind": "speed and direction (e.g., 15 km/h NW)",
        "location": "City Name, Country",
        "alerts": ["alert 1", "alert 2"] (empty array if none)
      }
      Do not include markdown code blocks.`;
      
      const formattedResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: prompt }] }, // Context from first search
            { role: 'model', parts: [{ text: response.text }] },
            { role: 'user', parts: [{ text: jsonPrompt }] }
        ],
        config: {
            responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(formattedResponse.text);
      return { ...data, sources } as WeatherData;

    } catch (error) {
      console.error("Gemini Weather Error:", error);
      return {
        temp: "--",
        condition: "Unavailable",
        humidity: "--",
        wind: "--",
        location: typeof location === 'string' ? location : "Unknown Location",
        alerts: ["Could not fetch live weather data."],
        sources: []
      };
    }
  },

  // 2. AI Chatbot for Emergency
  chatWithAI: async (history: {role: string, parts: {text: string}[]}[], message: string) => {
    try {
      const systemInstruction = `You are the AI Assistant for 'CLIMATE GUARD', a disaster management platform. 
      Your goal is to provide immediate, calm, and accurate survival advice, first aid steps, and emergency contact guidance. 
      Keep responses concise (under 100 words) unless asked for a detailed guide. 
      If the user reports a specific disaster, prioritize safety instructions immediately.`;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history: history as any
      });

      const result = await chat.sendMessage({ message });
      return result.text;
    } catch (error) {
      console.error("Chat Error:", error);
      return "I am currently having trouble connecting to the emergency database. Please call 112 or 911 immediately if you are in danger.";
    }
  },

  // 3. Auto-classify disaster based on description
  classifyReport: async (description: string): Promise<{type: DisasterType, severity: 'Low'|'Medium'|'High'|'Critical'}> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this disaster report description: "${description}". 
            Return a JSON object with:
            1. "type": One of [Flood, Fire, Earthquake, Storm, Landslide, Other]
            2. "severity": One of [Low, Medium, High, Critical]`,
            config: {
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text);
    } catch (e) {
        return { type: DisasterType.OTHER, severity: 'Medium' };
    }
  },

  // 4. Predict Disaster Hotspots
  predictHotspots: async (): Promise<DisasterPrediction[]> => {
    try {
      const prompt = `Identify 3 global regions currently at high risk of natural disasters (Wildfires, Floods, Hurricanes, or Earthquakes) based on current seasonal patterns and major climate news. 
      Return a JSON object with a key "hotspots" containing an array of objects.
      Each object must have:
      - "region": string (City/Area, Country)
      - "type": string (Fire, Flood, Storm, Earthquake)
      - "risk": string (High or Critical)
      - "reason": string (Short explanation under 15 words)
      - "coordinates": { "lat": number, "lng": number } (Approximate location)`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }] // Grounding with search
        }
      });
      
      const data = JSON.parse(response.text);
      return data.hotspots || [];
    } catch (error) {
      console.error("Prediction Error:", error);
      return [];
    }
  },

  // 5. Climate Analytics & Charts
  getClimateAnalytics: async (region: string): Promise<ClimateAnalytics> => {
    try {
      const prompt = `Generate a realistic 5-year climate analysis for "${region}".
      Return a JSON object with:
      - "region": string (The region name)
      - "summary": string (A 50-word summary of climate trends, risks, and changes observed)
      - "yearlyData": Array of 5 objects representing the last 5 years (e.g., 2020-2024), each having:
         - "year": number
         - "avgTemp": number (Average annual temperature in Celsius, realistic variation)
         - "rainfall": number (Annual rainfall in mm, realistic variation)
      - "disasterDistribution": Array of 4-5 objects showing percentages of disaster types likely in this region (must sum to 100), e.g., { "type": "Flood", "percentage": 40 }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("Analytics Error:", error);
      // Fallback data
      return {
        region: region,
        summary: "Unable to retrieve specific data. Showing global average estimates.",
        yearlyData: [
          { year: 2020, avgTemp: 14.5, rainfall: 800 },
          { year: 2021, avgTemp: 14.7, rainfall: 820 },
          { year: 2022, avgTemp: 14.9, rainfall: 790 },
          { year: 2023, avgTemp: 15.1, rainfall: 850 },
          { year: 2024, avgTemp: 15.3, rainfall: 760 }
        ],
        disasterDistribution: [
          { type: "Flood", percentage: 40 },
          { type: "Storm", percentage: 30 },
          { type: "Fire", percentage: 20 },
          { type: "Other", percentage: 10 }
        ]
      };
    }
  }
};