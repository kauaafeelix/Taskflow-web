'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { taskService } from '@/services/taskService'
import { Task } from '@/types'
import { useAuthStore } from '@/store/authStore'

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'text-red-400 bg-red-500/10',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10',
  LOW: 'text-green-400 bg-green-500/10',
}

const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
}

const STATUS_LABELS: Record<string, string> = {
  TODO: 'A fazer',
  IN_PROGRESS: 'Em andamento',
  IN_REVIEW: 'Em revisão',
  DONE: 'Concluído',
  CANCELLED: 'Cancelado',
}

export default function TaskDetailPage() {
    const { id, taskId } = useParams<{ id: string; taskId: string }>()
    const router = useRouter()
    const { user } = useAuthStore()
    const [task, setTask] = useState<Task | null>(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const [assignEmail, setAssignEmail] = useState('')
    const [assigning, setAssigning] = useState(false)

const handleAssign = async () => {
  if (!assignEmail.trim()) return
  setAssigning(true)
  try {
    const updated = await taskService.assign(taskId, assignEmail)
    setTask(updated)
    setAssignEmail('')
  } catch {
    console.error('Failed to assign task')
  } finally {
    setAssigning(false)
  }
}

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskService.getById(taskId)
        setTask(data)
      } catch {
        console.error('Failed to fetch task')
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setSubmittingComment(true)
    try {
      const updated = await taskService.addComment(taskId, comment)
      setTask(updated)
      setComment('')
    } catch {
      console.error('Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleRemoveComment = async (commentId: string) => {
    try {
      await taskService.removeComment(taskId, commentId)
      setTask((prev) =>
        prev
          ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }
          : prev
      )
    } catch {
      console.error('Failed to remove comment')
    }
  }

  const handleChangeStatus = async (status: string) => {
    try {
      const updated = await taskService.changeStatus(taskId, status)
      setTask(updated)
    } catch {
      console.error('Failed to change status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#888]">Carregando task...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#888]">Task não encontrada</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <button
        onClick={() => router.push(`/dashboard/projects/${id}`)}
        className="text-[#888] hover:text-white text-sm mb-6 flex items-center gap-1 transition"
      >
        ← Voltar
      </button>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
        <h1 className="text-xl font-bold text-white mb-4">{task.title}</h1>

        {task.description && (
          <p className="text-[#888] text-sm mb-6">{task.description}</p>
        )}

        {/* Properties */}
    <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[#555] text-xs mb-1">Status</p>
            <select
              value={task.status}
              onChange={(e) => handleChangeStatus(e.target.value)}
              className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#555] transition w-full"
            >
              <option value="TODO">A fazer</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="IN_REVIEW">Em revisão</option>
              <option value="DONE">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div>
            <p className="text-[#555] text-xs mb-1">Prioridade</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          <div>
            <p className="text-[#555] text-xs mb-1">Prazo</p>
            <p className="text-white text-sm">{task.deadline ?? '—'}</p>
          </div>

          <div>
                <p className="text-[#555] text-xs mb-1">Responsável</p>
                <p className="text-white text-sm mb-2">{task.assigneeEmail ?? '—'}</p>
                <div className="flex gap-2">
                    <input
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAssign()}
                    placeholder="email@exemplo.com"
                    className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-white placeholder-[#444] text-xs focus:outline-none focus:border-[#555] transition"
                    />
                    <button
                    onClick={handleAssign}
                    disabled={assigning || !assignEmail.trim()}
                    className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#e0e0e0] transition disabled:opacity-50"
                    >
                    {assigning ? '...' : 'Atribuir'}
                    </button>
                </div>
        </div>
    </div>
</div>

      {/* Comments */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">
          Comentários <span className="text-[#555] font-normal text-sm">({task.comments.length})</span>
        </h2>

        <div className="space-y-4 mb-6">
          {task.comments.length === 0 && (
            <p className="text-[#555] text-sm">Nenhum comentário ainda</p>
          )}
          {task.comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                {c.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{c.authorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#555] text-xs">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    {c.authorEmail === user?.email && (
                      <button
                        onClick={() => handleRemoveComment(c.id)}
                        className="text-[#555] hover:text-red-400 text-xs transition"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[#888] text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add comment */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Adicionar comentário..."
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#555] transition"
            />
            <button
              onClick={handleAddComment}
              disabled={submittingComment || !comment.trim()}
              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}