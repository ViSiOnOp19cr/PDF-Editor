import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PDFEditor from '@/components/PDFEditor';
import { motion } from 'framer-motion';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Page component for the PDF editor interface that integrates various editing tools
const Editor = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [fileName, setFileName] = useState<string>('document.pdf');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPDF = async () => {
      if (!fileId) {
        toast.error('No file ID provided');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        
        // Get file data from sessionStorage
        const fileDataStr = sessionStorage.getItem(`pdf_file_${fileId}`);
        const pdfDataStr = sessionStorage.getItem(`pdf_data_${fileId}`);
        
        if (!fileDataStr || !pdfDataStr) {
          toast.error('PDF data not found');
          navigate('/');
          return;
        }
        
        const fileData = JSON.parse(fileDataStr);
        setFileName(fileData.name);
        
        // Convert base64 to ArrayBuffer
        const base64 = pdfDataStr.split(',')[1];
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Load PDF document
        const loadingTask = getDocument({ data: bytes.buffer });
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast.error('Failed to load PDF');
        navigate('/');
      }
    };
    
    loadPDF();
  }, [fileId, navigate]);

  const handleSave = (content: string) => {
    // Handle save operation if needed
    console.log('Content saved:', content);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-none">
        <div className="mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToHome}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Upload
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          {pdfDocument && (
            <PDFEditor 
              pdfContent={pdfDocument}
              onSave={handleSave}
              fileName={fileName}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Editor; 