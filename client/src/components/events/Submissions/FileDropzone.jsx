import React from "react";

export default function FileDropzone({ onUpload, disabled, isUploading }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <div 
      className={`mt-4 border-2 border-dashed rounded-lg p-8 flex flex-col justify-center items-center transition-colors ${
        disabled 
          ? 'border-[#30363d] bg-[#0d1117] opacity-50 cursor-not-allowed' 
          : isUploading
            ? 'border-[#1f6feb] bg-[#1f6feb]/10 cursor-wait'
            : 'border-[#30363d] hover:border-[#8b949e] bg-[#0d1117] cursor-pointer'
      }`}
      onClick={() => !disabled && !isUploading && document.getElementById('submission-file-upload').click()}
    >
      <span className={`material-symbols-outlined text-4xl mb-2 ${isUploading ? 'text-[#1f6feb] animate-bounce' : 'text-[#8b949e]'}`}>
        {isUploading ? 'cloud_upload' : 'note_add'}
      </span>
      <p className="text-sm font-semibold text-white">
        {isUploading ? 'Uploading...' : 'Click to add a file'}
      </p>
      <p className="text-xs text-[#8b949e] mt-1">PDF, ZIP, PPTX, or MP4 up to 50MB</p>
      <input 
        id="submission-file-upload" 
        type="file" 
        className="hidden" 
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
