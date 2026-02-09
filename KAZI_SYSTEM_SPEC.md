
# 🤖 KAZI: Workplace Intelligence Agent - System Specification v2.8

## 1. MISSION STATEMENT
KAZI is an agentic orchestration layer designed to transform messy, unstructured workplace evidence (WhatsApp screenshots, Email chains, ID documents) into structured, legally-aligned dossiers. It is optimized for the **ARAG Master Protocol**, ensuring data is extracted with high confidence for insurance claims or administrative updates.

---

## 2. ARCHITECTURAL ARCHETYPE
- **Framework**: React 19 + TypeScript.
- **Styling**: Tailwind CSS (Swiss-Legal Design Language).
- **Core Engine**: Google Gemini 2.5/3 (Flash for speed, Pro for reasoning).
- **Persistence**: Local-First via `localStorage` (Architected for seamless Supabase/PostgreSQL migration).

---

## 3. CORE LOGIC: THE MASTER ORCHESTRATION PROTOCOL
The system operates on a "Unified Evidence Bundle" principle. Unlike standard OCR, KAZI does not process files individually; it sifts through them simultaneously to find truth.

### Extraction Logic (Playbook)
1. **Cross-Referencing**: If an ID shows "John Doe" and a WhatsApp message says "Johnny," the agent resolves this to the legal name but flags a "Protocol Conflict."
2. **Neutrality**: Summaries must be written in a professional "Third-Party Observer" tone.
3. **Deficiency Detection**: The agent explicitly searches for missing "Mandatory Fields" (Name, Policy Number, Incident Date).
4. **Target Portals**: Logic maps categories (e.g., "Address Change") to specific URL endpoints.

---

## 4. DATA MODEL (TYPESCRIPT)
To implement this in another project, use the following schema:

### `AnalysisResult`
```typescript
interface AnalysisResult {
  case_summary: {
    category: string;     // e.g., "Legal Claim", "Address Change"
    target_portal: string; // Destination URL
    status: 'READY' | 'INCOMPLETE';
  };
  copy_paste_fields: {
    Full_Name: string | null;
    Insurance_Number: string | null;
    DOB: string | null;
    Email: string | null;
    Phone: string | null;
    Incident_Date: string | null;
    Address_New: string | null;
    Situation_Summary: string | null;
  };
  missing_information: string[]; // Checklist for the user
  metadata: {
    files_processed: number;
    confidence_score: string; // e.g., "95%"
  };
  is_complete: boolean;
  priority: 'High' | 'Medium';
  conflicts: string[]; // List of discrepancies found between images
}
```

---

## 5. UI COMPONENT RESPONSIBILITIES
- **FileUpload**: Handles binary-to-base64 conversion and batching. It prevents the system from firing until all files are queued.
- **ResultCard**: The "Dossier View." Features "Insta-Copy" logic where double-clicking a field copies it to the clipboard.
- **TaskDashboard**: The "Sifting Queue." Tracks history and allows status transitions (New -> Ongoing -> Done).
- **Playbook Editor**: Allows "Hot-Swapping" of the agent's brain without code changes.

---

## 6. MIGRATION & MERGE PROTOCOL (SYNC)
The app includes a built-in "Export/Import" system.
- **Export**: Generates a `.json` bundle containing the current Playbook logic.
- **Import**: Overwrites the local logic with the incoming bundle, allowing two different instances of KAZI to "share a brain."
- **Supabase Hook**: To move from LocalStorage to Supabase, replace the `useEffect` in `App.tsx` with a standard `supabase.from('tasks').upsert()` call.

---

## 7. DESIGN SYSTEM SPECIFICATIONS
- **Primary Color**: `#4f46e5` (Indigo-600) - Represents Intelligence/Trust.
- **Background**: `#fcfdfe` - High-legibility workspace grey.
- **Typography**: Inter (Geometric Sans). Bold weights (Black 900) for data headers to mimic legal document hierarchy.
- **Motion**: `animate-fade-in-up` for result delivery to provide a "premium synthesis" feel.

---

## 8. ENVIRONMENT REQUIREMENTS
- **API_KEY**: Must be provided via `process.env.API_KEY`.
- **Permissions**: Requires `camera` access if implementing mobile direct-capture.
- **Model Compatibility**: `gemini-3-flash-preview` is recommended for high-volume extraction.
