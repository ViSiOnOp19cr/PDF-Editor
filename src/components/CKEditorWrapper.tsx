
import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorWrapperProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
}

const CKEditorWrapper = ({ initialContent = '', onContentChange }: CKEditorWrapperProps) => {
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    setEditorLoaded(true);
  }, []);

  return (
    <div className="ckeditor-container border border-gray-300 rounded-md">
      {editorLoaded ? (
        <CKEditor
          editor={ClassicEditor}
          data={initialContent}
          onChange={(event, editor) => {
            const data = editor.getData();
            onContentChange(data);
          }}
          config={{
            toolbar: [
              'heading',
              '|',
              'bold',
              'italic',
              'underline',
              'link',
              'bulletedList',
              'numberedList',
              '|',
              'fontColor',
              'fontSize',
              'fontFamily',
              '|',
              'alignment',
              'indent',
              'outdent',
              '|',
              'imageUpload',
              'blockQuote',
              'insertTable',
              'mediaEmbed',
              '|',
              'undo',
              'redo'
            ],
            placeholder: 'Edit PDF text here...',
            fontSize: {
              options: [9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]
            },
            fontFamily: {
              options: [
                'default',
                'Arial, Helvetica, sans-serif',
                'Courier New, Courier, monospace',
                'Georgia, serif',
                'Lucida Sans Unicode, Lucida Grande, sans-serif',
                'Tahoma, Geneva, sans-serif',
                'Times New Roman, Times, serif',
                'Trebuchet MS, Helvetica, sans-serif',
                'Verdana, Geneva, sans-serif'
              ]
            },
            image: {
              toolbar: ['imageTextAlternative', 'imageStyle:full', 'imageStyle:side']
            },
            table: {
              contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
            }
          }}
        />
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading editor...</p>
        </div>
      )}
    </div>
  );
};

export default CKEditorWrapper;
