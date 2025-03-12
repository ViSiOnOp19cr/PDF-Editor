import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { fabric , fabricCanvas} from 'fabric';

interface CKEditorWrapperProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
}

const CKEditorWrapper = ({ initialContent = '', onContentChange }: CKEditorWrapperProps) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [selectedObjectForFill, setSelectedObjectForFill] = useState<fabric.Object | null>(null);

  useEffect(() => {
    setEditorLoaded(true);
  }, []);

  return (
    <div className="ckeditor-container border border-gray-300 rounded-md">
      {editorLoaded ? (
        <CKEditor
          editor={ClassicEditor}
          data={initialContent}
          onReady={(editor) => {
            // Store the editor instance for later use
            setEditorInstance(editor);
            
            // Log available plugins to console for debugging
            console.log('Available plugins:', Array.from(editor.plugins.names()));
            
            // Log available toolbar items
            if (editor.ui.componentFactory) {
              console.log('Available toolbar items:', 
                Array.from(editor.ui.componentFactory.names())
                  .filter(name => editor.ui.componentFactory.has(name))
              );
            }
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            onContentChange(data);
          }}
          config={{
            // Use only the default toolbar items that are definitely available
            toolbar: [
              'heading',
              '|',
              'bold',
              'italic',
              'link',
              'bulletedList',
              'numberedList',
              '|',
              'indent',
              'outdent',
              '|',
              'blockQuote',
              'undo',
              'redo'
            ],
            placeholder: 'Edit PDF text here...'
          }}
        />
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading editor...</p>
        </div>
      )}
      {selectedObjectForFill && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              if (selectedObjectForFill && fabricCanvas) {
                selectedObjectForFill.set({ fill: fillColor });
                fabricCanvas.renderAll();
                toast.success('Fill color applied');
              }
            }}
          >
            Fill Shape
          </Button>
          <input 
            type="color" 
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="w-8 h-8 border-0"
          />
          <Button 
            variant="outline" 
            onClick={() => {
              if (selectedObjectForFill && fabricCanvas) {
                selectedObjectForFill.set({ fill: '' });
                fabricCanvas.renderAll();
                toast.success('Fill color cleared');
              }
            }}
          >
            Clear Fill
          </Button>
        </div>
      )}
    </div>
  );
};

export default CKEditorWrapper;
