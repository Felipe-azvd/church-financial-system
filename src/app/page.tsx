import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div style={{ marginTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
        <h1 className="text-2xl font-semibold mb-3">Church Financial System</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          Bem-vindo ao sistema de gestão financeira.
        </p>
        <Link href="/login" className="btn btn-primary">
          Fazer Login
        </Link>
      </div>
    </div>
  );
}
