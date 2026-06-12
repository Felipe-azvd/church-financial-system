import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Efeito de luz de fundo opcional */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-color)] opacity-5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="z-10 text-center max-w-lg w-full flex flex-col items-center">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 logo-glow">ChurchFep</h1>
          <p className="text-lg text-[var(--text-muted)]">
            Bem-vindo ao sistema de gestão financeira da sua igreja.
          </p>
        </div>
        
        <Link 
          href="/login" 
          className="btn btn-primary btn-glow inline-flex items-center justify-center gap-2 px-8 py-4 text-lg rounded-xl w-full sm:w-auto"
        >
          Fazer Login <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}