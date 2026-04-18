import type { SupabaseClient } from '@supabase/supabase-js';

export interface Collection {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isSmart: boolean;
  rules: any;
  itemCount: number;
}

export async function fetchCollections(supabase: SupabaseClient, userId: string): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_items(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('fetchCollections error:', error.message);
    return [];
  }

  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji ?? '📁',
    color: row.color ?? '#9CA3AF',
    isSmart: row.is_smart ?? false,
    rules: row.rules,
    itemCount: row.collection_items?.[0]?.count ?? 0
  }));
}

export async function createCollection(
  supabase: SupabaseClient, 
  userId: string, 
  data: { name: string; emoji?: string; color?: string; isSmart?: boolean; rules?: any }
) {
  const { data: row, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: data.name,
      emoji: data.emoji || '📁',
      color: data.color || '#9CA3AF',
      is_smart: data.isSmart || false,
      rules: data.rules || {}
    })
    .select()
    .single();

  if (error) {
    console.error('createCollection error:', error.message);
    return null;
  }
  return row;
}

export async function addItemToCollection(supabase: SupabaseClient, itemId: string, collectionId: string) {
  const { error } = await supabase
    .from('collection_items')
    .upsert({ item_id: itemId, collection_id: collectionId });

  if (error) {
    console.error('addItemToCollection error:', error.message);
    return false;
  }
  return true;
}

export async function fetchItemsInCollection(supabase: SupabaseClient, collectionId: string) {
  const { data, error } = await supabase
    .from('collection_items')
    .select('item_id')
    .eq('collection_id', collectionId);

  if (error) {
    console.error('fetchItemsInCollection error:', error.message);
    return [];
  }
  return data.map(d => d.item_id);
}
