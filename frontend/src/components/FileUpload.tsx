import React, { useState, useRef } from "react";
import UploadImageIcon from "./UploadImageIcon";
import { useAuth } from "../context/AuthContext";

type ReceiptResponse = {
  id: number;
  image_url: string;
  date: string;
  currency: string;
  vendor_name: string;
  receipt_items: Array<{
    item_name: string;
    item_cost: number;
  }>;
  tax: number;
  total: number;
};

type FileUploadProps = {
  onFileSelect?: (file: File) => void;
  onSubmit?: (file: File) => void;
  onLoadingChange?: (loading: boolean) => void;
};

const FileUpload = ({
  onFileSelect,
  onSubmit,
  onLoadingChange,
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [response, setResponse] = useState<ReceiptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

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
      setIsLoading(true);
      onLoadingChange?.(true);

      try {
        const formData = new FormData();
        formData.append("receipt", file);

        const response = await fetch(
          "http://localhost:3000/api/extract-receipt-details",
          {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to analyze receipt");
        }

        const data = await response.json();
        setResponse(data);
        onSubmit?.(file);
      } catch (error) {
        setErrorMsg("Failed to analyze receipt. Please try again.");
        console.error("Upload error:", error);
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setErrorMsg("");
    setResponse(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!response && (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isLoading
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : isDragging
                ? "border-blue-400 bg-blue-50 cursor-pointer"
                : "border-gray-300 cursor-pointer"
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
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">{errorMsg}</p>
            </div>
          )}

          {file && !response && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
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
                  className={`flex-1 py-2 px-4 rounded ${
                    isLoading
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 text-white"
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
                  className={`py-2 px-3 rounded ${
                    isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-500 text-white"
                  }`}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {response && (
        <div className="mt-4 p-6 bg-white border border-gray-200 rounded">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:hidden">
                Receipt Image
              </h3>
              <div className="max-h-96 lg:max-h-[600px] overflow-y-auto border border-gray-200 rounded">
                <img
                  src={response.image_url}
                  alt="Receipt"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Receipt Analysis
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Vendor:
                  </span>
                  <p className="text-sm text-gray-900">
                    {response.vendor_name}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Date:
                  </span>
                  <p className="text-sm text-gray-900">{response.date}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Currency:
                  </span>
                  <p className="text-sm text-gray-900">{response.currency}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Tax:
                  </span>
                  <p className="text-sm text-gray-900">
                    {response.currency} {response.tax.toFixed(2)}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Total:
                  </span>
                  <p className="text-lg font-semibold text-green-600">
                    {response.currency} {response.total.toFixed(2)}
                  </p>
                </div>

                {response.receipt_items &&
                  response.receipt_items.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Items:
                      </span>
                      <div className="mt-2 space-y-1 max-h-48 overflow-y-auto border border-gray-100 rounded p-2">
                        {response.receipt_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-sm py-1"
                          >
                            <span className="text-gray-700 flex-1 mr-2">
                              {item.item_name}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {response.currency} {item.item_cost.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <button
                onClick={removeFile}
                className="mt-6 px-4 py-2 bg-gray-500 text-white rounded"
              >
                Upload New Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
