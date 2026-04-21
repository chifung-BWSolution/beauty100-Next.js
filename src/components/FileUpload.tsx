'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, Image, Loader2 } from 'lucide-react';
import { uploadFile } from '@/api/supabaseApi';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  description?: string;
  required?: boolean;
}

export default function FileUpload({
  label,
  value,
  onChange,
  accept = 'image/*',
  description,
  required = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile({ file });
      onChange(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const isImage = value && (value.includes('.jpg') || value.includes('.png') || value.includes('.jpeg') || value.includes('.webp'));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {value ? (
        <div className="relative border-2 border-slate-200 rounded-xl p-4 bg-slate-50">
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500 hover:text-red-500" />
          </button>

          {isImage ? (
            <img
              src={value}
              alt={label}
              className="max-h-40 mx-auto rounded-lg object-contain"
            />
          ) : (
            <div className="flex items-center gap-3 text-slate-600">
              <FileText className="w-8 h-8 text-fuchsia-500" />
              <span className="text-sm truncate">文件已上傳</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            dragOver
              ? 'border-fuchsia-400 bg-fuchsia-50'
              : 'border-slate-200 hover:border-fuchsia-300 hover:bg-slate-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
              <span className="text-sm text-slate-500">上傳中...</span>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-fuchsia-100 rounded-full flex items-center justify-center">
                {accept.includes('image') ? (
                  <Image className="w-6 h-6 text-fuchsia-500" />
                ) : (
                  <Upload className="w-6 h-6 text-fuchsia-500" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-fuchsia-600">點擊上傳</span>
                <span className="text-sm text-slate-400"> 或拖放文件</span>
              </div>
              {description && (
                <span className="text-xs text-slate-400">{description}</span>
              )}
              <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
