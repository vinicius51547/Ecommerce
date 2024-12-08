'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import SettingsForm from './formConfiguracoes/page';
import { listSettings } from './actions';
import { Sidebar } from '@/components/sidebar/page';
import styles from './style.module.scss';

type Settings = {
    id: number;
    title: string;
    subtitle: string;
    address: string;
    header_url: string;
    phone_number: string;
    created_at?: string;
    updated_at?: string;
};

export default function PrivatePageSettings() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<Settings[]>([]);
    const [editingSetting, setEditingSetting] = useState<Settings | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                router.push('/login');
            } else {
                setUser(data.user);
            }
            setLoading(false);
        };

        checkUser();
    }, [supabase, router]);

    useEffect(() => {
        const fetchSettings = async () => {
            const { settings, error } = await listSettings(supabase);
            if (error) {
                setError('Erro ao listar configurações: ' + error.message);
            } else {
                setSettings(settings);
                setError(null);
            }
        };

        fetchSettings();
    }, [supabase, refresh]);

    const handleSettingAdded = (setting: Settings) => {
        console.log('Configuração adicionada:', setting);
        setRefresh((prev) => !prev);
    };

    const handleSettingUpdated = (setting: Settings) => {
        console.log('Configuração atualizada:', setting);
        setRefresh((prev) => !prev);
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <>
            {user && (
                <>
                    <Sidebar isOpen={isSidebarOpen} />

                    <main className={`${styles.main} ${isSidebarOpen ? ' ' : styles.active}`}>
                        <div className={styles.container}>
                            {/* Sidebar */}
                            <button title={isSidebarOpen ? 'Fechar Menu' : 'Abrir Menu'} className={styles.btnSide} onClick={toggleSidebar}>
                                {isSidebarOpen ?
                                    <i className="ri-arrow-left-s-line"></i>
                                    :
                                    <i className="ri-arrow-right-s-line"></i>
                                }
                            </button>

                            {/* Titulo da seção */}
                            <h2 className="title_section">Configurações</h2>
                            {/* Container da listagem */}
                            <div className="container_list">
                                <SettingsForm
                                    onSettingAdded={handleSettingAdded}
                                    onSettingUpdated={handleSettingUpdated}
                                    editingSetting={editingSetting}
                                    setEditingSetting={setEditingSetting}
                                />
                            </div>

                            {error && <p style={{ color: 'red' }}>{error}</p>}


                        </div>
                    </main>
                </>


            )}
        </>
    );
}
