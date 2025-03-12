import React, { useState, useEffect } from 'react';
import { Download, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { PDFDocumentProxy } from 'pdfjs-dist';
import PDFCanvasEditor from './PDFCanvasEditor';
import { fabric } from 'fabric';
import { fabricCanvasToPDF } from '@/utils/fabricUtils';

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
    // You could implement additional logic here to save to a server
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Preparing PDF for export...');
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt'
      });
      
      // Process each edited page
      let isFirstPage = true;
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const canvas = editedCanvases.get(pageNum);
        
        if (canvas) {
          // Add a new page for all pages except the first one
          if (!isFirstPage) {
            doc.addPage();
          }
          isFirstPage = false;
          
          // Make sure all objects are rendered properly
          canvas.renderAll();
          
          // Wait a moment to ensure all images are fully rendered
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get the data URL with higher quality and proper image format
          const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 1.0,
            multiplier: 2  // Increase resolution
          });
          
          // Add the image to the PDF
          doc.addImage(
            dataURL, 
            'JPEG', 
            0, 
            0, 
            doc.internal.pageSize.getWidth(), 
            doc.internal.pageSize.getHeight()
          );
        } else if (pageNum <= pdfContent.numPages) {
          // For non-edited pages, try to get the original page from the PDF
          try {
            // Add a new page for all pages except the first one
            if (!isFirstPage) {
              doc.addPage();
            }
            isFirstPage = false;
            
            // Get the page from the original PDF
            const page = await pdfContent.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            
            // Create a canvas to render the PDF page
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
              canvasContext: context!,
              viewport: viewport
            }).promise;
            
            // Add the rendered page to the PDF
            const dataURL = canvas.toDataURL('image/jpeg', 1.0);
            doc.addImage(
              dataURL, 
              'JPEG', 
              0, 
              0, 
              doc.internal.pageSize.getWidth(), 
              doc.internal.pageSize.getHeight()
            );
          } catch (error) {
            console.error(`Error rendering page ${pageNum}:`, error);
          }
        }
      }
      
      // Save the PDF
      doc.save(fileName);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-50% bg-white rounded-xl shadow-lg p-6">
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
