import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, Shield, FileText, ExternalLink, Percent, Layers, AlertCircle, ClipboardList, Info } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultCardProps {
  data: AnalysisResult;
  onFillPortal?: () => void;
  sourceImages?: string[];
}

const ResultCard: React.FC<ResultCardProps> = ({ data, onFillPortal, sourceImages = [] }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string | null, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasConflicts = data.conflicts && data.conflicts.length > 0;
  const isReady = data.case_summary.status === 'READY';

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up">
        {/* ARAG MASTER HEADER */}
        <div className={`p-6 border-b flex items-center justify-between ${isReady ? 'bg-indigo-900 text-white' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${isReady ? 'bg-indigo-700' : 'bg-white shadow-sm text-amber-600'}`}>
                    <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                    <h3 className={`font-black text-2xl tracking-tight leading-none mb-2 ${isReady ? 'text-white' : 'text-slate-900'}`}>
                        {data.case_summary.category}
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded tracking-widest uppercase ${isReady ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                            {data.case_summary.status}
                        </span>
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${isReady ? 'text-indigo-200' : 'text-slate-500'}`}>
                           <Percent className="w-4 h-4" /> {data.metadata.confidence_score} Extraction Confidence
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {data.case_summary.target_portal && (
                    <a
                        href={data.case_summary.target_portal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border ${
                            isReady ? 'bg-indigo-800 border-indigo-700 hover:bg-indigo-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                    >
                        <ExternalLink className="w-4 h-4" />
                        Target Portal
                    </a>
                )}
            </div>
        </div>

        {/* CONFLICT WARNINGS */}
        {hasConflicts && (
            <div className="bg-red-600 p-5 border-b border-red-700">
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-white shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Master Protocol Conflict</h4>
                        <div className="mt-2 space-y-1.5">
                            {data.conflicts?.map((conflict, i) => (
                                <p key={i} className="text-sm text-red-50 font-bold leading-tight">→ {conflict}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* COPY-PASTE DATA FIELDS GRID */}
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Protocol Data Extract</h4>
                </div>
                <p className="text-[10px] text-slate-400 font-bold italic">Double-click values to copy instantly</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <CopyRow label="Full Name" value={data.copy_paste_fields.Full_Name} onCopy={() => handleCopy(data.copy_paste_fields.Full_Name, 'name')} copied={copiedField === 'name'} />
                <CopyRow label="Insurance Number" value={data.copy_paste_fields.Insurance_Number} onCopy={() => handleCopy(data.copy_paste_fields.Insurance_Number, 'policy')} copied={copiedField === 'policy'} mono />
                <CopyRow label="Date of Birth" value={data.copy_paste_fields.DOB} onCopy={() => handleCopy(data.copy_paste_fields.DOB, 'dob')} copied={copiedField === 'dob'} />
                <CopyRow label="Incident Date" value={data.copy_paste_fields.Incident_Date} onCopy={() => handleCopy(data.copy_paste_fields.Incident_Date, 'date')} copied={copiedField === 'date'} />
                <CopyRow label="Email Address" value={data.copy_paste_fields.Email} onCopy={() => handleCopy(data.copy_paste_fields.Email, 'email')} copied={copiedField === 'email'} />
                <CopyRow label="Phone Number" value={data.copy_paste_fields.Phone} onCopy={() => handleCopy(data.copy_paste_fields.Phone, 'phone')} copied={copiedField === 'phone'} />
                <CopyRow label="New Address" value={data.copy_paste_fields.Address_New} onCopy={() => handleCopy(data.copy_paste_fields.Address_New, 'address')} copied={copiedField === 'address'} />
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between col-span-1 md:col-span-1">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase">Orchestration Files</span>
                        <p className="text-lg font-black text-slate-900">{data.metadata.files_processed}</p>
                    </div>
                    <Layers className="w-8 h-8 text-slate-300" />
                </div>
            </div>

            {/* SITUATION SUMMARY - FULL WIDTH */}
            <div className="mt-12 space-y-4">
                <div className="flex items-center gap-2 text-indigo-700">
                    <FileText className="w-5 h-5" />
                    <h5 className="font-black text-xs uppercase tracking-widest">Situation Summary (Mediation/Claim)</h5>
                </div>
                <div className="relative group">
                    <div className="p-6 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 text-slate-800 leading-relaxed font-medium text-sm transition-all hover:bg-white hover:border-indigo-300">
                        {data.copy_paste_fields.Situation_Summary || "No summary required for this category."}
                    </div>
                    {data.copy_paste_fields.Situation_Summary && (
                        <button 
                            onClick={() => handleCopy(data.copy_paste_fields.Situation_Summary, 'summary')}
                            className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            {copiedField === 'summary' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>

            {/* MISSING INFO - PROTOCOL CHECKLIST */}
            {data.missing_information.length > 0 && (
                <div className="mt-12 p-6 bg-slate-900 rounded-2xl">
                    <div className="flex items-center gap-3 text-white mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h5 className="font-black text-xs uppercase tracking-widest">Protocol Deficiencies (Action Required)</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.missing_information.map((field, i) => (
                            <span key={i} className="px-4 py-2 bg-slate-800 text-amber-400 text-[10px] font-black rounded-xl uppercase tracking-wider border border-slate-700">
                                MISSING: {field}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* REEL OF PROOF */}
      {sourceImages.length > 0 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Layers className="w-6 h-6 text-indigo-600" />
                    Unified Case Folder Material
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {sourceImages.map((img, i) => (
                      <div key={i} className="group relative rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 aspect-square shadow-sm hover:border-indigo-500 transition-all cursor-zoom-in">
                          <img 
                              src={img} 
                              alt={`Case File ${i+1}`} 
                              className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors"></div>
                          <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white px-2 py-0.5 rounded text-[9px] font-black">
                              FILE {i+1}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

const CopyRow = ({ label, value, onCopy, copied, mono }: { label: string, value: string | null, onCopy: () => void, copied: boolean, mono?: boolean }) => (
    <div className="group border-b border-slate-100 py-4 flex flex-col gap-1 relative overflow-hidden">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            {value && (
                <button onClick={onCopy} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
            )}
        </div>
        <p 
            onDoubleClick={onCopy}
            className={`text-base font-black truncate cursor-pointer select-all transition-colors ${
                value ? 'text-slate-900 hover:text-indigo-700' : 'text-slate-200 italic font-medium'
            } ${mono ? 'font-mono' : ''}`}
        >
            {value || "DATA_NOT_FOUND"}
        </p>
        {copied && <div className="absolute inset-0 bg-indigo-600/5 animate-pulse pointer-events-none"></div>}
    </div>
);

export default ResultCard;