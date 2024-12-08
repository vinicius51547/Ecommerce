// categoria/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ListCategories from './listCategoria/page';
import CategoryForm from './formCategoria/page';
import { createClient } from '../../../../utils/supabase/client';
import styles from './style.module.scss';
import { Sidebar } from '@/components/sidebar/page';
import Modal from '@/components/modal/page';

type Category = {
  id: number;
  category_name: string;
};

export default function PrivatePageCategory() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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

  const handleCategoryAdded = () => {
    console.log('Categoria adicionada.');
    setRefresh((prev) => !prev);
    setIsModalOpen(false);
  };

  const handleCategoryUpdated = () => {
    console.log('Categoria atualizada.');
    setRefresh((prev) => !prev);
    setIsModalOpen(false);
  };

  const handleOpenModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
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
              <h2 className="title_section">Categorias</h2>
              {/* Container da listagem */}
              <div className="container_list">

              <ListCategories onEdit={handleOpenModal} refresh={refresh} />
              </div>
              
              <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <CategoryForm
                  onCategoryAdded={handleCategoryAdded}
                  onCategoryUpdated={handleCategoryUpdated}
                  editingCategory={editingCategory}
                  setEditingCategory={setEditingCategory}
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
