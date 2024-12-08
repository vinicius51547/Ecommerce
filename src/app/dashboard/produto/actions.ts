import { SupabaseClient } from '@supabase/supabase-js';

type Product = {
    id: number;
    uuid: string;
    name: string;
    info: string;
    price: number;
    image_url: string;
    category_id: number;
    category_name?: string;
    created_at?: string;
    updated_at?: string;
};

export async function listProducts(supabase: SupabaseClient): Promise<{ products: Product[]; error: any }> {
    const { data, error } = await supabase
        .from('product')
        .select(`
            id,
            uuid,
            name,
            info,
            price,
            image_url,
            category:category_id (
                category_name
            )
        `);

    const products = data?.map((product: any) => ({
        ...product,
        category_name: product.category?.category_name || 'Categoria desconhecida'
    })) || [];

    return { products, error };
}

// Inserindo Produtos
export async function insertProduct(supabase: SupabaseClient, productData: Omit<Product, 'id' | 'uuid'>): Promise<{ product: Product | null; error: any }> {
    const { data, error } = await supabase
        .from('product')
        .insert([{ ...productData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
        .select()
        .single();

    return { product: data, error };
}

// Atualizando produtos
export async function updateProduct(supabase: SupabaseClient, productId: number, productData: Partial<Omit<Product, 'id' | 'uuid'>>): Promise<{ product: Product | null; error: any }> {
    const { data, error } = await supabase
        .from('product')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();

    return { product: data, error };
}


// Excluindo produtos
export async function deleteProduct(supabase: SupabaseClient, productId: number): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
        .from('product')
        .delete()
        .eq('id', productId);

    return { success: !error, error };
}
