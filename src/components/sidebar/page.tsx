import React from 'react';
import Link from 'next/link';
import styles from './style.module.scss';
import { logout } from '@/app/logout/actions';
import 'remixicon/fonts/remixicon.css';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    try {
      await logout();
      // Redirecionar para a página de login ou realizar outras ações após o logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (

    <div className={`${styles.sidebarContainer} ${isOpen ? '' : styles.active}`}>
      <ul>
        <li title='Categorias'>
          <a className={styles.sidebarItem} href="categoria">
            <span className={styles.icon}>
              <i className="ri-function-line"></i>
            </span>
            <span className={styles.title}>
              Categorias
            </span>
          </a>
        </li>
        <li title='Produtos'>
          <a className={styles.sidebarItem} href="produto">
            <span className={styles.icon}>
              <i className="ri-shopping-bag-4-line"></i>
            </span>
            <span className={styles.title}>
              Produtos
            </span>
          </a>
        </li>
        <li title='Configurações'>
          <a className={styles.sidebarItem} href="configuracoes">
            <span className={styles.icon}>
              <i className="ri-settings-2-line"></i>
            </span>
            <span className={styles.title}>
              Configurações
            </span>
          </a>
        </li>
        <li className={styles.logout} title='Sair'>
          <a href="/" onClick={handleLogout} className={styles.sidebarItem}>
            <span className={styles.icon}>
              <i className="ri-logout-box-r-line"></i>
            </span>
            <span className={styles.title}>
              Sair
            </span>
          </a>
        </li>

      </ul>

    </div>
  );
}


