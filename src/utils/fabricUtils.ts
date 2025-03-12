
import { fabric } from 'fabric';

// Re-export fabric object for easier use
export { fabric };

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
