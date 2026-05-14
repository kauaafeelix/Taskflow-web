'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { projectService } from '@/services/projectService'
import { Project } from '@/types'

const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
})

type CreateProjectForm = z.infer<typeof createProjectSchema>

interface CreateProjectModalProps {
  onClose: () => void
  onCreated: (project: Project) => void
}

export default function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  })

  const onSubmit = async (data: CreateProjectForm) => {
    try {
      const project = await projectService.create(data.name, data.description ?? '')
      onCreated(project)
      onClose()
    } catch {
      console.error('Failed to create project')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Novo projeto</h2>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-white transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-[#888] block mb-1">Nome</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Nome do projeto"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-[#888] block mb-1">
              Descrição <span className="text-[#555]">(opcional)</span>
            </label>
            <textarea
              {...register('description')}
              placeholder="Descrição do projeto"
              rows={3}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition resize-none"
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
              {isSubmitting ? 'Criando...' : 'Criar projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}