import { SupabaseClient } from '@supabase/supabase-js';

type Settings = {
    id: number;
    title: string;
    subtitle: string;
    address: string;
    header_url: string;
    phone_number: string;
    company_logo: string;
    created_at?: string;
    updated_at?: string;
}

export const fetchSetting = async (supabase: SupabaseClient): Promise<{ data: Settings | null; error: any }> => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
  
      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return { data: null, error };
    }
  };

// Listando Configurações
export async function listSettings(supabase: SupabaseClient): Promise<{ settings: Settings[]; error: any }> {
    const { data, error } = await supabase
        .from('settings')
        .select('id, title, subtitle, address, header_url, phone_number, company_logo');

    return { settings: data ?? [], error };
}

// Inserindo Configuração
export async function insertSetting(supabase: SupabaseClient, newSetting: Omit<Settings, 'id' | 'created_at' | 'updated_at'>): Promise<{ setting: Settings | null; error: any }> {
    const { data, error } = await supabase
        .from('settings')
        .insert([{ ...newSetting, created_at: new Date().toISOString() }])
        .select()
        .single();

    return { setting: data, error };
}

// Atualizando Configuração
export async function updateSetting(supabase: SupabaseClient, id: number, updatedSetting: Partial<Settings>): Promise<{ setting: Settings | null; error: any }> {
    const { data, error } = await supabase
        .from('settings')
        .update({ ...updatedSetting, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    return { setting: data, error };
}

// Excluindo Configuração
export async function deleteSetting(supabase: SupabaseClient, id: number): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
        .from('settings')
        .delete()
        .eq('id', id);

    return { success: !error, error };
}
