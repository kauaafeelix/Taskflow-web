'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { projectService } from '@/services/projectService'
import { taskService } from '@/services/taskService'
import { ProjectDetail, Task } from '@/types'
import CreateTaskModal from '@/components/CreateTaskModal'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

const STATUS_COLUMNS = [
  { key: 'TODO', label: 'A fazer' },
  { key: 'IN_PROGRESS', label: 'Em andamento' },
  { key: 'IN_REVIEW', label: 'Em revisão' },
  { key: 'DONE', label: 'Concluído' },
  { key: 'CANCELLED', label: 'Cancelado' },
]

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

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMembersPanel, setShowMembersPanel] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [memberError, setMemberError] = useState('')
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, tasksData] = await Promise.all([
          projectService.getById(id),
          taskService.listByProject(id),
        ])
        setProject(projectData)
        setTasks(tasksData.content)
      } catch {
        showToast('Erro ao carregar projeto', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [...prev, task])
    showToast('Task criada com sucesso!', 'success')
  }

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return
    setAddingMember(true)
    setMemberError('')
    try {
      const updated = await projectService.addMember(id, memberEmail, 'MEMBER')
      setProject(updated as unknown as ProjectDetail)
      setMemberEmail('')
      showToast('Membro adicionado com sucesso!', 'success')
    } catch {
      setMemberError('Erro ao adicionar membro. Verifique o email.')
      showToast('Erro ao adicionar membro', 'error')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (email: string) => {
    try {
      await projectService.removeMember(id, email)
      setProject((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.email !== email) }
          : prev
      )
      showToast('Membro removido com sucesso!', 'success')
    } catch {
      showToast('Erro ao remover membro', 'error')
    }
  }

  const handleArchive = async () => {
  try {
    const updated = await projectService.archive(id)
    setProject((prev) => prev ? { ...prev, status: updated.status } : prev)
    showToast('Projeto arquivado com sucesso!', 'success')
  } catch {
    showToast('Erro ao arquivar projeto', 'error')
  }
}
const handleUnarchive = async () => {
  try {
    const updated = await projectService.unarchive(id)
    setProject((prev) => prev ? { ...prev, status: updated.status } : prev)
    showToast('Projeto reativado com sucesso!', 'success')
  } catch {
    showToast('Erro ao reativar projeto', 'error')
  }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#888]">Carregando projeto...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#888]">Projeto não encontrado</p>
      </div>
    )
  }

  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => task.status === status)

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {showTaskModal && (
        <CreateTaskModal
          projectId={id}
          onClose={() => setShowTaskModal(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#888] hover:text-white text-sm mb-2 flex items-center gap-1 transition"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              project.status === 'ACTIVE'
                ? 'bg-green-500/10 text-green-400'
                : 'bg-[#2a2a2a] text-[#888]'
            }`}>
              {project.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
            </span>
            <span className="text-[#555] text-sm">{project.members.length} membro(s)</span>
          </div>
        </div>
        <div className="flex gap-3">
            <button
              onClick={() => setShowMembersPanel(!showMembersPanel)}
              className="border border-[#2a2a2a] text-[#888] hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Membros
            </button>
            {project.status === 'ACTIVE' ? (
              <button
                onClick={handleArchive}
                className="border border-[#2a2a2a] text-[#888] hover:text-red-400 text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Arquivar
              </button>
            ) : (
              <button
                onClick={handleUnarchive}
                className="border border-[#2a2a2a] text-[#888] hover:text-green-400 text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Reativar
              </button>
            )}
            <button
              onClick={() => setShowTaskModal(true)}
              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition"
            >
              Nova task
            </button>
        </div>
      </div>

      {/* Members Panel */}
      {showMembersPanel && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">Membros</h2>
          <div className="space-y-3 mb-4">
            {project.members.map((member) => (
              <div key={member.email} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-white font-medium">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm">{member.name}</p>
                    <p className="text-[#555] text-xs">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#555]">{member.role}</span>
                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveMember(member.email)}
                      className="text-[#555] hover:text-red-400 text-xs transition"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              placeholder="email@exemplo.com"
              className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#555] transition"
            />
            <button
              onClick={handleAddMember}
              disabled={addingMember || !memberEmail.trim()}
              className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition disabled:opacity-50"
            >
              {addingMember ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
          {memberError && (
            <p className="text-red-400 text-xs mt-2">{memberError}</p>
          )}
        </div>
      )}

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.key)
          return (
            <div key={column.key} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#888] text-sm font-medium">{column.label}</span>
                <span className="text-[#555] text-xs bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => router.push(`/dashboard/projects/${id}/tasks/${task.id}`)}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#3a3a3a] transition"
                  >
                    <p className="text-white text-sm font-medium mb-2">{task.title}</p>
                    {task.description && (
                      <p className="text-[#666] text-xs mb-3 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      {task.deadline && (
                        <span className="text-[#555] text-xs">{task.deadline}</span>
                      )}
                    </div>
                    {task.assigneeEmail && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs text-white">
                          {task.assigneeEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[#555] text-xs truncate">{task.assigneeEmail}</span>
                      </div>
                    )}
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="border border-dashed border-[#2a2a2a] rounded-xl p-4 flex items-center justify-center">
                    <p className="text-[#555] text-xs">Sem tasks</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}