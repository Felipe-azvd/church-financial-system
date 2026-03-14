'use client'

import { Menu, User } from 'lucide-react'

export default function Header({ userName }: { userName: string }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn">
          <Menu size={24} />
        </button>
        <h2 className="page-title">Sistema Financeiro</h2>
      </div>

      <div className="header-right">

        
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <span className="user-name">{userName}</span>
        </div>
      </div>

      <style jsx>{`
        .header {
          height: 72px;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--spacing-xl);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .page-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }



        .user-profile {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .user-profile:hover {
          border-color: var(--text-muted);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          padding-right: var(--spacing-xs);
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block;
          }
          .page-title {
            display: none;
          }
          .user-name {
            display: none;
          }
        }
      `}</style>
    </header>
  )
}
