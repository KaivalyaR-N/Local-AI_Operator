import { GoogleGenAI, Type } from "@google/genai";
import { ProjectFile } from '../types';

const projectGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.ARRAY,
      description: "An array of file objects that constitute the project.",
      items: {
        type: Type.OBJECT,
        properties: {
          filename: {
            type: Type.STRING,
            description: "The full path for the file, e.g., 'src/app.js' or 'index.html'.",
          },
          content: {
            type: Type.STRING,
            description: "The complete source code or content for this file.",
          },
        },
        required: ["filename", "content"],
      },
    },
  },
  required: ["files"],
};


export const generateProjectFromGoal = async (goal: string): Promise<Omit<ProjectFile, 'id'>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `My goal is: "${goal}". 
        Based on this goal, generate a complete project structure with all the necessary files and their content. 
        For example, if the goal is 'a simple html page with a button', you should generate an index.html file and maybe a style.css file.
        Ensure the code is complete and runnable.
        Provide the output as a JSON object containing a list of files, where each file has a 'filename' and its corresponding 'content'.
        Do not add any introductory text or explanation outside of the JSON structure.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: projectGenerationSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (!result.files || !Array.isArray(result.files)) {
        throw new Error("AI did not return a valid project file structure.");
    }
    
    return result.files;
  } catch (error) {
    console.error("Error generating project from Gemini:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the AI's response. The format was invalid.");
    }
    throw new Error("Failed to generate a project. Please check your goal or API key and try again.");
  }
};