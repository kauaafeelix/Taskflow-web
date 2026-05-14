'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { projectService } from '@/services/projectService'
import { Project } from '@/types'
import CreateProjectModal from '@/components/CreateProjectModal'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.list()
        setProjects(data.content)
      } catch (error) {
        console.error('Failed to fetch projects', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#888]">Carregando projetos...</p>
      </div>
    )
  }

  return (
    <div>
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projetos</h1>
          <p className="text-[#888] text-sm mt-1">{projects.length} projeto(s) encontrado(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#e0e0e0] transition"
        >
          Novo projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#2a2a2a] rounded-2xl">
          <p className="text-[#888]">Nenhum projeto encontrado</p>
          <p className="text-[#555] text-sm mt-1">Crie seu primeiro projeto para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 cursor-pointer hover:border-[#3a3a3a] transition"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-white font-medium">{project.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  project.status === 'ACTIVE'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-[#2a2a2a] text-[#888]'
                }`}>
                  {project.status === 'ACTIVE' ? 'Ativo' : 'Arquivado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member) => (
                    <div
                      key={member.email}
                      title={member.name}
                      className="w-7 h-7 rounded-full bg-[#2a2a2a] border-2 border-[#1a1a1a] flex items-center justify-center text-xs text-white font-medium"
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-[#2a2a2a] border-2 border-[#1a1a1a] flex items-center justify-center text-xs text-[#888]">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <p className="text-[#555] text-xs">
                  {project.members.length} membro(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}