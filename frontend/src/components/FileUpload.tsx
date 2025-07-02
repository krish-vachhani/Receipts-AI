import React, { useState, useRef } from "react";
import UploadImageIcon from "./UploadImageIcon";

type ReceiptResponse = {
  id: number;
  image_url: string;
  merchant?: string;
  total?: number;
  date?: string;
  items?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
};

type FileUploadProps = {
  onFileSelect?: (file: File) => void;
  onSubmit?: (file: File) => void;
  isLoading?: boolean;
};

const FileUpload = ({ onFileSelect, onSubmit, isLoading = false }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [response, setResponse] = useState<ReceiptResponse | null>(null);
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
    if (isLoading) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (isLoading) return;
    event.preventDefault();
    setIsDragging(false);

    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFile(droppedFiles[0]);
    }
  };

  const openFileDialog = () => {
    if (isLoading) return;
    inputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (file && !isLoading) {
      try {
        const formData = new FormData();
        formData.append('receipt', file);

        const response = await fetch('http://localhost:3000/api/extract-receipt-details', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to analyze receipt');
        }

        const data = await response.json();
        setResponse(data);
        onSubmit?.(file);
      } catch (error) {
        setErrorMsg('Failed to analyze receipt. Please try again.');
        console.error('Upload error:', error);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setErrorMsg("");
    setResponse(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isLoading
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : isDragging
            ? "border-blue-400 bg-blue-50 cursor-pointer"
            : "border-gray-300 cursor-pointer hover:border-gray-400"
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
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                isLoading
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                "Analyze Receipt"
              )}
            </button>
            <button
              onClick={removeFile}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg transition-colors ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
