import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
      alert('Please upload an HTML file');
      return;
    }

    setIsProcessing(true);
    try {
      const content = await file.text();
      setUploadedFile(file.name);
      onFileUpload(content, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const clearFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <Upload className={`mx-auto h-12 w-12 mb-4 ${
            isDragOver ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isProcessing ? 'Processing file...' : 'Upload HTML file'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop your HTML file here, or click to browse
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".html,text/html"
              onChange={handleFileInput}
              disabled={isProcessing}
            />
            <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Browse Files
            </span>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{uploadedFile}</p>
              <p className="text-sm text-green-600">File uploaded successfully</p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;