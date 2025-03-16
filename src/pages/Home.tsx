import React from 'react';
import { useNavigate } from 'react-router-dom';
import PDFUploader from '@/components/PDFUploader';
import { motion } from 'framer-motion';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Landing page component that allows users to upload or select PDFs for editing
const Home = () => {
  const navigate = useNavigate();

  const handleFileSelect = async (file: File, pdf: PDFDocumentProxy) => {
    // Generate a unique ID for the file
    const fileId = Date.now().toString();
    
    // Store the file and PDF data in sessionStorage
    sessionStorage.setItem(`pdf_file_${fileId}`, JSON.stringify({
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      size: file.size
    }));
    
    // Convert file to base64 and store it
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      sessionStorage.setItem(`pdf_data_${fileId}`, base64);
      
      // Navigate to the editor page with the file ID
      navigate(`/editor/${fileId}`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              PDF Editor
            </h1>
            <p className="text-lg text-gray-600">
              Upload your PDF document to get started
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PDFUploader 
            onFileSelect={handleFileSelect}
            className="max-w-2xl mx-auto"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Home; 