
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

// Set the worker path for PDF.js
const WORKER_URL = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url);

export const loadPDF = async (file: File): Promise<string> => {
  try {
    // Convert the File to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Extract text from all pages
    let textContent = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // Convert text items to HTML
      const items = content.items as any[];
      const pageText = items
        .map(item => item.str)
        .join(' ');
      
      textContent += `<div class="pdf-page" data-page="${i}">${pageText}</div>`;
    }
    
    return textContent;
  } catch (error) {
    console.error('Error processing PDF:', error);
    return '<p>Error processing PDF. Please try another file.</p>';
  }
};
