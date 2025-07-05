"use client"; // 标记为客户端组件

// app/page.tsx
import Uploader from '../components/uploader';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // 导入 toast 和 Toaster

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); // 存储当前设备上传的图片 URL

  // 从 localStorage 加载当前设备上传的图片
  useEffect(() => {
    const savedImages = localStorage.getItem('uploadedImages');
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages)); // 加载之前保存的图片
    }
  }, []);

  // 处理上传成功的回调，保存到 localStorage
  const handleUploadSuccess = (url: string) => {
    setUploadedImages((prev) => {
      const newImages = [...prev, url];
      localStorage.setItem('uploadedImages', JSON.stringify(newImages));
      return newImages;
    });
  };

  // 处理图片链接复制
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!', { duration: 2000 });
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    });
  };

  // 处理图片删除，添加确认
  const handleDeleteImage = (urlToDelete: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this image?');
    if (confirmed) {
      setUploadedImages((prev) => {
        const newImages = prev.filter((url) => url !== urlToDelete);
        localStorage.setItem('uploadedImages', JSON.stringify(newImages));
        return newImages;
      });
    }
  };

  return (
    <>
      <Toaster position="top-right" /> {/* 添加 Toaster 组件 */}
      <div className="container mx-auto p-2 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-10 text-center">Image Hosting Service</h1>
        <Uploader onUploadSuccess={handleUploadSuccess} />
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mt-8 sm:mt-12 mb-4 sm:mb-6 text-center">Your Uploaded Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {uploadedImages.length > 0 ? (
            uploadedImages.map((url, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                onClick={() => handleCopyLink(url)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={url}
                  alt={`Uploaded Image ${index + 1}`}
                  className="w-full h-32 sm:h-48 object-cover"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteImage(url); }}
                  className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
                >
                  <span className="text-base sm:text-lg">×</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12 bg-white/80 rounded-xl shadow-md border border-gray-200">
              <p className="text-gray-500 text-base sm:text-lg font-medium">No images uploaded yet.</p>
              <p className="text-sm text-gray-400 mt-1 sm:mt-2">Get started by uploading your first image!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}