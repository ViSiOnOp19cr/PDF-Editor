
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, IEvent, ActiveSelection, Text } from 'fabric';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  TextIcon, 
  Pencil, 
  Pointer, 
  Square, 
  Circle,
  Save,
  Trash2,
  Type,
  Download
} from 'lucide-react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfPageToDataURL, getPageDimensions } from '@/utils/pdfUtils';

interface PDFCanvasEditorProps {
  pdfDocument: PDFDocumentProxy;
  currentPage: number;
  fileName: string;
  onSave: (fabricCanvas: Canvas) => void;
}

const PDFCanvasEditor = ({ 
  pdfDocument, 
  currentPage, 
  fileName,
  onSave
}: PDFCanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'text' | 'rectangle' | 'circle'>('select');
  const [activeColor, setActiveColor] = useState('#000000');

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 1100,
      backgroundColor: '#ffffff',
    });
    
    fabricCanvas.freeDrawingBrush.color = activeColor;
    fabricCanvas.freeDrawingBrush.width = 2;
    
    setCanvas(fabricCanvas);
    
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Load PDF page into canvas
  useEffect(() => {
    const loadPage = async () => {
      if (!canvas || !pdfDocument) return;
      
      try {
        // Clear canvas
        canvas.clear();
        
        // Get the specified page
        const page = await pdfDocument.getPage(currentPage);
        const dimensions = getPageDimensions(page);
        
        // Resize canvas to match page dimensions
        canvas.setWidth(dimensions.width);
        canvas.setHeight(dimensions.height);
        
        // Convert PDF page to image
        const imageUrl = await pdfPageToDataURL(page);
        
        // Set image as background
        canvas.setBackgroundImage(imageUrl, canvas.renderAll.bind(canvas), {
          originX: 'left',
          originY: 'top',
          scaleX: 1,
          scaleY: 1
        });
        
        toast.success(`Page ${currentPage} loaded`);
      } catch (error) {
        console.error('Error loading PDF page:', error);
        toast.error('Failed to load PDF page');
      }
    };
    
    loadPage();
  }, [pdfDocument, currentPage, canvas]);

  // Update drawing mode when tool changes
  useEffect(() => {
    if (!canvas) return;
    
    canvas.isDrawingMode = activeTool === 'draw';
    
    if (canvas.isDrawingMode) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = 2;
    }
  }, [activeTool, activeColor, canvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);
  };

  const handleAddText = () => {
    if (!canvas) return;
    
    const text = new Text('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fill: activeColor,
      fontSize: 20,
      editable: true,
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleAddRectangle = () => {
    if (!canvas) return;
    
    canvas.add(new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 2,
      width: 100,
      height: 50,
    }));
    canvas.renderAll();
  };

  const handleAddCircle = () => {
    if (!canvas) return;
    
    canvas.add(new fabric.Circle({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 2,
      radius: 30,
    }));
    canvas.renderAll();
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      canvas.renderAll();
      toast.success('Objects removed');
    }
  };

  const handleSave = () => {
    if (!canvas) return;
    onSave(canvas);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg">
        <Button 
          variant={activeTool === 'select' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => handleToolClick('select')}
        >
          <Pointer className="w-4 h-4 mr-2" />
          Select
        </Button>
        <Button 
          variant={activeTool === 'draw' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => handleToolClick('draw')}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Draw
        </Button>
        <Button 
          variant={activeTool === 'text' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => { handleToolClick('text'); handleAddText(); }}
        >
          <Type className="w-4 h-4 mr-2" />
          Text
        </Button>
        <Button 
          variant={activeTool === 'rectangle' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => { handleToolClick('rectangle'); handleAddRectangle(); }}
        >
          <Square className="w-4 h-4 mr-2" />
          Rectangle
        </Button>
        <Button 
          variant={activeTool === 'circle' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => { handleToolClick('circle'); handleAddCircle(); }}
        >
          <Circle className="w-4 h-4 mr-2" />
          Circle
        </Button>
        <input 
          type="color" 
          value={activeColor} 
          onChange={(e) => setActiveColor(e.target.value)} 
          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDeleteSelected}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleSave}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg mx-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PDFCanvasEditor;
