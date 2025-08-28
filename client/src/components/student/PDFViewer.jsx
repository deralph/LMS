import React from 'react';

const PDFViewer = ({ url }) => {
  return (
    <div className="w-full h-96">
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
        className="w-full h-full"
        title="PDF Viewer"
        frameBorder="0"
      />
      <div className="mt-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
};

export default PDFViewer;