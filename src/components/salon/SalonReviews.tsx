'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Star, Camera, X, User, Lock, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, MessageSquarePlus, Image as ImageIcon, Images } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  salon_id: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  comment: string | null;
  photos: string[];
  created_at: string;
}

interface SalonReviewsProps {
  salonId: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function SalonReviews({ salonId }: SalonReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog state
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  // All photos gallery
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Sorting and filtering
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [salonId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('salon_reviews')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  };

  // All photos from all reviews
  const allReviewPhotos = useMemo(() => {
    const allPhotos: string[] = [];
    reviews.forEach(r => {
      if (r.photos && r.photos.length > 0) {
        allPhotos.push(...r.photos);
      }
    });
    return allPhotos;
  }, [reviews]);

  // Sorted & filtered reviews
  const displayedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by star rating
    if (filterRating !== null) {
      filtered = filtered.filter(r => r.rating === filterRating);
    }

    // Sort
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    return filtered;
  }, [reviews, sortOption, filterRating]);

  // Rating distribution for filter pills
  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
    return counts;
  }, [reviews]);

  const compressImage = async (file: File): Promise<File> => {
    // If already under 1MB, return as-is
    if (file.size <= 1024 * 1024) return file;

    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if too large
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels to get under 1MB
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob && (blob.size <= 1024 * 1024 || quality <= 0.3)) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };
        tryCompress();
      };
      img.src = url;
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Compress all selected files
    const compressedFiles = await Promise.all(files.map(f => compressImage(f)));
    const newPhotos = [...photos, ...compressedFiles];
    setPhotos(newPhotos);

    // Generate previews
    const previews = newPhotos.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return previews;
    });

    // Reset file input so the same files can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const ext = photo.type === 'image/png' ? 'png' : 'jpg';
      const fileName = `reviews/${salonId}/${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage
        .from('public')
        .upload(fileName, photo, {
          cacheControl: '3600',
          upsert: false,
          contentType: photo.type || 'image/jpeg',
        });

      if (error) {
        console.error('Photo upload error:', error.message);
      } else {
        const { data: urlData } = supabase.storage.from('public').getPublicUrl(fileName);
        if (urlData?.publicUrl) {
          urls.push(urlData.publicUrl);
        }
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setSubmitting(true);
    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos();
      }

      const userName = user.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '匿名用戶';

      const { error } = await supabase.from('salon_reviews').insert({
        salon_id: salonId,
        user_id: user.id,
        user_name: userName,
        rating,
        comment: comment.trim() || null,
        photos: photoUrls,
      });

      if (!error) {
        setRating(0);
        setComment('');
        setPhotos([]);
        setPhotoPreviews([]);
        setShowReviewDialog(false);
        await fetchReviews();
      } else {
        alert('提交失敗，請稍後再試');
      }
    } catch (err) {
      alert('提交失敗，請稍後再試');
    }
    setSubmitting(false);
  };

  // Gallery helpers
  const openGallery = (images: string[], startIndex: number) => {
    setGalleryImages(images);
    setGalleryIndex(startIndex);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setGalleryImages([]);
    setGalleryIndex(0);
  };

  const galleryPrev = useCallback(() => {
    setGalleryIndex(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  }, [galleryImages.length]);

  const galleryNext = useCallback(() => {
    setGalleryIndex(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  }, [galleryImages.length]);

  // Keyboard navigation for gallery
  useEffect(() => {
    if (!showGallery) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') galleryPrev();
      if (e.key === 'ArrowRight') galleryNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showGallery, galleryPrev, galleryNext]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
    return `${Math.floor(diffDays / 365)} 年前`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-5 border-b border-rose-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">用戶評價</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {averageRating && (
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-slate-800">{averageRating}</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(parseFloat(averageRating))
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <span className="text-sm text-slate-500">
                  {reviews.length > 0 ? `${reviews.length} 則評價` : '暫無評價'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Write Review Button */}
          {isAuthenticated ? (
            <Button
              onClick={() => setShowReviewDialog(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-rose-200/50 transition-all hover:shadow-lg hover:shadow-rose-200/50"
            >
              <MessageSquarePlus className="w-4 h-4" />
              撰寫評價
            </Button>
          ) : (
            <Link href="/member-login">
              <Button variant="outline" className="text-rose-500 border-rose-200 hover:bg-rose-50 text-sm rounded-xl flex items-center gap-2">
                <Lock className="w-4 h-4" />
                登入評價
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Sorting & Filtering Controls */}
        {reviews.length > 0 && (
          <div className="space-y-3 mb-5">
            {/* Sort Options */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>排序</span>
              </div>
              {([
                { value: 'newest' as SortOption, label: '最新' },
                { value: 'oldest' as SortOption, label: '最舊' },
                { value: 'highest' as SortOption, label: '最高評分' },
                { value: 'lowest' as SortOption, label: '最低評分' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortOption(opt.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                    sortOption === opt.value
                      ? 'bg-rose-500 border-rose-500 text-white font-medium shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Star Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>篩選</span>
              </div>
              <button
                onClick={() => setFilterRating(null)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                  filterRating === null
                    ? 'bg-rose-500 border-rose-500 text-white font-medium shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                全部
              </button>
              {[5, 4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 flex items-center gap-1 ${
                    filterRating === star
                      ? 'bg-amber-500 border-amber-500 text-white font-medium shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Star className={`w-3 h-3 ${filterRating === star ? 'text-white fill-white' : 'text-amber-400 fill-amber-400'}`} />
                  {star}
                  <span className={filterRating === star ? 'text-white/80' : 'text-slate-400'}>({ratingCounts[star]})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Photos Gallery Strip */}
        {allReviewPhotos.length > 0 && (
          <div className="mb-5">
            <button
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors mb-3 group"
            >
              <Images className="w-4 h-4 text-rose-400 group-hover:text-rose-500" />
              <span>所有評價圖片</span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{allReviewPhotos.length}</span>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showAllPhotos ? 'rotate-90' : ''}`} />
            </button>
            
            {showAllPhotos && (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {allReviewPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => openGallery(allReviewPhotos, idx)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {reviews.length > 0 && <div className="border-t border-slate-100 mb-5" />}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-24 mb-1" />
                    <div className="h-3 bg-slate-100 rounded w-16" />
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquarePlus className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">
              {filterRating !== null ? '此評分暫無評價' : '暫無評價，成為第一個留下評價的人吧！'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {displayedReviews.map((review, reviewIdx) => (
              <div
                key={review.id}
                className={`py-5 ${reviewIdx !== displayedReviews.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                {/* User Info Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{review.user_name || '匿名用戶'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{getTimeAgo(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-slate-700 leading-relaxed mb-3 pl-[52px]">{review.comment}</p>
                )}

                {/* Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap pl-[52px]">
                    {review.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => openGallery(review.photos, idx)}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        {idx === 0 && review.photos.length > 3 && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-sm">
                            <ImageIcon className="w-2.5 h-2.5" />
                            {review.photos.length}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog/Popup */}
      {showReviewDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviewDialog(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">撰寫評價</h3>
              <button
                onClick={() => setShowReviewDialog(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Star Rating */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">你的評分</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-sm text-slate-500 ml-3 bg-slate-50 px-2 py-0.5 rounded-md">
                      {rating === 1 && '差'}
                      {rating === 2 && '一般'}
                      {rating === 3 && '尚可'}
                      {rating === 4 && '好'}
                      {rating === 5 && '非常好'}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">評價內容</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="分享你的體驗..."
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 bg-slate-50 focus:bg-white transition-colors"
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/1000</p>
              </div>

              {/* Photo Upload */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">上傳圖片</p>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100 hover:border-rose-300 transition-all"
                  >
                    <Camera className="w-4 h-4 text-rose-400" />
                    選擇圖片{photos.length > 0 ? ` (${photos.length})` : ''}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>

                {/* Photo Previews */}
                {photoPreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {photoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  className="text-sm rounded-xl px-5"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={rating === 0 || submitting}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-sm px-5 py-2.5 rounded-xl disabled:opacity-50 shadow-md shadow-rose-200/50"
                >
                  {submitting ? '提交中...' : '提交評價'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fancybox-style Gallery Lightbox */}
      {showGallery && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={closeGallery}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
            onClick={closeGallery}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white/80 text-sm bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {galleryIndex + 1} / {galleryImages.length}
          </div>

          {/* Previous button */}
          {galleryImages.length > 1 && (
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); galleryPrev(); }}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Main image */}
          <div className="flex items-center justify-center w-full h-full p-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[galleryIndex]}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next button */}
          {galleryImages.length > 1 && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); galleryNext(); }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Thumbnail strip */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 p-2.5 rounded-xl backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === galleryIndex ? 'border-white opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
