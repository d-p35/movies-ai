import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const geminiGenerate = async (prompt: string, movies: any): Promise<string | undefined> => {
  const apiKey = process.env.GEMINI_API_KEY; // Replace with your API key

  if (apiKey) {
    const generationConfig = {
      temperature: 0.5,
      topP: 0.95,
      topK: 40,
      // maxOutputTokens: 200,
      responseMimeType: "text/plain",
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
    });

    try {
      const chatSession = await model.startChat({
        generationConfig,
        history: [],
      });

      const res = await chatSession.sendMessage(
        "Find the movie with the title that matches: " + prompt + " from these movies/tv shows: " + movies + ". Make sure to look at all of them. Return the top 3 most relevant names of titles separated by commas and nothing else."
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
    const {prompt, movies} = await req.json();
    if (!prompt || !movies) {
      return NextResponse.json({ error: "No prompt or movies provided" }, { status: 400 });
    }

    const moviesString = movies.map((movie: any) => movie.movieTitle).join(", ");
    console.log(moviesString);
    console.log(prompt);
    const movie = await geminiGenerate(prompt, moviesString);
    // const movieItem = movies.find((m: any) => m.movieTitle === movie);
    if (!movie) {
      return NextResponse.json({ error: "No movie found" }, { status: 404 });
    }
    const movieSplit = movie.split(",");

    const movieItems = [];
    for (const m of movieSplit) {
      const movieItem = movies.find((movie: any) => movie.movieTitle === m.trim());
      if (movieItem) {
        movieItems.push(movieItem);
        movies.splice(movies.indexOf(movieItem), 1);
      }
    }


    return NextResponse.json(movieItems);
    // return NextResponse.json(movieItem);
  } catch (error) {
    console.error("Error during Gemini Generation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
