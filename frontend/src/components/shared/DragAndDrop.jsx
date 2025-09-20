import React, { useEffect, useState } from 'react';
import { toAbsoluteUrl } from '../../lib/api';

const FileDrop = ({ onFileSelect, selectedFile, previewImage }) => {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    let objectUrl;

    if (selectedFile){
      objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }

    return () => {
      if(objectUrl){
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedFile]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer block">
        <div className="text-gray-600">
          <p className="mb-2">Drag & Drop an image here</p>
          <p className="text-sm text-blue-600 hover:underline">
            or click to upload
          </p>
        </div>
      </label>

      {selectedFile ? (
        <img
          src={preview}
          alt="Preview"
          className="mt-4 mx-auto h-32 object-contain rounded"
        />
      ) : previewImage ? (
        <img
          src={toAbsoluteUrl(previewImage)}
          alt="Imagen actual"
          className="mt-4 mx-auto h-32 object-contain rounded"
        />
      ) : null}
    </div>
  );
};

export default FileDrop;