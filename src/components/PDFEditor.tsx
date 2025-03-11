
import React, { useState, useEffect } from 'react';
import { Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PDFEditorProps {
  pdfContent: string;
  onSave: (content: string) => void;
}

const PDFEditor = ({ pdfContent, onSave }: PDFEditorProps) => {
  const [content, setContent] = useState(pdfContent);

  useEffect(() => {
    setContent(pdfContent);
  }, [pdfContent]);

  const handleSave = () => {
    onSave(content);
    toast.success('Changes saved successfully');
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Edit Document</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      <div 
        className="w-full min-h-[500px] p-6 border rounded-lg"
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onBlur={(e) => setContent(e.currentTarget.innerHTML)}
      />
    </div>
  );
};

export default PDFEditor;
