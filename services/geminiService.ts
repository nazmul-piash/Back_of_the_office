
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const DEFAULT_PLAYBOOK = `
# ROLE: KAZI DATA ORCHESTRATOR (ARAG MASTER PROTOCOL)
# OBJECTIVE: Multi-file data extraction, synthesis, and preparation for manual copy-pasting.

[SYSTEM CONFIGURATION]
- Context: Treat ALL uploaded files as a single "Unified Case File."
- Logic: Merge split info. Prioritize PDF data over Screenshot data if there is a conflict.
- Accuracy: Zero hallucination. Use null if data is not present.

[DATA EXTRACTION & MAPPING]
1. IDENTIFY intent: (Address Change, Claim, Mediation, Health Card).
2. TARGET PORTALS:
   - Address Change: https://www.arag.de/service/kundenservice/aenderungsmeldung/adressaenderung
   - Bank Change: https://www.arag.de/service/kundenservice/aenderungsmeldung/bankverbindung
   - Claim: https://www.arag.de/service/kundenservice/schadensmeldung/rechtsschutz/
3. FOR MEDIATION/CLAIMS: Situation_Summary must be a concise 5-10 line summary.

[OUTPUT SCHEMA REQUIREMENTS]
- Return a JSON object matching the provided schema.
- is_complete is true only if all protocol-relevant fields for that category are found.
`;

export const analyzeScreenshots = async (base64Images: string[], systemInstruction: string = DEFAULT_PLAYBOOK): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const imageParts = base64Images.map(img => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: img.replace(/^data:image\/\w+;base64,/, ""),
      },
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          ...imageParts,
          {
            text: "Execute the KAZI Orchestration protocol. Synthesize these files into the ARAG Master JSON schema.",
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
    if (!text) {
      throw new Error("No response from Orchestrator.");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Orchestration Error:", error);
    throw error;
  }
};
