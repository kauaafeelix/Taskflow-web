'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore()
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    setError: setProfileError,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      avatarUrl: user?.avatarUrl ?? '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    setError: setPasswordError,
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const updated = await authService.updateProfile(data.name, data.avatarUrl ?? '')
      const token = localStorage.getItem('token') ?? ''
      setAuth(updated, token)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch {
      setProfileError('root', { message: 'Failed to update profile' })
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authService.changePassword(data.oldPassword, data.newPassword)
      setPasswordSuccess(true)
      resetPassword()
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch {
      setPasswordError('root', { message: 'Old password is incorrect' })
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-white mb-8">Perfil</h1>

      {/* Profile info */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xl text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-[#555] text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-[#888] block mb-1">Nome</label>
            <input
              {...registerProfile('name')}
              type="text"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
            />
            {profileErrors.name && (
              <p className="text-red-400 text-xs mt-1">{profileErrors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-[#888] block mb-1">
              Avatar URL <span className="text-[#555]">(opcional)</span>
            </label>
            <input
              {...registerProfile('avatarUrl')}
              type="text"
              placeholder="https://..."
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
            />
            {profileErrors.avatarUrl && (
              <p className="text-red-400 text-xs mt-1">{profileErrors.avatarUrl.message}</p>
            )}
          </div>

          {profileErrors.root && (
            <p className="text-red-400 text-sm">{profileErrors.root.message}</p>
          )}

          {profileSuccess && (
            <p className="text-green-400 text-sm">Perfil atualizado com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={isProfileSubmitting}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm hover:bg-[#e0e0e0] transition disabled:opacity-50"
          >
            {isProfileSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Alterar senha</h2>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-[#888] block mb-1">Senha atual</label>
            <input
              {...registerPassword('oldPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
            />
            {passwordErrors.oldPassword && (
              <p className="text-red-400 text-xs mt-1">{passwordErrors.oldPassword.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-[#888] block mb-1">Nova senha</label>
            <input
              {...registerPassword('newPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
            />
            {passwordErrors.newPassword && (
              <p className="text-red-400 text-xs mt-1">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-[#888] block mb-1">Confirmar nova senha</label>
            <input
              {...registerPassword('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          {passwordErrors.root && (
            <p className="text-red-400 text-sm">{passwordErrors.root.message}</p>
          )}

          {passwordSuccess && (
            <p className="text-green-400 text-sm">Senha alterada com sucesso!</p>
          )}

          <button
            type="submit"
            disabled={isPasswordSubmitting}
            className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm hover:bg-[#e0e0e0] transition disabled:opacity-50"
          >
            {isPasswordSubmitting ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}