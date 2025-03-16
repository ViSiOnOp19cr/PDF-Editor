// Component for uploading and processing PDF files before editing
import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { loadPDF } from '@/utils/pdfUtils';
import { PDFDocumentProxy } from 'pdfjs-dist';

interface PDFUploaderProps {
  onFileSelect: (file: File, content: PDFDocumentProxy) => void;
  className?: string;
}

const PDFUploader = ({ onFileSelect, className }: PDFUploaderProps) => {
  const handleFile = useCallback(async (file: File) => {
    if (file && file.type === 'application/pdf') {
      try {
        toast.info('Processing PDF, please wait...');
        const pdf = await loadPDF(file);
        onFileSelect(file, pdf);
        toast.success('PDF loaded successfully');
      } catch (error) {
        console.error('Error processing PDF:', error);
        toast.error('Failed to process PDF');
      }
    } else {
      toast.error('Please upload a PDF file');
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className={cn(
        "relative group cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-12 transition-all hover:border-blue-400",
        "bg-white/50 backdrop-blur-sm hover:bg-white/60",
        className
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept=".pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-full bg-blue-50 text-blue-500">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700">Upload your PDF</h3>
          <p className="mt-1 text-sm text-gray-500">Drag and drop or click to select</p>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
