'use client'

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { listSettings } from '../dashboard/configuracoes/actions';
import styles from './style.module.scss';

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
};

type Category = {
    id: number;
    category_name: string;
};

type Product = {
    id: number;
    uuid: string;
    name: string;
    info: string;
    price: number;
    image_url: string;
    category_id: number;
    category_name?: string;
};

const Site = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<Settings[]>([]);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('category')
                .select('*');
            if (error) {
                console.error('Erro ao buscar categorias:', error.message);
                setError('Erro ao buscar categorias.');
            } else if (data) {
                setCategories(data);
            }
        };

        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('product')
                .select('*');
            if (error) {
                console.error('Erro ao buscar produtos:', error.message);
                setError('Erro ao buscar produtos.');
            } else if (data) {
                setProducts(data);
            }
        };

        const fetchData = async () => {
            await Promise.all([fetchCategories(), fetchProducts()]);
        };

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
        fetchData();
    }, [supabase]);

    return (
        <>
            {error && <p>{error}</p>}
            {settings.map(setting => (
                <section key={setting.id} className={styles.bannerSection}>
                    <img src={setting.header_url} alt="Header Image" className={styles.banner} />
                    <div className={styles.logo_container}>
                        <img src={setting.company_logo} alt="Logo do estabelecimento" />
                    </div>
                    {/* <h2>{setting.title}</h2>
                    <p>{setting.subtitle}</p> */}
                </section>
            ))}

            {/* <h1>Categorias e Produtos</h1>
            <ul>
                {categories.map(category => (
                    <li key={category.id}>
                        <h2>{category.category_name}</h2>
                        <ul>
                            {products
                                .filter(product => product.category_id === category.id)
                                .map(filteredProduct => (
                                    <li key={filteredProduct.id}>{filteredProduct.name}</li>
                                ))
                            }
                        </ul>
                    </li>
                ))}
            </ul> */}
        </>
    );
}

export default Site;
