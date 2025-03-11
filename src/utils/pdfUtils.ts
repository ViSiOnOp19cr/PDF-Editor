
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';

// We need to manually set the worker source
import * as pdfjsLib from 'pdfjs-dist';

// The worker needs to be set up differently for Vite
// This is the recommended way to set up the worker in a Vite environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
