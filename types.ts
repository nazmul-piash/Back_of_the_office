export interface AnalysisResult {
  case_summary: {
    category: string;
    target_portal: string;
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
  missing_information: string[];
  metadata: {
    files_processed: number;
    confidence_score: string;
  };
  // UI helper fields
  is_complete: boolean;
  priority: 'High' | 'Medium';
  conflicts: string[];
}

export type TaskStatus = 'New' | 'Ongoing' | 'Done';

export interface TaskItem {
  id: string;
  timestamp: number;
  thumbnails: string[];
  result: AnalysisResult;
  internalStatus: TaskStatus;
}