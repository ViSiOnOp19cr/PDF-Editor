
import { fabric } from 'fabric';

// Re-export fabric object for easier use
export { fabric };

// Helper to create text objects
export const createText = (text: string, options: any) => {
  return new fabric.Text(text, options);
};

// Helper to create rectangle objects
export const createRect = (options: any) => {
  return new fabric.Rect(options);
};

// Helper to create circle objects
export const createCircle = (options: any) => {
  return new fabric.Circle(options);
};
