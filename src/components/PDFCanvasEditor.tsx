import React, { useEffect, useRef, useState } from 'react';
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
  Download,
  Bold,
  Italic,
  Underline
} from 'lucide-react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfPageToDataURL, getPageDimensions } from '@/utils/pdfUtils';
import { fabric } from 'fabric';
import { 
  createText, 
  createRect, 
  createCircle, 
  availableFonts,
  updateTextProperties
} from '@/utils/fabricUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface PDFCanvasEditorProps {
  pdfDocument: PDFDocumentProxy;
  currentPage: number;
  fileName: string;
  onSave: (fabricCanvas: fabric.Canvas) => void;
}

const PDFCanvasEditor = ({ 
  pdfDocument, 
  currentPage, 
  fileName,
  onSave
}: PDFCanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'text' | 'rectangle' | 'circle'>('select');
  const [activeColor, setActiveColor] = useState('#000000');
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [fontSize, setFontSize] = useState<number>(20);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1100,
      backgroundColor: '#ffffff',
    });
    
    fabricCanvas.freeDrawingBrush.color = activeColor;
    fabricCanvas.freeDrawingBrush.width = 2;
    
    fabricCanvas.on('selection:created', handleObjectSelected);
    fabricCanvas.on('selection:updated', handleObjectSelected);
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));
    
    setCanvas(fabricCanvas);
    
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const handleObjectSelected = (e: any) => {
    const selectedObj = e.selected?.[0];
    setSelectedObject(selectedObj);
    
    if (selectedObj && selectedObj.type === 'text') {
      setFontFamily(selectedObj.fontFamily || 'Arial');
      setFontSize(selectedObj.fontSize || 20);
      setIsBold(selectedObj.fontWeight === 'bold');
      setIsItalic(selectedObj.fontStyle === 'italic');
      setIsUnderline(selectedObj.underline || false);
      setActiveColor(selectedObj.fill || '#000000');
    }
  };

  useEffect(() => {
    if (!canvas || !pdfDocument) return;
    
    const loadPage = async () => {
      try {
        canvas.clear();
        
        const page = await pdfDocument.getPage(currentPage);
        const dimensions = getPageDimensions(page);
        
        canvas.setWidth(dimensions.width);
        canvas.setHeight(dimensions.height);
        
        const imageUrl = await pdfPageToDataURL(page);
        
        fabric.Image.fromURL(imageUrl, function(img) {
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
          canvas.renderAll();
          toast.success(`Page ${currentPage} loaded`);
        });
      } catch (error) {
        console.error('Error loading PDF page:', error);
        toast.error('Failed to load PDF page');
      }
    };
    
    loadPage();
  }, [pdfDocument, currentPage, canvas]);

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
    
    const text = createText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily,
      fontSize,
      fill: activeColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleAddRectangle = () => {
    if (!canvas) return;
    
    const rect = createRect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 2,
      width: 100,
      height: 50,
    });
    
    canvas.add(rect);
    canvas.renderAll();
  };

  const handleAddCircle = () => {
    if (!canvas) return;
    
    const circle = createCircle({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: activeColor,
      strokeWidth: 2,
      radius: 30,
    });
    
    canvas.add(circle);
    canvas.renderAll();
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
      toast.success('Objects removed');
    }
  };

  const handleSave = () => {
    if (!canvas) return;
    onSave(canvas);
  };

  const applyTextFormatting = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'text') return;
    
    updateTextProperties(selectedObject as fabric.Text, {
      fontFamily,
      fontSize,
      fill: activeColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline
    });
    
    canvas.renderAll();
    toast.success('Text formatting applied');
  };

  const isTextSelected = selectedObject && selectedObject.type === 'text';

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

      {isTextSelected && (
        <div className="flex flex-wrap gap-2 p-2 bg-blue-50 rounded-lg items-center">
          <span className="text-sm font-medium text-gray-700">Text Format:</span>
          
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {availableFonts.map(font => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                {fontSize}px
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col gap-4 p-2">
                <span className="text-sm font-medium">Font Size: {fontSize}px</span>
                <Slider
                  value={[fontSize]}
                  min={8}
                  max={72}
                  step={1}
                  onValueChange={(values) => setFontSize(values[0])}
                />
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant={isBold ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsBold(!isBold)}
          >
            <Bold className="w-4 h-4" />
          </Button>
          
          <Button
            variant={isItalic ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsItalic(!isItalic)}
          >
            <Italic className="w-4 h-4" />
          </Button>
          
          <Button
            variant={isUnderline ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsUnderline(!isUnderline)}
          >
            <Underline className="w-4 h-4" />
          </Button>
          
          <input 
            type="color" 
            value={activeColor} 
            onChange={(e) => setActiveColor(e.target.value)} 
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
          
          <Button
            variant="default"
            size="sm"
            onClick={applyTextFormatting}
          >
            Apply Format
          </Button>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg mx-auto">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PDFCanvasEditor;
