
import { Canvas, Text, Rect, Circle } from 'fabric';

// Re-export fabric classes for easier use
export {
  Canvas,
  Text,
  Rect,
  Circle
};

// Helper to create text objects
export const createText = (text: string, options: any) => {
  return new Text(text, options);
};

// Helper to create rectangle objects
export const createRect = (options: any) => {
  return new Rect(options);
};

// Helper to create circle objects
export const createCircle = (options: any) => {
  return new Circle(options);
};
