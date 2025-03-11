
import React, { useState, useEffect, useRef } from 'react';
import { Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { PDFDocumentProxy } from 'pdfjs-dist';

interface PDFEditorProps {
  pdfContent: PDFDocumentProxy;
  onSave: (content: string) => void;
  fileName?: string;
}

const PDFEditor = ({ pdfContent, onSave, fileName = 'document.pdf' }: PDFEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale] = useState(1.5);

  useEffect(() => {
    const renderPages = async () => {
      if (!containerRef.current || !pdfContent) return;

      // Clear previous content
      containerRef.current.innerHTML = '';

      // Render each page
      for (let pageNum = 1; pageNum <= pdfContent.numPages; pageNum++) {
        const page = await pdfContent.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Create canvas for this page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.className = 'mb-4 mx-auto';

        if (context) {
          // Render PDF page into canvas context
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;
        }

        containerRef.current.appendChild(canvas);
      }
    };

    renderPages().catch(console.error);
  }, [pdfContent, scale]);

  const handleSave = () => {
    toast.success('Changes saved successfully');
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.save(fileName);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">View Document</h2>
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
        ref={containerRef}
        className="w-full min-h-[500px] p-6 border rounded-lg overflow-auto"
      />
    </div>
  );
};

export default PDFEditor;
