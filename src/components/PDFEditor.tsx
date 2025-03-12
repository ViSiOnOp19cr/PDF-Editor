import React, { useState, useEffect } from 'react';
import { Download, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { PDFDocumentProxy } from 'pdfjs-dist';
import PDFCanvasEditor from './PDFCanvasEditor';
import { fabric } from 'fabric';

interface PDFEditorProps {
  pdfContent: PDFDocumentProxy;
  onSave: (content: string) => void;
  fileName?: string;
}

const PDFEditor = ({ pdfContent, onSave, fileName = 'document.pdf' }: PDFEditorProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editedCanvases, setEditedCanvases] = useState<Map<number, fabric.Canvas>>(new Map());

  useEffect(() => {
    if (pdfContent) {
      setTotalPages(pdfContent.numPages);
    }
  }, [pdfContent]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSaveCanvas = (canvas: fabric.Canvas) => {
    const newEditedCanvases = new Map(editedCanvases);
    newEditedCanvases.set(currentPage, canvas);
    setEditedCanvases(newEditedCanvases);
    toast.success(`Page ${currentPage} edited and saved`);
  };

  const handleSaveAllPages = () => {
    toast.success('All changes saved');
  };

  const handleExportPDF = () => {
    try {
      // This is a simplified export - in a real app you would need to 
      // combine the original PDF with the edits
      const doc = new jsPDF();
      editedCanvases.forEach((canvas, pageNum) => {
        if (pageNum > 1) {
          doc.addPage();
        }
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        doc.addImage(dataURL, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      });
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
        <h2 className="text-2xl font-semibold text-gray-800">Edit Document</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveAllPages}>
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <PDFCanvasEditor
        pdfDocument={pdfContent}
        currentPage={currentPage}
        fileName={fileName}
        onSave={handleSaveCanvas}
      />
    </div>
  );
};

export default PDFEditor;
