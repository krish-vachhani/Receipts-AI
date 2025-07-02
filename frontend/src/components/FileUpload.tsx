import React, { useState, useRef } from "react";
import UploadImageIcon from "./UploadImageIcon";

type FileUploadProps = {
  onFileSelect?: (file: File) => void;
};

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkFile = (file: File) => {
    const imageTypes = /\.(jpe?g|png)$/i;
    if (!imageTypes.test(file.name)) {
      setErrorMsg("Please select a JPG, JPEG, or PNG file");
      return false;
    }

    const sizeLimit = 5 * 1024 * 1024;
    if (file.size > sizeLimit) {
      setErrorMsg("File size must be less than 5MB");
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    setErrorMsg("");

    if (checkFile(file)) {
      setFile(file);
      onFileSelect?.(file);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFile(droppedFiles[0]);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={onFileChange}
          className="hidden"
          id="file-upload"
        />
        <div className="text-gray-600">
          <UploadImageIcon />
          <p className="text-lg font-medium">
            {isDragging ? "Drop your receipt here" : "Upload Receipt Image"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isDragging
              ? "Release to upload"
              : "Drag & drop or click to select (JPG, JPEG, PNG, max 5MB)"}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      {file && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-2">
            Selected File:
          </h3>
          <p className="text-sm text-green-700">{file.name}</p>
          <p className="text-xs text-green-600 mt-1">
            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
