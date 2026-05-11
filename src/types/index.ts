export interface User{
    id: string
    name: string
    email: string
    avatarUrl: string | null
    createdAt: string
}

export interface ProjectMember{
    email: string
    name: string
    role: 'OWNER' | 'MEMBER' | 'VIEWER'
}

export interface Comment{
    id: string
    content: string
    authorEmail: string
    authorName: string
    createdAt: string
}

export interface Task{
    id: string
    projectId: string
    title: string 
    description: string | null
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    deadline: string | null
    assigneeEmail: string | null
    comments: Comment[]
    createdAt: string
}

export interface Project{
    id: string
    name: string
    status: 'ACTIVE' | 'ARCHIVED'
    members: ProjectMember[]
    createdAt: string
}

export interface ProjectDetail extends Project{
    tasks: Task[]
}

export interface PageResponse<T>{
    content: T[]
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    last: boolean
}

