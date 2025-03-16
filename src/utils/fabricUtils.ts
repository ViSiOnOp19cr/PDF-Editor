import { fabric } from 'fabric';
import { jsPDF } from 'jspdf';
import DOMPurify from 'dompurify';

// Re-export fabric object for easier use
export { fabric };

// Utility functions for working with Fabric.js canvas and PDF integration

// Helper to create text objects with enhanced editing capabilities
export const createText = (text: string, options: any) => {
  const textObject = new fabric.Text(text, {
    fontFamily: 'Arial',
    fontSize: 20,
    fill: '#000000',
    editable: true,
    ...options
  });
  
  return textObject;
};

// Helper to create rectangle objects
export const createRect = (options: any) => {
  return new fabric.Rect(options);
};

// Helper to create circle objects
export const createCircle = (options: any) => {
  return new fabric.Circle(options);
};

// Helper for creating text boxes with rich text capabilities
export const createTextbox = (text: string, options: any) => {
  return new fabric.Textbox(text, {
    fontFamily: 'Arial',
    fontSize: 20,
    fill: '#000000',
    width: 300,
    editable: true,
    ...options
  });
};

// Available fonts for text editing
export const availableFonts = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica',
  'Comic Sans MS',
  'Impact',
  'Tahoma'
];

// Helper to update text properties
export const updateTextProperties = (
  textObject: fabric.Text, 
  properties: { 
    fontFamily?: string; 
    fontSize?: number; 
    fill?: string;
    fontWeight?: string | number;
    fontStyle?: string;
    underline?: boolean;
  }
) => {
  if (!textObject) return;
  
  Object.entries(properties).forEach(([key, value]) => {
    if (value !== undefined) {
      // @ts-ignore - fabric.js typing issue
      textObject.set(key, value);
    }
  });
  
  textObject.canvas?.renderAll();
};

// Parse HTML content from CKEditor into a format that can be used by fabric.js
export const ckeditorContentToFabric = (htmlContent: string, options: any) => {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);
  
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedHtml;
  
  // For now, we're simplifying by extracting text
  // In a full implementation, we would parse the HTML structure
  // and create multiple fabric objects to represent the rich text content
  const plainText = tempDiv.textContent || '';
  
  // Create a textbox with the extracted text
  const textbox = createTextbox(plainText, {
    left: 100,
    top: 100,
    width: 400,
    ...options
  });
  
  return textbox;
};

// Convert PDF to editable content
export const pdfToEditableContent = async (pdfDoc: any, pageNum: number, scale: number = 1.5) => {
  try {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Extract text items from the PDF page
    const textItems = textContent.items.map((item: any) => {
      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      return {
        text: item.str,
        x: transform[4],
        y: transform[5],
        fontSize: item.fontSize || 12,
        fontFamily: item.fontFamily || 'Arial'
      };
    });
    
    return textItems;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return [];
  }
};

// Helper function to create a PDF from fabric canvas
export const fabricCanvasToPDF = (canvas: fabric.Canvas, originalPdf: any) => {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt'
      });
      
      // Convert canvas to image
      const dataUrl = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.9
      });
      
      // Add image to PDF
      doc.addImage(
        dataUrl, 
        'JPEG', 
        0, 
        0, 
        doc.internal.pageSize.getWidth(), 
        doc.internal.pageSize.getHeight()
      );
      
      // Convert to blob
      const blob = doc.output('blob');
      resolve(blob);
    } catch (error) {
      console.error('Error creating PDF from canvas:', error);
      reject(error);
    }
  });
};
