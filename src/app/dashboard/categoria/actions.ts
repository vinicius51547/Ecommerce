import { SupabaseClient } from '@supabase/supabase-js';

type Category = {
  id: number;
  category_name: string;
};

// Listando Categorias
export async function listCategories(supabase: SupabaseClient): Promise<{ categories: Category[]; error: any }> {
  const { data, error } = await supabase
    .from('category')
    .select('id, category_name');

  return { categories: data ?? [], error };
}

// Criando Categorias
export async function insertCategory(supabase: SupabaseClient, categoryName: string): Promise<{ category: Category | null; error: any }> {
  const { data, error } = await supabase
    .from('category')
    .insert([{ category_name: categoryName }])
    .select()
    .single();

  return { category: data, error };
}

// Atualizando Categorias
export async function updateCategory(supabase: SupabaseClient, categoryId: number, categoryName: string): Promise<{ category: Category | null; error: any }> {
  const { data, error } = await supabase
    .from('category')
    .update({ category_name: categoryName })
    .eq('id', categoryId)
    .select()
    .single();

  return { category: data, error };
}

// Excluindo Categorias
export async function deleteCategory(supabase: SupabaseClient, categoryId: number): Promise<{ success: boolean; error: any }> {
  const { error } = await supabase
    .from('category')
    .delete()
    .eq('id', categoryId);

  return { success: !error, error };
}
