import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Uploads a file to the 'memories' bucket and returns the public URL.
 */
export async function uploadFile(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ url: string | null; error: any }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      return { url: null, error: uploadError };
    }

    const { data } = supabase.storage
      .from('memories')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    console.error('Unexpected error during upload:', err);
    return { url: null, error: err };
  }
}
