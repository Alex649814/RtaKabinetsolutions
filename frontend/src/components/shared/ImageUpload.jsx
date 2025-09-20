import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { toAbsoluteUrl } from '../../lib/api'; // 👈 nuevo

const ImageUpload = ({ onChange, initialImageUrl }) => {
  const [preview, setPreview] = useState(
    initialImageUrl ? toAbsoluteUrl(initialImageUrl.replace(/\\/g, '/')) : null
  );
  const inputRef = useRef();

  const handleFileSelect = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
      onChange(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-gray-700">Section image</label>

      <div
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
      >
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="h-full object-contain rounded-lg"
          />
        ) : (
          <>
            <UploadCloud className="w-10 h-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Click or drag an image</p>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;