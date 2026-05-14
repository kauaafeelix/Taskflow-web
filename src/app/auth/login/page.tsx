'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'


const loginSchema = z.object ({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'The password must be at least 6 characters long.')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const setAuth = useAuthStore((state) => state.setAuth)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginForm) => {
        try {
            const { token } = await authService.login(data.email, data.password)
            localStorage.setItem('token', token)
            document.cookie = `token=${token}; path=/`
            const user = await authService.getMe()
            setAuth(user, token)
            router.push('/dashboard')
        } catch {
            setError('root', { message: 'E-mail ou senha inválidos' })
        }
}

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
                    <p className="text-[#888] mt-1">Entre na sua conta</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm text-[#888] block mb-1">E-mail</label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="seu@email.com"
                                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
                            />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm text-[#888] block mb-1">Senha</label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
                            />
                        {errors.password && (
                            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {errors.root && (
                        <p className="text-red-400 text-sm">{errors.root.message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-medium rounded-lg py-2.5 hover:bg-[#e0e0e0] transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-[#888] text-sm text-center mt-6">
                    Não tem conta?{' '}
                    <Link href="/auth/register" className="text-white hover:underline">
                        Criar conta
                    </Link>
                </p>
            </div>
        </div>
  )
}