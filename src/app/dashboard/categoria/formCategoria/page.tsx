'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../utils/supabase/client';
import { insertCategory, updateCategory } from '../actions';
import styles from './style.module.scss';

type Category = {
  id: number;
  category_name: string;
};

type CategoryFormProps = {
  onCategoryAdded: () => void;
  onCategoryUpdated: () => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
  onClose: () => void;
};

const CategoryForm = ({ onCategoryAdded, onCategoryUpdated, editingCategory, setEditingCategory, onClose }: CategoryFormProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.category_name);
    } else {
      setCategoryName('');
    }
  }, [editingCategory]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (editingCategory) {
        const { category, error } = await updateCategory(supabase, editingCategory.id, categoryName);
        if (error) {
          console.error('Erro ao atualizar categoria:', error.message);
          setError('Falha ao atualizar a categoria.');
        } else if (category) {
          onCategoryUpdated();
          setSuccess(`Categoria "${category.category_name}" atualizada com sucesso.`);
          setEditingCategory(null);
        }
      } else {
        const { category, error } = await insertCategory(supabase, categoryName);
        if (error) {
          console.error('Erro ao inserir categoria:', error.message);
          setError('Falha ao inserir a categoria.');
        } else if (category) {
          onCategoryAdded();
          setSuccess(`Categoria "${category.category_name}" inserida com sucesso.`);
        }
      }
      setCategoryName('');
    } catch (error: any) {
      console.error('Erro ao processar categoria:', error.message);
      setError('Erro ao processar categoria. Verifique o console para mais detalhes.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <h2>{editingCategory ? 'Atualizar' : 'Adicionar'} Categoria</h2>
      <form onSubmit={handleSubmit} className='modal_form'>
        <input
          type="text"
          name="category_name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <div className='btn_container_modal'>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">{editingCategory ? 'Atualizar' : 'Adicionar'}</button>
        </div>

      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </>
  );
};

export default CategoryForm;