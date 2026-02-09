import React from 'react';
import { TaskItem, TaskStatus } from '../types';
import { CheckCircle, AlertTriangle, Shield, FileText, Search, Zap, Layers, AlertCircle, Inbox } from 'lucide-react';

interface TaskDashboardProps {
  tasks: TaskItem[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onView: (task: TaskItem) => void;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({ tasks, onStatusChange, onView }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Protocol Queue</h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Unified Case Sifting</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 text-sm shadow-xl w-96">
            <Search className="w-5 h-5 text-slate-300" />
            <input type="text" placeholder="Search Master Folders..." className="bg-transparent border-none outline-none text-slate-900 placeholder-slate-300 font-bold w-full" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Case Identity</th>
              <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Protocol category</th>
              <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Confidence</th>
              <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Orchestration Status</th>
              <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Workflow Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-6">
                            <div className="p-10 bg-slate-50 rounded-[3rem]">
                                <Inbox className="w-16 h-16 text-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">Queue Depleted</p>
                                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Ready for Unified Intake</p>
                            </div>
                        </div>
                    </td>
                </tr>
            ) : (
                tasks.map((task) => {
                    const clientName = task.result.copy_paste_fields.Full_Name || "IDENTITY_UNKNOWN";
                    const insuranceId = task.result.copy_paste_fields.Insurance_Number || "ID_PENDING";
                    const isClaim = task.result.case_summary.category?.toLowerCase().includes('claim');
                    const hasConflicts = task.result.conflicts && task.result.conflicts.length > 0;
                    const confidence = parseInt(task.result.metadata.confidence_score);
                    
                    return (
                        <tr key={task.id} className="hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => onView(task)}>
                            <td className="px-8 py-8">
                                <div className="flex items-center gap-6">
                                    <div className="relative flex-shrink-0 w-16 h-16">
                                        {task.thumbnails.slice(0, 3).map((thumb, i) => (
                                            <div 
                                                key={i} 
                                                className="absolute w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden"
                                                style={{ 
                                                    left: `${i * 10}px`, 
                                                    top: `${i * 8}px`,
                                                    zIndex: 10 - i,
                                                    transform: i > 0 ? `scale(${1 - i * 0.1})` : 'none'
                                                }}
                                            >
                                                <img src={thumb} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="ml-10">
                                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-lg tracking-tight leading-none">{clientName}</div>
                                        <div className="text-xs font-mono font-bold text-slate-400 mt-2 bg-slate-100 px-2 py-0.5 rounded inline-block uppercase">{insuranceId}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-8">
                                <div className="flex items-center gap-3">
                                    {isClaim ? <Shield className="w-5 h-5 text-red-600"/> : <FileText className="w-5 h-5 text-indigo-600"/>}
                                    <span className="text-slate-900 font-black tracking-tight text-base uppercase">{task.result.case_summary.category}</span>
                                </div>
                                <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {task.thumbnails.length} Unified Files
                                </div>
                            </td>
                            <td className="px-8 py-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-600">
                                        <span>Confidence</span>
                                        <span>{confidence}%</span>
                                    </div>
                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${confidence}%` }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-8">
                                {hasConflicts ? (
                                    <div className="flex items-center gap-2 text-red-700 text-[10px] font-black uppercase bg-red-50 px-4 py-2.5 rounded-2xl border border-red-100">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>Protocol Conflict</span>
                                    </div>
                                ) : task.result.case_summary.status === 'READY' ? (
                                    <div className="flex items-center gap-2 text-emerald-700 text-[10px] font-black uppercase bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>READY TO PASTE</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-amber-700 text-[10px] font-black uppercase bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>INCOMPLETE</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-8 py-8 text-right">
                                <div className="flex justify-end gap-2">
                                    {(['New', 'Ongoing', 'Done'] as TaskStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, status); }}
                                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-widest ${
                                                task.internalStatus === status
                                                    ? status === 'Done' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl'
                                                    : status === 'Ongoing' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl'
                                                    : 'bg-slate-900 text-white border-slate-900 shadow-xl'
                                                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600 shadow-sm'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskDashboard;