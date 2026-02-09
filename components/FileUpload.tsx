
import React, { useCallback, useState } from 'react';
import { Upload, FileImage, Loader2, Files, Bot } from 'lucide-react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelect(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
    }
  }, [onFilesSelect]);

  return (
    <div
      className={`relative w-full h-72 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center p-8 ${
        dragActive 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-300 bg-white hover:border-indigo-400'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : 'shadow-sm hover:shadow-md'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept="image/*"
        multiple
        disabled={isProcessing}
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <Bot className="absolute inset-0 m-auto w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-indigo-600">Aggregating Data...</p>
            <p className="text-xs text-indigo-400">Comparing multiple sources for conflicts</p>
          </div>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Files className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Upload Multiple Sources
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Upload screenshots of WhatsApp, Emails, and IDs together. We'll automatically merge the information.
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs font-medium text-gray-400">
            <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
                <FileImage className="w-3.5 h-3.5" /> Multiple Images
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Batch Processing Ready</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;
