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
  Underline,
  Edit,
  Check,
  Eraser,
  Image as ImageIcon
} from 'lucide-react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfPageToDataURL, getPageDimensions } from '@/utils/pdfUtils';
import { fabric } from 'fabric';
import { 
  createText, 
  createRect, 
  createCircle, 
  availableFonts,
  updateTextProperties,
  createTextbox,
  ckeditorContentToFabric
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
import CKEditorWrapper from './CKEditorWrapper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { SketchPicker } from 'react-color';

// Canvas-based PDF editor that enables direct manipulation of PDF content using Fabric.js

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
  const [activeTool, setActiveTool] = useState<'select' | 'draw' | 'text' | 'rectangle' | 'circle' | 'eraser' | 'image'>('select');
  const [activeColor, setActiveColor] = useState('#000000');
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [fontSize, setFontSize] = useState<number>(20);
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [eraserSize, setEraserSize] = useState<number>(50);
  const [isDrawingEraser, setIsDrawingEraser] = useState(false);
  const [eraserStartPoint, setEraserStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [whiteoutOpacity, setWhiteoutOpacity] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [selectedObjectForFill, setSelectedObjectForFill] = useState<fabric.Object | null>(null);

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
      
      if (selectedObj.text) {
        setEditorContent(selectedObj.text);
      }
    }
    
    if (selectedObj && (selectedObj.type === 'rect' || selectedObj.type === 'circle')) {
      setSelectedObjectForFill(selectedObj);
      if (selectedObj.fill && typeof selectedObj.fill === 'string') {
        setFillColor(selectedObj.fill);
      }
    } else {
      setSelectedObjectForFill(null);
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
        
        const canvasContainer = canvasRef.current?.parentElement;
        if (canvasContainer) {
          canvasContainer.style.minWidth = `${dimensions.width}px`;
          canvasContainer.style.minHeight = `${dimensions.height}px`;
        }
        
        const imageUrl = await pdfPageToDataURL(page);
        
        fabric.Image.fromURL(imageUrl, function(img) {
          img.set({
            scaleX: canvas.width! / (img.width || 1),
            scaleY: canvas.height! / (img.height || 1),
            originX: 'left',
            originY: 'top'
          });
          
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
    
    setIsEditorOpen(true);
    setEditorContent('');
  };

  const handleApplyRichText = () => {
    if (!canvas) return;
    
    const textbox = ckeditorContentToFabric(editorContent, {
      left: 100,
      top: 100,
      fontFamily,
      fontSize,
      fill: activeColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
    });
    
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    
    setIsEditorOpen(false);
    toast.success('Rich text added');
  };

  const handleEditSelectedText = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'text') return;
    
    // @ts-ignore
    setEditorContent(selectedObject.text || '');
    setIsEditorOpen(true);
  };

  const handleUpdateSelectedText = () => {
    if (!canvas || !selectedObject || selectedObject.type !== 'text') return;
    
    // @ts-ignore
    selectedObject.set('text', editorContent.replace(/<[^>]*>?/gm, ''));
    
    updateTextProperties(selectedObject as fabric.Text, {
      fontFamily,
      fontSize,
      fill: activeColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline
    });
    
    canvas.renderAll();
    setIsEditorOpen(false);
    toast.success('Text updated');
  };

  const handleAddRectangle = () => {
    if (!canvas) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      stroke: '#000000',
      strokeWidth: 1,
      fill: 'transparent',
      selectable: true
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setActiveTool('select');
    toast.success('Rectangle added');
  };

  const handleAddCircle = () => {
    if (!canvas) return;
    
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      stroke: '#000000',
      strokeWidth: 1,
      fill: 'transparent',
      selectable: true
    });
    
    canvas.add(circle);
    canvas.setActiveObject(circle);
    setActiveTool('select');
    toast.success('Circle added');
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

  const handleAddWhiteout = (x: number, y: number, width: number, height: number) => {
    if (!canvas) return;
    
    const whiteout = createRect({
      left: x,
      top: y,
      fill: '#ffffff',
      width: width,
      height: height,
      selectable: true,
      hoverCursor: 'move',
      opacity: whiteoutOpacity,
    });
    
    canvas.add(whiteout);
    canvas.setActiveObject(whiteout);
    canvas.renderAll();
    toast.success('White-out added');
  };

  // Add a function for quick white-out creation
  const handleQuickWhiteout = (e: fabric.IEvent) => {
    if (!canvas || activeTool !== 'eraser') return;
    
    const pointer = canvas.getPointer(e.e);
    // Create a preset-sized white-out rectangle centered on the click point
    const width = eraserSize;
    const height = eraserSize / 2; // Rectangle with 2:1 aspect ratio
    
    handleAddWhiteout(
      pointer.x - width / 2, 
      pointer.y - height / 2, 
      width, 
      height
    );
  };

  // Update the mouse event handlers
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (activeTool !== 'eraser') return;
      
      // Check if it's a double click for quick white-out
      if ((e.e as MouseEvent).detail === 2) {
        handleQuickWhiteout(e);
        return;
      }
      
      const pointer = canvas.getPointer(e.e);
      setIsDrawingEraser(true);
      setEraserStartPoint({ x: pointer.x, y: pointer.y });
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (activeTool !== 'eraser' || !isDrawingEraser || !eraserStartPoint) return;
      
      // This is for live preview if needed
    };

    const handleMouseUp = (e: fabric.IEvent) => {
      if (activeTool !== 'eraser' || !isDrawingEraser || !eraserStartPoint) return;
      
      const pointer = canvas.getPointer(e.e);
      const width = Math.abs(pointer.x - eraserStartPoint.x);
      const height = Math.abs(pointer.y - eraserStartPoint.y);
      
      // Calculate the top-left corner
      const left = Math.min(pointer.x, eraserStartPoint.x);
      const top = Math.min(pointer.y, eraserStartPoint.y);
      
      // Create the white-out rectangle
      handleAddWhiteout(left, top, width, height);
      
      // Reset the drawing state
      setIsDrawingEraser(false);
      setEraserStartPoint(null);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, activeTool, isDrawingEraser, eraserStartPoint, eraserSize, whiteoutOpacity]);

  // Modify the handleImageUpload function
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const imgUrl = event.target.result.toString();
      
      // Create an HTML image element to ensure it's fully loaded
      const imgElement = new Image();
      imgElement.crossOrigin = 'anonymous'; // Handle cross-origin issues
      
      imgElement.onload = () => {
        const fabricImage = new fabric.Image(imgElement, {
          left: 100,
          top: 100,
        });
        
        // Scale down large images
        if (fabricImage.width && fabricImage.width > 300) {
          const aspectRatio = fabricImage.width / (fabricImage.height || 1);
          fabricImage.scaleToWidth(300);
          fabricImage.scaleToHeight(300 / aspectRatio);
        }
        
        canvas.add(fabricImage);
        canvas.setActiveObject(fabricImage);
        canvas.renderAll();
        toast.success('Image added');
      };
      
      imgElement.src = imgUrl;
    };
    
    reader.readAsDataURL(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add this function to trigger file input click
  const handleAddImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleApplyFill = () => {
    if (selectedObjectForFill && canvas) {
      selectedObjectForFill.set({
        fill: fillColor
      });
      canvas.renderAll();
      setShowColorPicker(false);
      toast.success('Fill color applied');
    }
  };

  const handleClearFill = () => {
    if (selectedObjectForFill && canvas) {
      selectedObjectForFill.set({
        fill: 'transparent'
      });
      canvas.renderAll();
      setShowColorPicker(false);
      toast.success('Fill cleared');
    }
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
          Add Text
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
        <Button 
          variant={activeTool === 'image' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => { handleToolClick('image'); handleAddImage(); }}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Add Image
        </Button>
        {activeTool === 'select' && selectedObjectForFill && (
          <Button 
            variant="outline" 
            onClick={() => setShowColorPicker(true)}
          >
            Fill
          </Button>
        )}
        <Button 
          variant={activeTool === 'eraser' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => handleToolClick('eraser')}
        >
          <Eraser className="w-4 h-4 mr-2" />
          White-out
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

      {activeTool === 'eraser' && (
        <div className="p-3 bg-blue-50 rounded-lg mb-2">
          <p className="text-sm text-blue-700 mb-2">
            <strong>White-out Tool:</strong> Click and drag to create a white rectangle that covers text you want to erase.
            You can resize or move the white rectangle after placing it. Double-click for a quick preset-sized white-out.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium text-gray-700">Opacity:</span>
            <div className="w-40">
              <Slider
                value={[whiteoutOpacity * 100]}
                min={20}
                max={100}
                step={5}
                onValueChange={(values) => setWhiteoutOpacity(values[0] / 100)}
              />
            </div>
            <span className="text-sm text-gray-600">{Math.round(whiteoutOpacity * 100)}%</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium text-gray-700">Quick White-out Size:</span>
            <div className="w-40">
              <Slider
                value={[eraserSize]}
                min={20}
                max={200}
                step={10}
                onValueChange={(values) => setEraserSize(values[0])}
              />
            </div>
            <span className="text-sm text-gray-600">{eraserSize}px</span>
          </div>
        </div>
      )}

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
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditSelectedText}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Text
          </Button>
        </div>
      )}

      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Choose Fill Color</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="fillColorPicker" className="text-sm font-medium">
                Select Color:
              </label>
              <input 
                id="fillColorPicker"
                type="color" 
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-10 h-10 border-0 cursor-pointer"
              />
            </div>
            <div className="w-full h-20 border rounded-md" style={{ backgroundColor: fillColor }}></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFill}>
              Clear Fill
            </Button>
            <Button onClick={handleApplyFill}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[800px]" style={{ zIndex: 1050 }}>
          <DialogHeader>
            <DialogTitle>{selectedObject ? 'Edit Text' : 'Add Rich Text'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CKEditorWrapper 
              initialContent={editorContent}
              onContentChange={setEditorContent}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedObject ? handleUpdateSelectedText : handleApplyRichText}>
              <Check className="w-4 h-4 mr-2" />
              {selectedObject ? 'Update' : 'Insert'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg mx-auto">
        <div className="canvas-container" style={{ display: 'inline-block' }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default PDFCanvasEditor;
