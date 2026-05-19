'use client'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm">
        <p className="text-white text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-[#2a2a2a] text-[#888] hover:text-white rounded-lg py-2.5 text-sm transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg py-2.5 text-sm transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}