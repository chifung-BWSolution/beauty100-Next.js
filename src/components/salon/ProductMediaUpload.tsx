'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/api/supabaseApi';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDim = 2000;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
              if (blob.size <= 1024 * 1024) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else if (quality > 0.1) {
                quality -= 0.1;
                tryCompress();
              } else {
                reject(new Error('無法將圖片壓縮至 1MB 以下'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };
    };
    reader.onerror = reject;
  });
};

interface ProductMediaUploadProps {
  mediaList: string[];
  onChange: (urls: string[]) => void;
}

export default function ProductMediaUpload({ mediaList, onChange }: ProductMediaUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        let fileToUpload = file;

        if (file.type.startsWith('image/')) {
          fileToUpload = await compressImage(file);
        }

        const response = await uploadFile({ file: fileToUpload });
        uploadedUrls.push(response.file_url);
      }

      const newMediaList = [...(mediaList || []), ...uploadedUrls];
      onChange(newMediaList);
      toast.success('圖片上傳成功');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : '上傳失敗，請重試');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    const newMediaList = mediaList.filter((_, i) => i !== index);
    onChange(newMediaList);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-fuchsia-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload" className="flex flex-col items-center gap-2 cursor-pointer">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
              <p className="text-sm text-slate-600">上傳中...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">點擊或拖拽上傳圖片</p>
              <p className="text-xs text-slate-500">支持 JPG, PNG 等格式，自動壓縮至 1MB 以下</p>
            </>
          )}
        </label>
      </div>

      {mediaList && mediaList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mediaList.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Product media ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(!mediaList || mediaList.length === 0) && (
        <div className="flex items-center justify-center h-32 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">暫無上傳相片</p>
          </div>
        </div>
      )}
    </div>
  );
}
