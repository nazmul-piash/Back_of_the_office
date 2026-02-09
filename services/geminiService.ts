
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const DEFAULT_PLAYBOOK = `
# ROLE: KAZI MASTER ORCHESTRATOR (ADVANCED ARAG PROTOCOL)
# OBJECTIVE: High-precision data extraction and cross-source synthesis.

[CORE LOGIC]
- Treat all files as one evidence bundle.
- Cross-reference ID documents with text-based screenshots.
- Flag discrepancies in addresses or names as "Conflicts."
- Ensure the "Situation_Summary" is written in a professional, neutral tone.

[TARGET PORTALS]
- Address Change: https://www.arag.de/service/kundenservice/aenderungsmeldung/adressaenderung
- Bank Change: https://www.arag.de/service/kundenservice/aenderungsmeldung/bankverbindung
- Claim: https://www.arag.de/service/kundenservice/schadensmeldung/rechtsschutz/

[ACCURACY]
- If a field is missing, return "NOT_FOUND". Do not guess.
- Set is_complete to true ONLY if Full Name, Insurance Number, and Case Details are all present.
- Output MUST be valid JSON.
`;

export const analyzeScreenshots = async (base64Images: string[], systemInstruction: string = DEFAULT_PLAYBOOK): Promise<AnalysisResult> => {
  // Always create a fresh instance to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const imageParts = base64Images.map(img => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: img.replace(/^data:image\/\w+;base64,/, ""),
      },
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Flash is better for high-speed JSON extraction
      contents: {
        parts: [
          ...imageParts,
          {
            text: "Extract and synthesize all data from these files. Follow the Master Protocol strictly. Return JSON only.",
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
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
          required: ["case_summary", "copy_paste_fields", "missing_information", "metadata", "is_complete", "priority", "conflicts"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI Engine returned an empty response.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Master Orchestration Error:", error);
    throw error;
  }
};
