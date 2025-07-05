"use client"; // 标记为客户端组件

// app/page.tsx
import Uploader from '../components/uploader';
import { useState, useEffect } from 'react';

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
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
        Image Hosting Service
      </h1>
      <Uploader onUploadSuccess={handleUploadSuccess} />
      <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-6">Your Uploaded Images</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {uploadedImages.length > 0 ? (
          uploadedImages.map((url, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <img
                src={url}
                alt={`Uploaded Image ${index + 1}`}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
              <button
                onClick={() => handleDeleteImage(url)}
                className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white/80 rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">No images uploaded yet.</p>
            <p className="text-sm text-gray-400 mt-2">Start by uploading your first image!</p>
          </div>
        )}
      </div>
    </div>
  );
}