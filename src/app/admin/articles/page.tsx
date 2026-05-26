'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Search, Plus, Edit, Trash2, Eye, RefreshCw, Loader2, FileText, Image as ImageIcon, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AdminSidebar from '@/components/AdminSidebar';

const PAGE_SIZE = 20;

const CATEGORIES = [
  { value: 'facial-care', label: '面部護理' },
  { value: 'body-care', label: '身體護理' },
  { value: 'anti-aging', label: '抗衰老' },
  { value: 'skincare', label: '護膚' },
  { value: 'healthy-diet', label: '健康飲食' },
  { value: 'entertainment', label: '娛樂' },
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
  blog_handle: string;
  blog_title: string;
  tags: string;
  published_at: string;
  cover_image_url: string;
  cover_image_alt: string;
  intro: string;
  section_1_title: string;
  section_1_content: string;
  section_1_images: string;
  section_2_title: string;
  section_2_content: string;
  section_2_images: string;
  section_3_title: string;
  section_3_content: string;
  section_3_images: string;
  section_4_title: string;
  section_4_content: string;
  section_4_images: string;
  section_5_title: string;
  section_5_content: string;
  section_5_images: string;
  status: string;
  category: string;
}

const emptyForm: ArticleForm = {
  handle: '',
  title: '',
  author: '',
  seo_title: '',
  seo_description: '',
  blog_handle: '',
  blog_title: '',
  tags: '',
  published_at: '',
  cover_image_url: '',
  cover_image_alt: '',
  intro: '',
  section_1_title: '',
  section_1_content: '',
  section_1_images: '',
  section_2_title: '',
  section_2_content: '',
  section_2_images: '',
  section_3_title: '',
  section_3_content: '',
  section_3_images: '',
  section_4_title: '',
  section_4_content: '',
  section_4_images: '',
  section_5_title: '',
  section_5_content: '',
  section_5_images: '',
  status: 'draft',
  category: '',
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Preview
  const [previewArticle, setPreviewArticle] = useState<any>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_articles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm.trim()}%,author.ilike.%${searchTerm.trim()}%,handle.ilike.%${searchTerm.trim()}%`);
      }

      const from = (currentPage - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      setArticles(data || []);
      setTotalCount(count || 0);
    } catch (e: any) {
      console.error('Failed to load articles:', e);
      toast.error('載入文章失敗');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, searchTerm, currentPage]);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, published_at: new Date().toISOString().slice(0, 16) });
    setShowForm(true);
  };

  const openEditForm = (article: any) => {
    setEditingId(article.id);
    setForm({
      handle: article.handle || '',
      title: article.title || '',
      author: article.author || '',
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || '',
      blog_handle: article.blog_handle || '',
      blog_title: article.blog_title || '',
      tags: (article.tags || []).join(', '),
      published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : '',
      cover_image_url: article.cover_image_url || '',
      cover_image_alt: article.cover_image_alt || '',
      intro: article.intro ? (typeof article.intro === 'string' ? article.intro : JSON.stringify(article.intro, null, 2)) : '',
      section_1_title: article.section_1_title || '',
      section_1_content: article.section_1_content ? (typeof article.section_1_content === 'string' ? article.section_1_content : JSON.stringify(article.section_1_content, null, 2)) : '',
      section_1_images: (article.section_1_images || []).join(', '),
      section_2_title: article.section_2_title || '',
      section_2_content: article.section_2_content ? (typeof article.section_2_content === 'string' ? article.section_2_content : JSON.stringify(article.section_2_content, null, 2)) : '',
      section_2_images: (article.section_2_images || []).join(', '),
      section_3_title: article.section_3_title || '',
      section_3_content: article.section_3_content ? (typeof article.section_3_content === 'string' ? article.section_3_content : JSON.stringify(article.section_3_content, null, 2)) : '',
      section_3_images: (article.section_3_images || []).join(', '),
      section_4_title: article.section_4_title || '',
      section_4_content: article.section_4_content ? (typeof article.section_4_content === 'string' ? article.section_4_content : JSON.stringify(article.section_4_content, null, 2)) : '',
      section_4_images: (article.section_4_images || []).join(', '),
      section_5_title: article.section_5_title || '',
      section_5_content: article.section_5_content ? (typeof article.section_5_content === 'string' ? article.section_5_content : JSON.stringify(article.section_5_content, null, 2)) : '',
      section_5_images: (article.section_5_images || []).join(', '),
      status: article.status || 'draft',
      category: article.category || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('請填寫文章標題');
      return;
    }
    if (!form.handle.trim()) {
      toast.error('請填寫 Handle (URL slug)');
      return;
    }

    setSaving(true);
    try {
      // Parse tags
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);

      // Parse JSONB fields
      let intro: any = null;
      if (form.intro.trim()) {
        try {
          intro = JSON.parse(form.intro);
        } catch {
          intro = [{ type: 'paragraph', content: form.intro }];
        }
      }

      const parseSectionContent = (content: string) => {
        if (!content.trim()) return null;
        try {
          return JSON.parse(content);
        } catch {
          return [{ type: 'paragraph', content }];
        }
      };

      const parseImages = (images: string) => {
        if (!images.trim()) return [];
        return images.split(',').map(i => i.trim()).filter(Boolean);
      };

      const payload: any = {
        handle: form.handle.trim(),
        title: form.title.trim(),
        author: form.author.trim() || null,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        blog_handle: form.blog_handle.trim() || null,
        blog_title: form.blog_title.trim() || null,
        tags,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
        cover_image_url: form.cover_image_url.trim() || null,
        cover_image_alt: form.cover_image_alt.trim() || null,
        intro,
        section_1_title: form.section_1_title.trim() || null,
        section_1_content: parseSectionContent(form.section_1_content),
        section_1_images: parseImages(form.section_1_images),
        section_2_title: form.section_2_title.trim() || null,
        section_2_content: parseSectionContent(form.section_2_content),
        section_2_images: parseImages(form.section_2_images),
        section_3_title: form.section_3_title.trim() || null,
        section_3_content: parseSectionContent(form.section_3_content),
        section_3_images: parseImages(form.section_3_images),
        section_4_title: form.section_4_title.trim() || null,
        section_4_content: parseSectionContent(form.section_4_content),
        section_4_images: parseImages(form.section_4_images),
        section_5_title: form.section_5_title.trim() || null,
        section_5_content: parseSectionContent(form.section_5_content),
        section_5_images: parseImages(form.section_5_images),
        status: form.status,
        category: form.category || null,
      };

      if (editingId) {
        const { error } = await supabase.from('blog_articles').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('文章已更新');
      } else {
        const { error } = await supabase.from('blog_articles').insert(payload);
        if (error) throw error;
        toast.success('文章已建立');
      }

      setShowForm(false);
      loadArticles();
    } catch (e: any) {
      console.error('Save failed:', e);
      toast.error('儲存失敗：' + (e.message || '未知錯誤'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此文章？此操作不可撤銷。')) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('blog_articles').delete().eq('id', id);
      if (error) throw error;
      toast.success('文章已刪除');
      loadArticles();
    } catch (e: any) {
      toast.error('刪除失敗：' + (e.message || '未知錯誤'));
    } finally {
      setDeleting(null);
    }
  };

  const updateField = (field: keyof ArticleForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-10">
            <AdminSidebar isMobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-4 md:p-6 overflow-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 mb-4">
          <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen(true)}>
            <FileText className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold text-white">文章管理</h1>
        </div>

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
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[130px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
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
                        <TableHead className="text-slate-300">狀態</TableHead>
                        <TableHead className="text-slate-300">發佈日期</TableHead>
                        <TableHead className="text-slate-300 text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map(article => (
                        <TableRow key={article.id} className="border-slate-700/50 hover:bg-slate-800/50">
                          <TableCell className="text-white font-medium max-w-[250px] truncate">
                            {article.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs">
                              {CATEGORIES.find(c => c.value === article.category)?.label || article.category || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">{article.author || '-'}</TableCell>
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
                              <Button size="sm" variant="ghost" onClick={() => setPreviewArticle(article)} className="text-slate-400 hover:text-white">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => openEditForm(article)} className="text-slate-400 hover:text-cyan-400">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(article.id)}
                                disabled={deleting === article.id}
                                className="text-slate-400 hover:text-red-400"
                              >
                                {deleting === article.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-slate-400">第 {currentPage} / {totalPages} 頁（共 {totalCount} 篇）</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="text-slate-300 border-slate-600">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="text-slate-300 border-slate-600">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? '編輯文章' : '新增文章'}
              </DialogTitle>
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
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="選擇分類" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">狀態</Label>
                    <Select value={form.status} onValueChange={v => updateField('status', v)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">發佈日期</Label>
                    <Input type="datetime-local" value={form.published_at} onChange={e => updateField('published_at', e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Blog Handle</Label>
                    <Input value={form.blog_handle} onChange={e => updateField('blog_handle', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="blog-handle" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">Blog Title</Label>
                    <Input value={form.blog_title} onChange={e => updateField('blog_title', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="Blog 標題" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-slate-300">Tags（逗號分隔）</Label>
                    <Input value={form.tags} onChange={e => updateField('tags', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="tag1, tag2, tag3" />
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">SEO 設定</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">SEO 標題</Label>
                    <Input value={form.seo_title} onChange={e => updateField('seo_title', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="SEO 標題（留空則用文章標題）" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">SEO 描述</Label>
                    <Textarea value={form.seo_description} onChange={e => updateField('seo_description', e.target.value)} className="bg-slate-800 border-slate-700 text-white min-h-[80px]" placeholder="SEO 描述文字" />
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">封面圖片</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">封面圖片 URL</Label>
                    <Input value={form.cover_image_url} onChange={e => updateField('cover_image_url', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">封面圖片 Alt</Label>
                    <Input value={form.cover_image_alt} onChange={e => updateField('cover_image_alt', e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="圖片描述文字" />
                  </div>
                </div>
                {form.cover_image_url && (
                  <div className="w-full max-w-sm rounded-lg overflow-hidden border border-slate-700">
                    <img src={form.cover_image_url} alt={form.cover_image_alt || ''} className="w-full h-40 object-cover" />
                  </div>
                )}
              </div>

              {/* Intro */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">簡介 (Intro)</h3>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">簡介內容（JSON 或純文字）</Label>
                  <Textarea value={form.intro} onChange={e => updateField('intro', e.target.value)} className="bg-slate-800 border-slate-700 text-white min-h-[100px] font-mono text-sm" placeholder='[{"type":"paragraph","content":"..."}] 或純文字' />
                </div>
              </div>

              {/* Sections 1-5 */}
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="space-y-4">
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">段落 {n}</h3>
                  <div className="grid grid-cols-1 gap-4">
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
                      <Label className="text-slate-300">段落 {n} 內容（JSON 或純文字）</Label>
                      <Textarea
                        value={(form as any)[`section_${n}_content`]}
                        onChange={e => updateField(`section_${n}_content` as keyof ArticleForm, e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white min-h-[100px] font-mono text-sm"
                        placeholder='[{"type":"paragraph","content":"..."}] 或純文字'
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">段落 {n} 圖片 URL（逗號分隔）</Label>
                      <Input
                        value={(form as any)[`section_${n}_images`]}
                        onChange={e => updateField(`section_${n}_images` as keyof ArticleForm, e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="https://img1.jpg, https://img2.jpg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)} className="text-slate-300 border-slate-600">
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                {editingId ? '更新文章' : '建立文章'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewArticle} onOpenChange={() => setPreviewArticle(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                預覽文章
              </DialogTitle>
            </DialogHeader>
            {previewArticle && (
              <div className="space-y-4">
                {previewArticle.cover_image_url && (
                  <img src={previewArticle.cover_image_url} alt={previewArticle.cover_image_alt || ''} className="w-full h-48 object-cover rounded-lg" />
                )}
                <h2 className="text-xl font-bold text-white">{previewArticle.title}</h2>
                <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                  {previewArticle.author && <span>作者：{previewArticle.author}</span>}
                  {previewArticle.category && <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">{CATEGORIES.find(c => c.value === previewArticle.category)?.label || previewArticle.category}</Badge>}
                  {previewArticle.published_at && <span>發佈：{format(new Date(previewArticle.published_at), 'yyyy-MM-dd')}</span>}
                </div>
                {previewArticle.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {previewArticle.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                {previewArticle.intro && (
                  <div className="bg-slate-800 p-3 rounded-lg">
                    <p className="text-sm text-slate-300 font-medium mb-1">簡介：</p>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">
                      {typeof previewArticle.intro === 'string' ? previewArticle.intro : JSON.stringify(previewArticle.intro, null, 2)}
                    </p>
                  </div>
                )}
                {[1, 2, 3, 4, 5].map(n => {
                  const title = previewArticle[`section_${n}_title`];
                  const content = previewArticle[`section_${n}_content`];
                  const images = previewArticle[`section_${n}_images`];
                  if (!title && !content) return null;
                  return (
                    <div key={n} className="bg-slate-800/50 p-3 rounded-lg space-y-2">
                      {title && <h4 className="font-semibold text-white">段落 {n}：{title}</h4>}
                      {content && (
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">
                          {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                        </p>
                      )}
                      {images?.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {images.map((img: string, i: number) => (
                            <img key={i} src={img} alt="" className="w-24 h-24 object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                  <p>Handle: {previewArticle.handle}</p>
                  <p>SEO Title: {previewArticle.seo_title || '-'}</p>
                  <p>SEO Description: {previewArticle.seo_description || '-'}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
