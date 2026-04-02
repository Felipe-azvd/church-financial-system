import { z } from "zod"

export const lancamentoSchema = z.object({
  descricao: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres"),
  valor: z.number().positive("O valor deve ser maior que zero"),
  data: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data inválida",
  }),
  tipo: z.enum(["ENTRADA", "SAIDA"], {
    error: "O tipo deve ser ENTRADA ou SAIDA"
  }),
  categoria_id: z.string().optional().nullable(),
  culto_id: z.string().optional().nullable(),
})

export type LancamentoInput = z.infer<typeof lancamentoSchema>
