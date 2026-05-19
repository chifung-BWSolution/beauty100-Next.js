'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

const TinyMCEEditor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor) as any,
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] border rounded-xl bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    ),
  }
) as any;

async function uploadImageToStorage(file: File): Promise<string> {
  const ext = file.name ? file.name.split('.').pop() : 'jpg';
  const fileName = `richtext/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  const { error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file, { upsert: false, contentType: file.type });

  if (error) throw error;

  return `${supabaseUrl}/storage/v1/object/public/uploads/${fileName}`;
}

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilePicker = (cb: (url: string, opts: object) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const publicUrl = await uploadImageToStorage(file);
        cb(publicUrl, { title: file.name });
      } catch (err) {
        console.error('RichText image upload failed:', err);
        alert('圖片上傳失敗: ' + (err instanceof Error ? err.message : err));
      }
    };
    input.click();
  };

  const handleImagesUpload = async (blobInfo: { blob: () => Blob; filename: () => string }) => {
    try {
      const file = new File([blobInfo.blob()], blobInfo.filename() || 'image.jpg', {
        type: blobInfo.blob().type || 'image/jpeg',
      });
      const publicUrl = await uploadImageToStorage(file);
      return publicUrl;
    } catch (err) {
      console.error('RichText paste image upload failed:', err);
      throw err;
    }
  };

  if (!mounted) {
    return (
      <div className="h-[350px] border rounded-xl bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <TinyMCEEditor
      tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6.8.4/tinymce.min.js"
      value={value}
      onEditorChange={(content: string) => onChange(content)}
      init={{
        height: 350,
        menubar: false,
        license_key: 'gpl',
        plugins: ['lists', 'link', 'autolink', 'image', 'media'],
        toolbar: 'blocks | bold italic underline forecolor | bullist numlist | link image media | removeformat',
        block_formats: '段落=p; 標題 1=h1; 標題 2=h2; 標題 3=h3; 標題 4=h4; 標題 5=h5; 標題 6=h6',
        placeholder: placeholder || '',
        image_title: true,
        automatic_uploads: true,
        paste_data_images: true,
        images_upload_handler: handleImagesUpload,
        file_picker_types: 'image',
        file_picker_callback: handleFilePicker,
        content_style: 'body { font-family: sans-serif; font-size: 14px; }',
        branding: false,
        statusbar: false,
        promotion: false,
      }}
    />
  );
}
