import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const geminiGenerate = async (prompt: string): Promise<string | undefined> => {
  const apiKey = process.env.GEMINI_API_KEY; // Replace with your API key

  if (apiKey) {
    const generationConfig = {
      temperature: 0.5,
      topP: 0.95,
      topK: 40,
      // maxOutputTokens: 200,
      responseMimeType: "text/plain",
    };
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    try {
      const chatSession = await model.startChat({
        generationConfig,
        history: [],
      });

      const res = await chatSession.sendMessage(
        prompt +
          ". Make sure to only return the title of the Movie and nothing else",
      );

      const responseText = await res.response.text().trim();

      return responseText;
    } catch (error) {
      console.error("Error during text classification:", error);
    }
  } else {
    console.error("API key is undefined");
  }
};

export async function POST(req: Request) {
  try {
    const {prompt} = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }
    const result = await geminiGenerate(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error during Gemini Generation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
