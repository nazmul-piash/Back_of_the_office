
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const DEFAULT_PLAYBOOK = `
# ROLE: KAZI MASTER ORCHESTRATOR (ADVANCED ARAG PROTOCOL)
# OBJECTIVE: High-precision data extraction and cross-source synthesis from workplace screenshots.

[CORE LOGIC]
- Treat all uploaded images as a single unified evidence bundle.
- Cross-reference data between IDs, emails, and chat screenshots.
- Flag discrepancies in names, dates, or addresses as "Conflicts."
- Ensure the "Situation_Summary" is professional, objective, and ready for mediation or legal claims.

[ACCURACY RULES]
- If a specific data field is not found in any source, return the string "NOT_FOUND".
- NEVER guess or hallucinate data.
- Set 'is_complete' to true ONLY if Full Name, Insurance Number, and a clear Situation Summary are present.
- Output MUST be a single, valid JSON object.
`;

export const analyzeScreenshots = async (base64Images: string[], systemInstruction: string = DEFAULT_PLAYBOOK): Promise<AnalysisResult> => {
  // Fresh instance to ensure latest environment variables are used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const imageParts = base64Images.map(img => {
      // Dynamically detect MIME type to prevent API errors
      const mimeTypeMatch = img.match(/data:([^;]+);base64/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      
      return {
        inlineData: {
          mimeType: mimeType,
          data: img.replace(/^data:image\/\w+;base64,/, ""),
        },
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // The 'Pro' model is required for perfect synthesis and reasoning
      contents: {
        parts: [
          ...imageParts,
          {
            text: "Execute Master Orchestration Protocol. Extract all relevant workplace task data and synthesize into a unified dossier. Return JSON only.",
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 4000 }, // Allow the model to "think" for better accuracy
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            case_summary: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                target_portal: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["READY", "INCOMPLETE"] }
              },
              required: ["category", "target_portal", "status"]
            },
            copy_paste_fields: {
              type: Type.OBJECT,
              properties: {
                Full_Name: { type: Type.STRING },
                Insurance_Number: { type: Type.STRING },
                DOB: { type: Type.STRING },
                Email: { type: Type.STRING },
                Phone: { type: Type.STRING },
                Incident_Date: { type: Type.STRING },
                Address_New: { type: Type.STRING },
                Situation_Summary: { type: Type.STRING }
              },
              required: ["Full_Name", "Insurance_Number", "DOB", "Email", "Phone", "Incident_Date", "Address_New", "Situation_Summary"]
            },
            missing_information: { type: Type.ARRAY, items: { type: Type.STRING } },
            metadata: {
              type: Type.OBJECT,
              properties: {
                files_processed: { type: Type.INTEGER },
                confidence_score: { type: Type.STRING }
              },
              required: ["files_processed", "confidence_score"]
            },
            is_complete: { type: Type.BOOLEAN },
            priority: { type: Type.STRING, enum: ["High", "Medium"] },
            conflicts: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["case_summary", "copy_paste_fields", "missing_information", "metadata", "is_complete", "priority", "conflicts"],
          propertyOrdering: ["case_summary", "copy_paste_fields", "missing_information", "metadata", "is_complete", "priority", "conflicts"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI engine.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Master Orchestration Error:", error);
    // Propagate a more descriptive error if available
    throw new Error(error.message || "Extraction Failed");
  }
};
