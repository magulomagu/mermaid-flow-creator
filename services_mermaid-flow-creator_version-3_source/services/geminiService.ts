
import { GoogleGenAI } from "@google/genai";
import { DiagramType } from "../types";

export const convertToMermaid = async (
  text: string,
  diagramType: DiagramType
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Convert the following task description into a valid Mermaid.js ${diagramType} code.

  ### CONSTRAINTS:
  1. Return ONLY the raw code. Do NOT include markdown backticks like \`\`\`mermaid or \`\`\`.
  2. Do NOT include any introductory or explanatory text.
  3. LANGUAGE: All labels, names, and text within the diagram MUST be in the same language as the input (primarily Japanese). Do not translate them to English.
  4. For Flowcharts, always start with exactly "flowchart TD" (or LR if more appropriate). Ensure all nodes have unique IDs and labels are in brackets, e.g., A[ラベル].
  5. For Sequence Diagrams, always start with exactly "sequenceDiagram".
  6. For State Diagrams, always start with exactly "stateDiagram-v2".
  7. Ensure all strings in labels are properly handled (avoid special characters that break Mermaid syntax).
  8. If there are multiple steps, ensure clear directional arrows (-->).

  ### TASK DESCRIPTION:
  ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.1, // Lower temperature for more consistent syntax
      },
    });

    let result = response.text || "";
    
    // Robust cleanup:
    // 1. Remove markdown code blocks if present
    result = result.replace(/```mermaid/gi, '');
    result = result.replace(/```/g, '');
    
    // 2. Find the start of the actual mermaid code based on type
    const keywords = ["flowchart", "sequenceDiagram", "stateDiagram-v2", "graph"];
    let startIndex = -1;
    for (const kw of keywords) {
      const idx = result.toLowerCase().indexOf(kw.toLowerCase());
      if (idx !== -1 && (startIndex === -1 || idx < startIndex)) {
        startIndex = idx;
      }
    }

    if (startIndex !== -1) {
      result = result.substring(startIndex);
    }

    return result.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI変換中にエラーが発生しました。インターネット接続やAPIキーを確認してください。");
  }
};
