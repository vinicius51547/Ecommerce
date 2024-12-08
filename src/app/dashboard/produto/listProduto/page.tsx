'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../utils/supabase/client';
import { listProducts, deleteProduct } from '../actions';
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
    category_name?: string;
};

type ListProductsProps = {
    onEdit: (product: Product | null) => void;
    refresh: boolean;
};



const ListProducts = ({ onEdit, refresh }: ListProductsProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');


    const supabase = createClient();

    useEffect(() => {
        const fetchProducts = async () => {
            const { products, error } = await listProducts(supabase);
            if (error) {
                setError('Erro ao listar produtos: ' + error.message);
            } else {
                setFilteredProducts(products);
                setProducts(products);
            }
        };

        fetchProducts();
    }, [refresh, supabase]);

    // Filtra Produtos
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        if (term === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        try {
            const { success, error } = await deleteProduct(supabase, productToDelete.id);
            if (error) {
                setError('Erro ao excluir produto: ' + error.message);
            } else if (success) {
                console.log('Produto excluído com sucesso:', productToDelete.id);
                setProducts((prevProducts) =>
                    prevProducts.filter((category) => category.id !== productToDelete.id)
                );
                setFilteredProducts((prevProducts) =>
                    prevProducts.filter((product) => product.id !== productToDelete.id)
                );

                setIsModalOpen(false);
                setProductToDelete(null);
            }
        } catch (error: any) {
            console.error('Erro ao excluir Produto:', error.message);
            setError('Erro ao excluir produto. Verifique o console para mais detalhes.');
        }
    };

    // Abrir Modal
    const openConfirmationModal = (product: Product) => {
        setProductToDelete(product);
        setIsModalOpen(true);
    };

    // Fechar Modal
    const closeConfirmationModal = () => {
        setProductToDelete(null);
        setIsModalOpen(false);
    };

    return (
        <>

            <div className={styles.listTopConatiner}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar Produtos..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <i className="ri-search-line"></i>
                </div>
                <button onClick={() => onEdit(null)}>
                    <i className="ri-add-line"></i>
                    Criar Produto
                </button>
            </div>


            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.table_row}>
                            <th className={styles.empty_header}>Nome do Produto</th>
                            <th className={styles.empty_header}>Descrição</th>
                            <th className={styles.empty_header}>Preço</th>
                            <th className={styles.empty_header}>Imagem</th>
                            <th className={styles.empty_header}>Categoria</th>
                            <th className={styles.empty_header}>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className={styles.table_row}>
                                <td>{product.name}</td>
                                <td>{product.info}</td>
                                <td>R${product.price}</td>
                                <td><img src={product.image_url} alt="" className={styles.img_table} /></td>
                                <td>{product.category_name}</td>
                                <td className={styles.btns_container}>
                                    <button onClick={() => onEdit(product)} className={styles.btn_edit} title='Editar Produto'>
                                        <i className="ri-file-edit-line"></i>
                                    </button>
                                    <button onClick={() => openConfirmationModal(product)} className={styles.btn_delete} title='Excluir Produto'>
                                        <i className="ri-delete-bin-2-line"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Modal isOpen={isModalOpen} onClose={closeConfirmationModal}>
                <div className="modalContainer">
                    <i className="ri-information-2-line"></i>
                    <p>Tem certeza que deseja excluir o produto "{productToDelete?.name}"?</p>
                    <div className="btns_container_modal">
                        <button onClick={closeConfirmationModal}>Cancelar</button>
                        <button onClick={handleDeleteProduct} className="btn_modal_delete">Deletar</button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ListProducts;
