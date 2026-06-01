'use server';

import { revalidatePath } from 'next/cache';

/**
 * Revalidate an article page cache.
 * Call this after admin creates/updates/deletes an article.
 */
export async function revalidateArticle(category: string, slug: string) {
  revalidatePath(`/${category}/${slug}`);
  revalidatePath(`/${category}`);
  revalidatePath('/');
}

/**
 * Revalidate a salon detail page cache.
 * Call this after admin updates a salon profile.
 */
export async function revalidateSalon(salonId: string) {
  revalidatePath(`/salon/${salonId}`);
  revalidatePath('/explore-salons');
  revalidatePath('/');
}

/**
 * Revalidate the entire site (use sparingly).
 */
export async function revalidateAll() {
  revalidatePath('/', 'layout');
}

/**
 * Revalidate a specific path.
 */
export async function revalidateCustomPath(path: string) {
  revalidatePath(path);
}
