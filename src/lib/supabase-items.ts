import type { SupabaseClient } from '@supabase/supabase-js';
import type { MemoryItem } from '@/lib/data';

// DB row → MemoryItem
function rowToItem(row: any): MemoryItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    url: row.url ?? undefined,
    sourceDomain: row.source_domain ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    summary: row.summary ?? '',
    tags: row.tags ?? [],
    isFavorite: row.is_favorite ?? false,
    createdAt: row.created_at,
    relatedIds: [],
    aiProcessed: row.ai_processed ?? false,
  };
}

export async function fetchItems(supabase: SupabaseClient, userId: string): Promise<MemoryItem[]> {
  const { data, error } = await supabase
    .from('memory_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchItems error:', error.message);
    return [];
  }
  return (data ?? []).map(rowToItem);
}

export async function saveItem(
  supabase: SupabaseClient,
  userId: string,
  data: { type: string; title: string; content: string; url?: string; thumbnailUrl?: string; summary?: string; tags?: string[] }
): Promise<MemoryItem | null> {
  const insert = {
    user_id: userId,
    type: data.type,
    title: data.title,
    content: data.content,
    url: data.url ?? null,
    thumbnail_url: data.thumbnailUrl ?? null,
    source_domain: data.url ? (() => { try { return new URL(data.url).hostname.replace('www.', ''); } catch { return null; } })() : null,
    summary: data.summary ?? '',
    tags: data.tags ?? [],
    is_favorite: false,
    ai_processed: !!data.summary || !!data.tags?.length,
  };

  console.log('Attempting to save item:', insert);
  const { data: row, error } = await supabase
    .from('memory_items')
    .insert(insert)
    .select()
    .single();

  if (error) {
    console.error('saveItem error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return null;
  }
  return rowToItem(row);
}

export async function toggleFavorite(
  supabase: SupabaseClient,
  id: string,
  isFavorite: boolean
): Promise<void> {
  const { error } = await supabase
    .from('memory_items')
    .update({ is_favorite: isFavorite })
    .eq('id', id);

  if (error) console.error('toggleFavorite error:', error.message);
}

export async function deleteItem(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('memory_items').delete().eq('id', id);
  if (error) console.error('deleteItem error:', error.message);
}
