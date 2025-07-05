// components/uploader.tsx
'use client';

import { useState, type FormEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // 导入 toast 和 Toaster
import { upload } from '@vercel/blob/client';
import ProgressBar from './progress-bar';

interface UploaderProps {
  onUploadSuccess?: (url: string) => void; // 上传成功的回调
}

export default function Uploader({ onUploadSuccess }: UploaderProps) {
  const [preview, setPreview] = useState<string | null>(null); // 预览图片 URL
  const [file, setFile] = useState<File | null>(null); // 选中的文件
  const [dragActive, setDragActive] = useState(false); // 拖拽状态
  const [isUploading, setIsUploading] = useState(false); // 上传状态
  const [progress, setProgress] = useState(0); // 上传进度

  // 重置状态
  function reset() {
    setIsUploading(false);
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  // 处理表单提交
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    // 上传确认
    const confirmed = window.confirm('Are you sure you want to upload this image?');
    if (!confirmed) {
      reset();
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log('Sending to /api/moderate:', file.name);
      const moderateResponse = await fetch('/api/moderate', {
        method: 'POST',
        body: formData,
      });

      if (!moderateResponse.ok) {
        const moderateResult = await moderateResponse.json();
        console.log('Moderate response:', moderateResult);
        throw new Error(moderateResult.error || 'Image moderation failed');
      }

      console.log('Uploading to Vercel Blob:', file.name);
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
          setProgress(progressEvent.percentage || 0);
        },
      });

      console.log('Upload completed:', blob.url);
      toast.success(
        (t) => (
          <div className="p-2 sm:p-3 bg-white/90 rounded-lg shadow-md">
            <p className="font-semibold text-blue-900 text-sm sm:text-base">Upload Successful!</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              View at{' '}
              <a
                className="font-medium text-blue-700 underline"
                href={blob.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {blob.url}
              </a>
            </p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-1 sm:mt-2 text-xs text-gray-500 underline hover:text-gray-700"
            >
              Close
            </button>
          </div>
        ),
        { duration: Number.POSITIVE_INFINITY }
      );
      if (onUploadSuccess) onUploadSuccess(blob.url);
    } catch (error) {
      console.error('Upload error details:', error);
      const errorMsg = (error as Error).message || 'An unexpected error occurred during upload';
      toast.error(
        (t) => (
          <div className="p-2 sm:p-3 bg-red-50 rounded-lg shadow-md">
            <p className="font-semibold text-red-900 text-sm sm:text-base">Upload Failed</p>
            <p className="mt-1 text-xs sm:text-sm text-red-600">{errorMsg}</p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-1 sm:mt-2 text-xs text-red-500 underline hover:text-red-700"
            >
              Close
            </button>
          </div>
        ),
        { duration: Number.POSITIVE_INFINITY }
      );
    }

    reset();
  }

  // 处理文件选择
  function handleFileChange(file: File) {
    toast.dismiss();

    if (file.type.split('/')[0] !== 'image') {
      toast.error('We only accept image files');
      return;
    }
    if (file.size / 1024 / 1024 > 50) {
      toast.error('File size too big (max 50MB)');
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <>
      <Toaster position="top-right" /> {/* 添加 Toaster 组件 */}
      <form
        className="grid gap-4 sm:gap-6 bg-gradient-to-br from-white to-gray-100 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-200 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto"
        onSubmit={handleSubmit}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Upload Your Image</h2>
          <div className="space-y-3 sm:space-y-4">
            {/* 选择区域 */}
            <label
              htmlFor="image-upload"
              className="relative flex h-48 sm:h-56 md:h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/80 backdrop-blur-sm hover:border-blue-500 hover:bg-blue-50/80 transition-all duration-300 group"
            >
              <div
                className="absolute inset-0 rounded-xl"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) handleFileChange(droppedFile);
                }}
              />
              <div
                className={`${dragActive ? 'border-blue-500 scale-105' : ''} flex h-full w-full flex-col items-center justify-center rounded-xl text-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 transition-all duration-300`}
              >
                <svg
                  className={`h-10 sm:h-12 md:h-14 w-10 sm:w-12 md:w-14 text-gray-400 ${dragActive ? 'text-blue-500' : ''} transition-colors duration-300 group-hover:scale-110`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="mt-2 text-sm sm:text-base font-medium text-gray-600">Drag & drop your image here</p>
                <p className="text-xs sm:text-sm text-gray-500">or click to browse (max 50MB)</p>
              </div>
            </label>
            {/* 预览区域 */}
            {preview && (
              <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden shadow-md">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                >
                  <span className="text-base sm:text-lg">×</span>
                </button>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">Supported formats: JPG, PNG, GIF</p>
          <input
            id="image-upload"
            name="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileChange(selectedFile);
            }}
          />
        </div>

        <div className="space-y-3 sm:space-y-4">
          {isUploading && <ProgressBar value={progress} />}
          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <p className="text-sm sm:text-base font-semibold">Upload</p>
          </button>
        </div>
      </form>
    </>
  );
}