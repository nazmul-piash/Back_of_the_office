import React, { useState, useEffect } from 'react';
import { Bot, LayoutDashboard, FilePlus, Settings, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ResultCard from './components/ResultCard';
import TaskDashboard from './components/TaskDashboard';
import { analyzeScreenshots, DEFAULT_PLAYBOOK } from './services/geminiService';
import { AnalysisResult, TaskItem, TaskStatus } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new' | 'playbook'>('new');
  const [playbookInstruction, setPlaybookInstruction] = useState(DEFAULT_PLAYBOOK);
  
  // App State
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Current Processing State
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleFilesSelect = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    setCurrentResult(null);

    try {
      const readers = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64s = await Promise.all(readers);
      setCurrentImages(base64s);

      try {
        const result = await analyzeScreenshots(base64s, playbookInstruction);
        setCurrentResult(result);

        const newTask: TaskItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          thumbnails: base64s,
          result: result,
          internalStatus: 'New'
        };
        
        setTasks(prev => [newTask, ...prev]);
      } catch (err) {
        console.error(err);
        setError("Orchestration failed. Verify API configuration and input quality.");
      } finally {
        setIsProcessing(false);
      }
    } catch (err) {
      setError("I/O Error: Unable to read source materials.");
      setIsProcessing(false);
    }
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, internalStatus: status } : t));
  };

  const handleViewTask = (task: TaskItem) => {
    setCurrentImages(task.thumbnails);
    setCurrentResult(task.result);
    setError(null);
    setActiveTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch(activeTab) {
        case 'dashboard':
            return <TaskDashboard tasks={tasks} onStatusChange={handleStatusChange} onView={handleViewTask} />;
        
        case 'playbook':
            return (
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Master Orchestration Protocol</h2>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Refining KAZI extraction logic</p>
                            </div>
                            <Settings className="w-8 h-8 text-slate-300" />
                        </div>
                        <textarea
                            value={playbookInstruction}
                            onChange={(e) => setPlaybookInstruction(e.target.value)}
                            className="w-full h-[500px] p-8 font-mono text-sm border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 mb-8 bg-slate-50 text-slate-700 outline-none"
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={() => alert("Protocol logic updated successfully.")}
                                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black shadow-xl shadow-indigo-100 transition-all uppercase text-xs tracking-widest"
                            >
                                <Save className="w-5 h-5" /> Commit Logic Changes
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'new':
        default:
            return (
                <div className="max-w-5xl mx-auto space-y-12">
                     {!currentResult && !isProcessing && (
                         <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-16 rounded-[3rem] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <ShieldCheck className="w-12 h-12 text-indigo-50 opacity-20" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">New Unified Intake</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mb-12">ARAG Master Protocol Extraction</p>
                                <FileUpload onFilesSelect={handleFilesSelect} isProcessing={isProcessing} />
                                {error && (
                                    <div className="mt-10 p-6 bg-red-50 text-red-700 rounded-2xl border-2 border-red-100 flex items-start gap-4 text-left">
                                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black uppercase text-xs tracking-widest mb-1">System Error</p>
                                            <p className="font-bold">{error}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                         </div>
                    )}

                    {isProcessing && (
                        <div className="bg-white p-24 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[550px]">
                            <div className="relative">
                                <div className="w-32 h-32 border-8 border-slate-50 border-t-indigo-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Bot className="w-12 h-12 text-indigo-600" />
                                </div>
                            </div>
                            <h3 className="mt-12 text-3xl font-black text-slate-900 tracking-tighter">Sifting & Synthesizing</h3>
                            <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Processing {currentImages.length} Source Documents</p>
                        </div>
                    )}

                    {currentResult && !isProcessing && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Extracted Dossier</h2>
                                    <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-indigo-100">Synthesis Complete</span>
                                </div>
                                <button 
                                    onClick={() => { setCurrentResult(null); setCurrentImages([]); }}
                                    className="text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2 px-6 py-3 rounded-2xl hover:bg-slate-100 transition-all"
                                >
                                    New Orchestration
                                </button>
                            </div>

                            <ResultCard data={currentResult} sourceImages={currentImages} />
                        </div>
                    )}
                </div>
            );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-32 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-5">
              <div className="bg-indigo-600 p-3 rounded-[1.25rem] shadow-2xl shadow-indigo-100">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tighter">KAZI ORCHESTRATOR</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-600 mt-2">ARAG Master Protocol v2.5</p>
              </div>
            </div>
            
            <div className="flex space-x-3 bg-slate-100/50 p-2 rounded-2xl">
              <TabButton active={activeTab === 'new'} onClick={() => setActiveTab('new')} icon={<FilePlus className="w-5 h-5"/>} label="Intake" />
              <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className="w-5 h-5"/>} label="Queue" />
              <TabButton active={activeTab === 'playbook'} onClick={() => setActiveTab('playbook')} icon={<Settings className="w-5 h-5"/>} label="Protocol" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-10 py-12">
        {renderContent()}
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-widest ${
            active ? 'bg-white text-slate-900 shadow-xl ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
        }`}
    >
        {icon}
        {label}
    </button>
);

export default App;