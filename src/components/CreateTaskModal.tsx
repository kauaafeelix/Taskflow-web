'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { taskService } from '@/services/taskService'
import { Task } from '@/types'

const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  deadline: z.string().optional(),
})

type CreateTaskForm = z.infer<typeof createTaskSchema>

interface CreateTaskModalProps {
  projectId: string
  onClose: () => void
  onCreated: (task: Task) => void
}

export default function CreateTaskModal({ projectId, onClose, onCreated }: CreateTaskModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  })

  const onSubmit = async (data: CreateTaskForm) => {
    try {
      const task = await taskService.create(projectId, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        deadline: data.deadline || undefined,
      })
      onCreated(task)
      onClose()
    } catch {
      console.error('Failed to create task')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Nova task</h2>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-white transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-[#888] block mb-1">Título</label>
            <input
              {...register('title')}
              type="text"
              placeholder="Título da task"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-[#888] block mb-1">
              Descrição <span className="text-[#555]">(opcional)</span>
            </label>
            <textarea
              {...register('description')}
              placeholder="Descrição da task"
              rows={3}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-[#888] block mb-1">Prioridade</label>
            <select
              {...register('priority')}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#555] transition"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-[#888] block mb-1">
              Prazo <span className="text-[#555]">(opcional)</span>
            </label>
            <input
              {...register('deadline')}
              type="date"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#555] transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#2a2a2a] text-[#888] hover:text-white rounded-lg py-2.5 text-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-white text-black font-medium rounded-lg py-2.5 text-sm hover:bg-[#e0e0e0] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Criar task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}