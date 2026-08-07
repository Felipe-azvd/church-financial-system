'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Select, type SelectOption } from '@/components/ui/Select'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { criarEntradaChangelog, excluirEntradaChangelog } from '@/app/actions/changelogInterno'

type Entrada = {
  id: string
  categoria: string
  titulo: string
  descricao: string
  criado_em: string
}

const CATEGORIA_OPTIONS: SelectOption[] = [
  { value: 'Feature', label: 'Feature' },
  { value: 'Correção', label: 'Correção' },
  { value: 'Segurança', label: 'Segurança' },
  { value: 'Infraestrutura', label: 'Infraestrutura' },
  { value: 'Design', label: 'Design' },
]

const CATEGORIA_CLASS: Record<string, string> = {
  'Feature': 'border-[var(--color-primary)]/30 text-[var(--color-primary)] bg-[var(--color-primary)]/10',
  'Correção': 'border-[var(--color-success)]/30 text-[var(--color-success)] bg-[var(--color-success)]/10',
  'Segurança': 'border-[var(--color-error)]/30 text-[var(--color-error)] bg-[var(--color-error)]/10',
  'Infraestrutura': 'border-[var(--color-info)]/30 text-[var(--color-info)] bg-[var(--color-info)]/10',
  'Design': 'border-[var(--color-accent)]/30 text-[var(--color-accent)] bg-[var(--color-accent)]/10',
}

export default function ChangelogInternoManager({ entradas }: { entradas: Entrada[] }) {
  const [categoria, setCategoria] = useState('Feature')
  const [loading, setLoading] = useState(false)
  const { confirm, ConfirmDialogElement } = useConfirm()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    const formData = new FormData(form)
    const res = await criarEntradaChangelog(formData)
    if (res.success) {
      toast('Entrada adicionada ao changelog interno.', 'success')
      form.reset()
      setCategoria('Feature')
    } else {
      toast(res.error || 'Erro ao adicionar entrada.', 'error')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, titulo: string) => {
    const ok = await confirm({
      title: 'Excluir entrada',
      description: `Remover "${titulo}" do changelog interno?`,
      tone: 'danger',
      confirmLabel: 'Excluir',
    })
    if (!ok) return
    const res = await excluirEntradaChangelog(id)
    toast(res.success ? 'Entrada removida.' : (res.error || 'Erro ao remover.'), res.success ? 'success' : 'error')
  }

  return (
    <div className="flex flex-col gap-6">
      {ConfirmDialogElement}

      <form
        onSubmit={handleSubmit}
        className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] p-6 shadow-[var(--shadow-sm)] flex flex-col gap-4"
      >
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">Nova entrada</h2>
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
          <Select value={categoria} onChange={setCategoria} options={CATEGORIA_OPTIONS} name="categoria" />
          <input name="titulo" required placeholder="Título curto" className="input-field w-full" />
        </div>
        <textarea
          name="descricao"
          required
          rows={2}
          placeholder="Descrição — pode ser técnica, sem filtro pro cliente final."
          className="input-field w-full resize-none"
        />
        <button type="submit" disabled={loading} className="btn-primary self-end flex items-center gap-2 px-5 py-2 rounded-[var(--radius-field)] text-sm font-semibold disabled:opacity-50">
          <Plus className="w-4 h-4" />
          {loading ? 'Salvando...' : 'Adicionar entrada'}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {entradas.length === 0 && (
          <div className="text-center text-sm text-[var(--text-muted)] py-12 rounded-[var(--radius-box)] border border-dashed border-[var(--color-base-300)]">
            Nenhuma entrada registrada ainda.
          </div>
        )}

        {entradas.map((entrada) => (
          <div
            key={entrada.id}
            className="rounded-[var(--radius-box)] border border-[var(--color-base-300)] bg-[var(--color-base-100)] p-5 shadow-[var(--shadow-sm)] flex items-start justify-between gap-4"
          >
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex-shrink-0 ${CATEGORIA_CLASS[entrada.categoria] || CATEGORIA_CLASS['Feature']}`}>
                  {entrada.categoria}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(entrada.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{entrada.titulo}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{entrada.descricao}</p>
            </div>
            <button
              onClick={() => handleDelete(entrada.id, entrada.titulo)}
              className="p-2 rounded-[var(--radius-field)] text-[var(--text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors flex-shrink-0"
              title="Excluir entrada"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
