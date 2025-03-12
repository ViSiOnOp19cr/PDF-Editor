
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
              'undo',
              'redo'
            ],
            placeholder: 'Type or paste your text here...'
          }}
        />
      ) : (
        <div className="h-40 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading editor...</p>
        </div>
      )}
    </div>
  );
};

export default CKEditorWrapper;
