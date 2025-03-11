
import React, { useState, useEffect, useRef } from 'react';
import { Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface PDFEditorProps {
  pdfContent: string;
  onSave: (content: string) => void;
  fileName?: string;
}

const PDFEditor = ({ pdfContent, onSave, fileName = 'document.pdf' }: PDFEditorProps) => {
  const [content, setContent] = useState(pdfContent);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(pdfContent);
  }, [pdfContent]);

  const handleSave = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onSave(newContent);
      toast.success('Changes saved successfully');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      if (editorRef.current) {
        // Basic HTML to PDF conversion
        const html = editorRef.current.innerText;
        const splitText = doc.splitTextToSize(html, 180);
        doc.text(splitText, 15, 15);
        doc.save(fileName);
        
        toast.success('PDF exported successfully');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Edit Document</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      <div 
        ref={editorRef}
        className="w-full min-h-[500px] p-6 border rounded-lg overflow-auto"
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onBlur={() => {
          if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
          }
        }}
      />
    </div>
  );
};

export default PDFEditor;
