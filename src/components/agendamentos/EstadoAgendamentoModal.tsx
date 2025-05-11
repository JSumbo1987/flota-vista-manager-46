import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

interface Agendamento {
  id: string
  viaturaMatricula: string
  tiposervico: string
  status: string
}

interface EstadoServicoModalProps {
  open: boolean
  onClose: () => void
  agendamento: Agendamento | null
  onSalvar?: () => void
}

const ESTADOS = [
    { key: "agendado", label: "Agendado" },
    { key: "em_atendimento", label: "Em Atendimento" },
    { key: "concluido", label: "Concluído" },
    { key: "cancelado", label: "Cancelado" }
  ]

export default function EstadoServicoModal({
  open,
  onClose,
  agendamento,
  onSalvar
}: EstadoServicoModalProps) {
  const [estadoSelecionado, setEstadoSelecionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (agendamento) {
      setEstadoSelecionado(agendamento.status)
    }
  }, [agendamento])

  const handleSalvar = async () => {
    if (!agendamento || !estadoSelecionado) return

    setLoading(true)
    const { error } = await supabase
      .from("tblagendamentoservico")
      .update({ status: estadoSelecionado })
      .eq("id", agendamento.id)

    setLoading(false)
    if (error) {
      alert("Erro ao atualizar estado: " + error.message)
    } else {
      onSalvar?.()
      onClose()
    }
  }

  if (!agendamento) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Estado do Agendamento</DialogTitle>
          <DialogDescription>Escolha o novo estado para o agendamento selecionado.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p><strong>Viatura:</strong> {agendamento.tblviaturas?.viaturamarca} {agendamento.tblviaturas?.viaturamodelo} - {agendamento.tblviaturas?.viaturamatricula}</p>
          <p><strong>Tipo de Serviço:</strong> {agendamento.tbltipoassistencia.nome}</p>
          <br/>
          <RadioGroup
            value={estadoSelecionado ?? ""}
            onValueChange={setEstadoSelecionado}
            className="space-y-2 mt-4"
          >
            {ESTADOS.map((estado) => (
              <div key={estado.key} className="flex items-center space-x-2">
                <RadioGroupItem value={estado.key} id={estado.key} />
                <Label htmlFor={estado.label}>{estado.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={loading || !estadoSelecionado}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

