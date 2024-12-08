'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../utils/supabase/client';
import { listCategories, deleteCategory } from '../actions';
import styles from './style.module.scss';
import Modal from '@/components/modal/page';

type Category = {
  id: number;
  category_name: string;
};

type ListCategoriesProps = {
  onEdit: (category: Category | null) => void;
  refresh: boolean;
};

const ListCategories = ({ onEdit, refresh }: ListCategoriesProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { categories, error } = await listCategories(supabase);
      if (error) {
        console.error('Erro ao buscar categorias:', error.message);
        setError('Erro ao buscar categorias.');
      } else {
        setCategories(categories);
        setFilteredCategories(categories);
      }
    };

    fetchData();
  }, [refresh]);

  // Filtro Categoria
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.category_name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  // Função de excluir categoria
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const { success, error } = await deleteCategory(supabase, categoryToDelete.id);
      if (error) {
        console.error('Erro ao excluir categoria:', error.message);
        setError('Erro ao excluir categoria.');
      } else if (success) {
        console.log('Categoria excluída com sucesso:', categoryToDelete.id);
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryToDelete.id)
        );
        setFilteredCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== categoryToDelete.id)
        );
        setIsModalOpen(false);
        setCategoryToDelete(null);
      }
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error.message);
      setError('Erro ao excluir categoria. Verifique o console para mais detalhes.');
    }
  };

  // Abrir Modal
  const openConfirmationModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsModalOpen(true);
  };

  // Fechar Modal
  const closeConfirmationModal = () => {
    setCategoryToDelete(null);
    setIsModalOpen(false);
  };

  return (
    <>


        <div className={styles.listTopConatiner}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar categorias..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <i className="ri-search-line"></i>
          </div>
          <button onClick={() => onEdit(null)}>
            <i className="ri-add-line"></i>
            Criar Categoria
          </button>
        </div>

        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.table_row}>
                <th className={styles.empty_header}>Nome da Categoria</th>
                <th className={styles.empty_header}>&nbsp;</th>
                <th className={styles.empty_header}>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className={styles.table_row}>
                  <td>{category.category_name}</td>
                  <td>
                    <button onClick={() => onEdit(category)} className={styles.btn_edit} title='Editar Categoria'>
                      <i className="ri-file-edit-line"></i>
                    </button>
                  </td>
                  <td>
                    <button onClick={() => openConfirmationModal(category)} className={styles.btn_delete} title='Deletar Categoria'>
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
          <p>Tem certeza que deseja excluir a categoria "{categoryToDelete?.category_name}"?</p>
          <div className="btns_container_modal">
            <button onClick={closeConfirmationModal}>Cancelar</button>
            <button onClick={handleDeleteCategory} className="btn_modal_delete">Deletar</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ListCategories;
