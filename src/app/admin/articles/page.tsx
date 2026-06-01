'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Plus, Edit, Trash2, Eye, RefreshCw, Loader2, FileText, Upload, X, ChevronLeft, ChevronRight, ArrowUpDown, Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { revalidateArticle } from '@/app/actions/revalidate';

// Dynamically load TinyMCE
const TinyMCEEditor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor) as any,
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] border rounded-lg bg-slate-800 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
      </div>
    ),
  }
) as any;

const PAGE_SIZE = 20;

const CATEGORIES = [
  { value: 'facial-care', label: '面部護理' },
  { value: 'body-care', label: '身體保養' },
  { value: 'body-shaping', label: '身材管理' },
  { value: 'anti-aging', label: '回復青春' },
  { value: 'skincare', label: '化妝護膚' },
  { value: 'healthy-diet', label: '飲食健康' },
  { value: 'entertainment', label: '娛樂圈' },
  { value: 'trending-topics', label: '焦點話題' },
  { value: 'topics', label: '話題' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: '已發佈' },
  { value: 'draft', label: '草稿' },
];

interface ArticleForm {
  handle: string;
  title: string;
  author: string;
  seo_title: string;
  seo_description: string;
  is_celebrity: boolean;
  tags: string;
  published_at: string;
  cover_image_url: string;
  cover_image_alt: string;
  intro: string;
  section_1_title: string;
  section_1_content: string;
  section_1_images: string[];
  section_2_title: string;
  section_2_content: string;
  section_2_images: string[];
  section_3_title: string;
  section_3_content: string;
  section_3_images: string[];
  section_4_title: string;
  section_4_content: string;
  section_4_images: string[];
  section_5_title: string;
  section_5_content: string;
  section_5_images: string[];
  status: string;
  category: string;
}

const emptyForm: ArticleForm = {
  handle: '',
  title: '',
  author: '',
  seo_title: '',
  seo_description: '',
  is_celebrity: false,
  tags: '',
  published_at: '',
  cover_image_url: '',
  cover_image_alt: '',
  intro: '',
  section_1_title: '',
  section_1_content: '',
  section_1_images: [],
  section_2_title: '',
  section_2_content: '',
  section_2_images: [],
  section_3_title: '',
  section_3_content: '',
  section_3_images: [],
  section_4_title: '',
  section_4_content: '',
  section_4_images: [],
  section_5_title: '',
  section_5_content: '',
  section_5_images: [],
  status: 'draft',
  category: '',
};

// Compress image to under 1MB
async function compressImage(file: File, maxSizeKB = 1024): Promise<File> {
  return new Promise((resolve, reject) => {
    if (file.size <= maxSizeKB * 1024) {
      resolve(file);
      return;
    }
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            if (blob.size <= maxSizeKB * 1024 || quality <= 0.3) {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          'image/jpeg',
          quality,
        );
      };
      tryCompress();
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

// Upload image to Supabase storage
async function uploadImageToSupabase(file: File, folder = 'articles'): Promise<string> {
  const compressed = await compressImage(file);
  const ext = compressed.name.split('.').pop() || 'jpg';
  const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filename, compressed, { upsert: false, contentType: compressed.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path);
  return urlData.publicUrl;
}

// Convert content to displayable HTML
function contentToHtml(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') {
    // Already HTML
    if (content.includes('<') && content.includes('>')) return content;
    // Try parsing as JSON
    try {
      const parsed = JSON.parse(content);
      return jsonContentToHtml(parsed);
    } catch {
      return content.replace(/\n/g, '<br>');
    }
  }
  return jsonContentToHtml(content);
}

function jsonContentToHtml(data: any): string {
  if (!data) return '';
  
  // Handle TipTap/ProseMirror format: {"type":"root","children":[...]}
  if (data.type === 'root' && data.children) {
    return data.children.map((node: any) => nodeToHtml(node)).join('');
  }
  
  // Handle direct node
  if (data.type && (data.children || data.value)) {
    return nodeToHtml(data);
  }
  
  // Handle array of blocks (old format)
  if (Array.isArray(data)) {
    return data.map((block: any) => {
      if (block.type === 'paragraph') {
        if (block.children) return `<p>${block.children.map((c: any) => nodeToHtml(c)).join('')}</p>`;
        return `<p>${block.content || ''}</p>`;
      }
      if (block.type === 'heading') {
        const level = block.level || 2;
        if (block.children) return `<h${level}>${block.children.map((c: any) => nodeToHtml(c)).join('')}</h${level}>`;
        return `<h${level}>${block.content || ''}</h${level}>`;
      }
      if (block.type === 'list') {
        const items = (block.items || block.children || []).map((item: any) => {
          if (typeof item === 'string') return `<li>${item}</li>`;
          if (item.type === 'list-item') return `<li>${item.children ? item.children.map((c: any) => nodeToHtml(c)).join('') : item.value || ''}</li>`;
          return `<li>${nodeToHtml(item)}</li>`;
        }).join('');
        return (block.ordered || block.listType === 'ordered') ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
      }
      // Fallback for unknown block types
      if (block.children) return `<p>${block.children.map((c: any) => nodeToHtml(c)).join('')}</p>`;
      return `<p>${block.content || block.value || ''}</p>`;
    }).join('');
  }
  
  if (typeof data === 'object') return `<p>${JSON.stringify(data)}</p>`;
  return String(data).replace(/\n/g, '<br>');
}

function nodeToHtml(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  
  switch (node.type) {
    case 'text':
      return node.value || node.text || '';
    case 'paragraph':
      const pContent = node.children ? node.children.map((c: any) => nodeToHtml(c)).join('') : (node.value || node.content || '');
      return `<p>${pContent}</p>`;
    case 'heading': {
      const level = node.level || node.attrs?.level || 2;
      const hContent = node.children ? node.children.map((c: any) => nodeToHtml(c)).join('') : (node.value || node.content || '');
      return `<h${level}>${hContent}</h${level}>`;
    }
    case 'list': {
      const listItems = (node.children || node.items || []).map((item: any) => {
        if (typeof item === 'string') return `<li>${item}</li>`;
        if (item.type === 'list-item') {
          const liContent = item.children ? item.children.map((c: any) => nodeToHtml(c)).join('') : (item.value || '');
          return `<li>${liContent}</li>`;
        }
        return `<li>${nodeToHtml(item)}</li>`;
      }).join('');
      return (node.listType === 'ordered' || node.ordered) ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`;
    }
    case 'list-item': {
      const liContent = node.children ? node.children.map((c: any) => nodeToHtml(c)).join('') : (node.value || '');
      return `<li>${liContent}</li>`;
    }
    case 'link': {
      const href = node.url || node.attrs?.href || '#';
      const linkContent = node.children ? node.children.map((c: any) => nodeToHtml(c)).join('') : (node.value || href);
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${linkContent}</a>`;
    }
    case 'image': {
      const src = node.url || node.src || node.attrs?.src || '';
      const alt = node.alt || node.attrs?.alt || '';
      return `<img src="${src}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`;
    }
    case 'root':
      return node.children ? node.children.map((c: any) => nodeToHtml(c)).join('') : '';
    default:
      // Fallback: try children, then value
      if (node.children) return node.children.map((c: any) => nodeToHtml(c)).join('');
      if (node.value) return node.value;
      if (node.content) return node.content;
      return '';
  }
}

// Single Image Upload Component
function ImageUploader({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('請選擇圖片文件'); return; }
    setUploading(true);
    try {
      const url = await uploadImageToSupabase(file);
      onChange(url);
      toast.success('圖片已上傳');
    } catch (e: any) { toast.error('上傳失敗：' + (e.message || '未知錯誤')); }
    finally { setUploading(false); }
  };
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}</Label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="w-full max-w-[300px] h-40 object-cover rounded-lg border border-slate-700" />
          <button type="button" onClick={() => onChange('')} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full hover:bg-red-700">
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-500/50 transition-colors">
          {uploading ? <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" /> : (
            <><Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-400">點擊上傳圖片</p><p className="text-xs text-slate-500 mt-1">自動壓縮至 1MB 以下</p></>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

// Multi-image uploader
function MultiImageUploader({ images, onChange, label }: { images: string[]; onChange: (urls: string[]) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        newUrls.push(await uploadImageToSupabase(file));
      }
      onChange([...images, ...newUrls]);
      toast.success(`已上傳 ${newUrls.length} 張圖片`);
    } catch (e: any) { toast.error('上傳失敗：' + (e.message || '未知錯誤')); }
    finally { setUploading(false); }
  };
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative">
            <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-700" />
            <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 p-0.5 bg-red-600 rounded-full hover:bg-red-700">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        <div onClick={() => inputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Plus className="w-5 h-5 text-slate-400" />}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

// Rich Text Editor for articles
function ArticleRichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const handleImagesUpload = async (blobInfo: { blob: () => Blob; filename: () => string }) => {
    const file = new File([blobInfo.blob()], blobInfo.filename() || 'image.jpg', { type: blobInfo.blob().type || 'image/jpeg' });
    const compressed = await compressImage(file);
    const ext = compressed.name.split('.').pop() || 'jpg';
    const filename = `articles/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from('uploads').upload(filename, compressed, { upsert: false, contentType: compressed.type });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path);
    return urlData.publicUrl;
  };
  if (!mounted) return <div className="h-[250px] border rounded-lg bg-slate-800 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>;
  return (
    <TinyMCEEditor
      tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6.8.4/tinymce.min.js"
      value={value}
      onEditorChange={(content: string) => onChange(content)}
      init={{
        height: 250,
        menubar: false,
        license_key: 'gpl',
        plugins: ['lists', 'link', 'autolink', 'image', 'media'],
        toolbar: 'blocks | bold italic underline | bullist numlist | link image | removeformat',
        block_formats: '段落=p; 標題 2=h2; 標題 3=h3; 標題 4=h4',
        placeholder: placeholder || '輸入內容...',
        image_title: true,
        automatic_uploads: true,
        paste_data_images: true,
        images_upload_handler: handleImagesUpload,
        invalid_styles: { '*': 'font-size line-height font-family' },
        paste_preprocess: (_plugin: any, args: any) => {
          // Strip inline styles on paste to keep clean HTML
          args.content = args.content.replace(/\s*style="[^"]*"/gi, '');
        },
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; line-height: 1.85; color: #e2e8f0; background: #1e293b; padding: 8px; } p { margin: 0 0 12px; } h2 { font-size: 17px; font-weight: bold; border-left: 3px solid #2563eb; padding-left: 12px; margin: 24px 0 8px; } h3 { font-size: 16px; font-weight: 600; } ul, ol { padding-left: 20px; } li { margin-bottom: 4px; }',
        skin: 'oxide-dark',
        content_css: 'dark',
        branding: false,
        statusbar: false,
        promotion: false,
        setup: (editor: any) => {
          editor.on('init', () => {
            // Ensure TinyMCE aux container has high z-index
            const auxContainers = document.querySelectorAll('.tox-tinymce-aux');
            auxContainers.forEach((el: Element) => {
              (el as HTMLElement).style.zIndex = '99999';
            });
          });
        },
      }}
    />
  );
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [celebrityFilter, setCelebrityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<any>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('blog_articles').select('*', { count: 'exact' }).order('published_at', { ascending: sortOrder === 'asc' });
      if (categoryFilter !== 'all') query = query.eq('category', categoryFilter);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (celebrityFilter !== 'all') query = query.eq('is_celebrity', celebrityFilter === 'yes');
      if (searchTerm.trim()) query = query.or(`title.ilike.%${searchTerm.trim()}%,author.ilike.%${searchTerm.trim()}%,handle.ilike.%${searchTerm.trim()}%`);
      const from = (currentPage - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);
      const { data, error, count } = await query;
      if (error) throw error;
      setArticles(data || []);
      setTotalCount(count || 0);
    } catch (e: any) { toast.error('載入文章失敗'); }
    finally { setLoading(false); }
  }, [categoryFilter, statusFilter, celebrityFilter, searchTerm, currentPage, sortOrder]);

  useEffect(() => { loadArticles(); }, [loadArticles]);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEditForm = (article: any) => {
    setEditingId(article.id);
    const toHtml = (content: any): string => {
      if (!content) return '';
      if (typeof content === 'string') {
        if (content.includes('<') && content.includes('>')) return content;
        try { return jsonContentToHtml(JSON.parse(content)); } catch { return content.replace(/\n/g, '<br>'); }
      }
      return jsonContentToHtml(content);
    };
    setForm({
      handle: article.handle || '',
      title: article.title || '',
      author: article.author || '',
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || '',
      is_celebrity: article.is_celebrity || false,
      tags: (article.tags || []).join(', '),
      published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '',
      cover_image_url: article.cover_image_url || '',
      cover_image_alt: article.cover_image_alt || '',
      intro: toHtml(article.intro),
      section_1_title: article.section_1_title || '',
      section_1_content: toHtml(article.section_1_content),
      section_1_images: article.section_1_images || [],
      section_2_title: article.section_2_title || '',
      section_2_content: toHtml(article.section_2_content),
      section_2_images: article.section_2_images || [],
      section_3_title: article.section_3_title || '',
      section_3_content: toHtml(article.section_3_content),
      section_3_images: article.section_3_images || [],
      section_4_title: article.section_4_title || '',
      section_4_content: toHtml(article.section_4_content),
      section_4_images: article.section_4_images || [],
      section_5_title: article.section_5_title || '',
      section_5_content: toHtml(article.section_5_content),
      section_5_images: article.section_5_images || [],
      status: article.status || 'draft',
      category: article.category || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('請填寫文章標題'); return; }
    if (!form.handle.trim()) { toast.error('請填寫 Handle (URL slug)'); return; }
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload: any = {
        handle: form.handle.trim(),
        title: form.title.trim(),
        author: form.author.trim() || null,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        is_celebrity: form.is_celebrity,
        tags,
        cover_image_url: form.cover_image_url.trim() || null,
        cover_image_alt: form.cover_image_alt.trim() || null,
        intro: form.intro.trim() || null,
        section_1_title: form.section_1_title.trim() || null,
        section_1_content: form.section_1_content.trim() || null,
        section_1_images: form.section_1_images,
        section_2_title: form.section_2_title.trim() || null,
        section_2_content: form.section_2_content.trim() || null,
        section_2_images: form.section_2_images,
        section_3_title: form.section_3_title.trim() || null,
        section_3_content: form.section_3_content.trim() || null,
        section_3_images: form.section_3_images,
        section_4_title: form.section_4_title.trim() || null,
        section_4_content: form.section_4_content.trim() || null,
        section_4_images: form.section_4_images,
        section_5_title: form.section_5_title.trim() || null,
        section_5_content: form.section_5_content.trim() || null,
        section_5_images: form.section_5_images,
        status: form.status,
        category: form.category || null,
      };
      if (editingId) {
        const { error } = await supabase.from('blog_articles').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('文章已更新');
      } else {
        payload.published_at = new Date().toISOString();
        const { error } = await supabase.from('blog_articles').insert(payload);
        if (error) throw error;
        toast.success('文章已建立');
      }
      // Revalidate the article page cache
      if (form.category && form.handle) {
        await revalidateArticle(form.category, form.handle).catch(() => {});
      }
      setShowForm(false);
      loadArticles();
    } catch (e: any) { toast.error('儲存失敗：' + (e.message || '未知錯誤')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此文章？此操作不可撤銷。')) return;
    setDeleting(id);
    try {
      // Get article info before deleting for cache revalidation
      const { data: articleInfo } = await supabase.from('blog_articles').select('category, handle').eq('id', id).maybeSingle();
      const { error } = await supabase.from('blog_articles').delete().eq('id', id);
      if (error) throw error;
      toast.success('文章已刪除');
      // Revalidate the deleted article's page
      if (articleInfo?.category && articleInfo?.handle) {
        await revalidateArticle(articleInfo.category, articleInfo.handle).catch(() => {});
      }
      loadArticles();
    } catch (e: any) { toast.error('刪除失敗：' + (e.message || '未知錯誤')); }
    finally { setDeleting(null); }
  };

  const updateField = (field: keyof ArticleForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 md:p-6 space-y-4">

        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              文章管理 CMS
              <Badge variant="outline" className="text-cyan-400 border-cyan-400/30 ml-2">
                {totalCount} 篇
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={loadArticles} className="text-slate-300 border-slate-600">
                <RefreshCw className="w-4 h-4 mr-1" /> 刷新
              </Button>
              <Button size="sm" onClick={openCreateForm} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus className="w-4 h-4 mr-1" /> 新增文章
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜尋文章標題、作者、handle..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分類</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[130px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={celebrityFilter} onValueChange={v => { setCelebrityFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="明星同款" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部文章</SelectItem>
                  <SelectItem value="yes">明星同款</SelectItem>
                  <SelectItem value="no">非明星同款</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Articles Table */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <span className="ml-2 text-slate-400">載入中...</span>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>沒有找到文章</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">標題</TableHead>
                        <TableHead className="text-slate-300">分類</TableHead>
                        <TableHead className="text-slate-300">作者</TableHead>
                        <TableHead className="text-slate-300">明星同款</TableHead>
                        <TableHead className="text-slate-300">狀態</TableHead>
                        <TableHead className="text-slate-300 cursor-pointer select-none hover:text-cyan-400 transition-colors" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                          <div className="flex items-center gap-1">
                            發佈日期
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span className="text-xs text-slate-500">({sortOrder === 'desc' ? '新→舊' : '舊→新'})</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-slate-300 text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map(article => (
                        <TableRow key={article.id} className="border-slate-700/50 hover:bg-slate-800/50">
                          <TableCell className="text-white font-medium max-w-[250px] truncate">{article.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                              {CATEGORIES.find(c => c.value === article.category)?.label || article.category || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">{article.author || '-'}</TableCell>
                          <TableCell>
                            {article.is_celebrity ? (
                              <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">
                                <Star className="w-3 h-3 mr-1 fill-amber-400" />明星
                              </Badge>
                            ) : (
                              <span className="text-slate-500 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={article.status === 'active' ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30'}>
                              {article.status === 'active' ? '已發佈' : '草稿'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {article.published_at ? format(new Date(article.published_at), 'yyyy-MM-dd HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setPreviewArticle(article)} className="text-slate-400 hover:text-cyan-400 hover:bg-slate-700"><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditForm(article)} className="text-slate-400 hover:text-cyan-400"><Edit className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(article.id)} disabled={deleting === article.id} className="text-slate-400 hover:text-red-400">
                                {deleting === article.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-slate-400">第 {currentPage} / {totalPages} 頁（共 {totalCount} 篇）</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="text-slate-300 border-slate-600"><ChevronLeft className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="text-slate-300 border-slate-600"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Form Dialog - modal={false} to allow TinyMCE dialogs to receive focus */}
        {showForm && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => {}} />}
        <Dialog open={showForm} onOpenChange={setShowForm} modal={false}>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white z-50"
            onPointerDownOutside={(e) => {
              // With modal={false}, prevent all outside clicks from closing
              e.preventDefault();
            }}
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
            onFocusOutside={(e) => {
              e.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-white">{editingId ? '編輯文章' : '新增文章'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">基本資訊</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">標題 *</Label>
                    <Input value={form.title} onChange={e => updateField('title', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="文章標題" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Handle (URL Slug) *</Label>
                    <Input value={form.handle} onChange={e => updateField('handle', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="my-article-slug" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">作者</Label>
                    <Input value={form.author} onChange={e => updateField('author', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="作者名稱" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">分類</Label>
                    <Select value={form.category} onValueChange={v => updateField('category', v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="選擇分類" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">狀態</Label>
                    <Select value={form.status} onValueChange={v => updateField('status', v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">明星同款</Label>
                    <div className="flex items-center gap-2 pt-1">
                      <input type="checkbox" checked={form.is_celebrity} onChange={e => updateField('is_celebrity', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-800" />
                      <span className="text-sm text-slate-400">標記為明星同款文章</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Tags（逗號分隔）</Label>
                    <Input value={form.tags} onChange={e => updateField('tags', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="tag1, tag2, tag3" />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">SEO 設定</h3>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">SEO 標題</Label>
                  <Input value={form.seo_title} onChange={e => updateField('seo_title', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="SEO 標題（留空則用文章標題）" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">SEO 描述</Label>
                  <Textarea value={form.seo_description} onChange={e => updateField('seo_description', e.target.value)} className="bg-slate-800 border-slate-700 text-white min-h-[80px]" placeholder="SEO 描述文字" />
                </div>
              </div>

              {/* Cover Image - Upload */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">封面圖片</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploader label="上傳封面圖片" value={form.cover_image_url} onChange={url => updateField('cover_image_url', url)} />
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">封面圖片 Alt 文字</Label>
                    <Input value={form.cover_image_alt} onChange={e => updateField('cover_image_alt', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="圖片描述文字" />
                  </div>
                </div>
              </div>

              {/* Intro - Rich Text */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">簡介 (Intro)</h3>
                <ArticleRichTextEditor value={form.intro} onChange={v => updateField('intro', v)} placeholder="輸入文章簡介..." />
              </div>

              {/* Sections 1-5 */}
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="space-y-4">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">段落 {n}</h3>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">段落 {n} 標題</Label>
                    <Input
                      value={(form as any)[`section_${n}_title`]}
                      onChange={e => updateField(`section_${n}_title` as keyof ArticleForm, e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder={`段落 ${n} 標題`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">段落 {n} 內容</Label>
                    <ArticleRichTextEditor
                      value={(form as any)[`section_${n}_content`]}
                      onChange={v => updateField(`section_${n}_content` as keyof ArticleForm, v)}
                      placeholder={`輸入段落 ${n} 內容...`}
                    />
                  </div>
                  <MultiImageUploader
                    label={`段落 ${n} 圖片`}
                    images={(form as any)[`section_${n}_images`] || []}
                    onChange={urls => updateField(`section_${n}_images` as keyof ArticleForm, urls)}
                  />
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)} className="text-slate-300 border-slate-600">取消</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                {editingId ? '更新文章' : '建立文章'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog - matches public article page style */}
        <Dialog open={!!previewArticle} onOpenChange={() => setPreviewArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-900 p-0">
            <DialogTitle className="sr-only">文章預覽</DialogTitle>
            {previewArticle && (
              <div>
                {/* Header area - matching public page gradient header */}
                <section
                  className="border-b border-slate-100 px-6 pt-6 pb-5"
                  style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #f0fdf4 30%, #ecfeff 70%, #f0fdfa 100%)' }}
                >
                  {/* Category badge */}
                  {previewArticle.category && (
                    <Badge className="bg-teal-500 text-white border-0 text-[12px] shadow-sm mb-3">
                      {CATEGORIES.find(c => c.value === previewArticle.category)?.label || previewArticle.category}
                    </Badge>
                  )}

                  {/* Title - same as public */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
                    {previewArticle.title}
                  </h1>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-400">
                    {previewArticle.author && (
                      <span className="font-medium text-slate-600">{previewArticle.author}</span>
                    )}
                    {previewArticle.published_at && (
                      <>
                        <span className="text-slate-200">|</span>
                        <span>發佈於 {format(new Date(previewArticle.published_at), 'yyyy年M月d日')}</span>
                      </>
                    )}
                  </div>
                </section>

                {/* Content area */}
                <div className="px-6 py-6">
                  {/* Hero image */}
                  {previewArticle.cover_image_url && (
                    <figure className="mb-6">
                      <div className="rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={previewArticle.cover_image_url}
                          alt={previewArticle.cover_image_alt || ''}
                          className="w-full h-auto aspect-[16/9] object-cover"
                        />
                      </div>
                      {previewArticle.cover_image_alt && (
                        <figcaption className="text-[12px] text-slate-400 mt-2.5 text-center leading-relaxed">
                          {previewArticle.cover_image_alt}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Article body - matching ArticleBody component style */}
                  <div className="article-body space-y-5">
                    {/* Intro */}
                    {previewArticle.intro && (
                      <div
                        className="text-[15px] leading-[1.85] text-slate-700 [&_p]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:pt-4 [&_h2]:pb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: contentToHtml(previewArticle.intro) }}
                      />
                    )}

                    {/* Sections */}
                    {[1, 2, 3, 4, 5].map(n => {
                      const title = previewArticle[`section_${n}_title`];
                      const content = previewArticle[`section_${n}_content`];
                      const images = previewArticle[`section_${n}_images`];
                      if (!title && !content) return null;
                      return (
                        <div key={n}>
                          {title && (
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1 leading-snug flex items-center gap-2.5">
                              <span
                                className="inline-block w-1 h-5 rounded-full"
                                style={{ background: 'linear-gradient(180deg, #5eead4, #0d9488)' }}
                              />
                              {title}
                            </h2>
                          )}
                          {content && (
                            <div
                              className="text-[15px] leading-[1.85] text-slate-700 [&_p]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-teal-500 [&_a]:underline"
                              dangerouslySetInnerHTML={{ __html: contentToHtml(content) }}
                            />
                          )}
                          {images?.length > 0 && (
                            <div className="my-6">
                              {images.length === 1 ? (
                                <figure>
                                  <div className="rounded-xl overflow-hidden">
                                    <img src={images[0]} alt="" className="w-full h-auto object-cover" />
                                  </div>
                                </figure>
                              ) : (
                                <div className="grid grid-cols-2 gap-3">
                                  {images.map((img: string, i: number) => (
                                    <div key={i} className="rounded-xl overflow-hidden">
                                      <img src={img} alt="" className="w-full h-auto aspect-[4/3] object-cover" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tags */}
                  {previewArticle.tags?.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {previewArticle.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[13px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-500 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SEO info (admin only) */}
                  <div className="text-xs text-slate-400 pt-4 mt-6 border-t border-slate-100 space-y-1">
                    <p className="font-medium text-slate-500 mb-1">SEO 資訊</p>
                    <p>Handle: {previewArticle.handle}</p>
                    <p>SEO Title: {previewArticle.seo_title || '-'}</p>
                    <p>SEO Description: {previewArticle.seo_description || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
