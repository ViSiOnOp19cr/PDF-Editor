
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export const loadPDF = async (file: File): Promise<PDFDocumentProxy> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    return await loadingTask.promise;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw error;
  }
};

// Function to convert PDF page to a data URL for fabric.js
export const pdfPageToDataURL = async (page: any, scale: number = 1.5): Promise<string> => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context!,
    viewport: viewport
  }).promise;
  
  return canvas.toDataURL('image/png');
};

// Get dimensions for a specific page
export const getPageDimensions = (page: any, scale: number = 1.5) => {
  const viewport = page.getViewport({ scale });
  return {
    width: viewport.width,
    height: viewport.height
  };
};
