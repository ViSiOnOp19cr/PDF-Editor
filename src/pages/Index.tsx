
import React, { useState } from 'react';
import PDFUploader from '@/components/PDFUploader';
import PDFEditor from '@/components/PDFEditor';
import { motion } from 'framer-motion';

const Index = () => {
  const [pdfContent, setPdfContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const handleFileSelect = async (file: File) => {
    // For now, we'll just simulate PDF content
    const reader = new FileReader();
    reader.onload = () => {
      setPdfContent('Sample PDF content for editing');
      setIsEditing(true);
    };
    reader.readAsText(file);
  };

  const handleSave = (content: string) => {
    setPdfContent(content);
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
              Edit your PDF documents with ease
            </p>
          </div>
        </motion.div>

        {!isEditing ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PDFEditor 
              pdfContent={pdfContent}
              onSave={handleSave}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
