'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ListProducts from './listProduto/page';
import ProductForm from './formProduto/page';
import { createClient } from '../../../../utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Sidebar } from '@/components/sidebar/page';
import Modal from '@/components/modal/page';
import styles from './style.module.scss';

type Product = {
    id: number;
    uuid: string;
    name: string;
    info: string;
    price: number;
    image_url: string;
    category_id: number;
};

export default function PrivatePageProduct() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [refresh, setRefresh] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


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

    const handleProductAdded = () => {
        console.log('Produto adicionado.');
        setRefresh((prev) => !prev);
        setIsModalOpen(false);
    };

    const handleProductUpdated = () => {
        console.log('Produto atualizado.');
        setRefresh((prev) => !prev);
        setIsModalOpen(false);
    };

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
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
                            <h2 className="title_section">Produtos</h2>

                            {/* Container da listagem */}
                            <div className="container_list">
                                <ListProducts onEdit={handleOpenModal} refresh={refresh} />
                            </div>

                            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                                <ProductForm
                                    onProductAdded={handleProductAdded}
                                    onProductUpdated={handleProductUpdated}
                                    editingProduct={editingProduct}
                                    setEditingProduct={setEditingProduct}
                                    onClose={handleCloseModal}
                                />
                            </Modal>
                        </div>
                    </main>
                </>
            )}
        </>
    );
}
