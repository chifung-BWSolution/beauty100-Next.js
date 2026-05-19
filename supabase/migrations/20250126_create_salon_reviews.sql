-- Salon reviews/comments with star ratings and photo uploads
CREATE TABLE IF NOT EXISTS public.salon_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salon_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salon_reviews_salon_id ON public.salon_reviews(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_reviews_user_id ON public.salon_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_salon_reviews_created_at ON public.salon_reviews(created_at DESC);

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.salon_reviews;
