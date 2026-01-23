'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { LogOut, Github, Chrome } from 'lucide-react'
import { div } from 'framer-motion/client'

export default function AuthButton() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogin = async (provider: 'github' | 'google') => {
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        router.push('/')
    }

    if (loading) return <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-full" />

    if (user) {
        return (
            <div className="flex items-center gap-2">
                <div
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition"
                >
                    <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata.full_name}
                        className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs font-medium max-w-[100px] truncate">
                        {user.user_metadata.full_name?.split(' ')[0]}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10">
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] text-white font-bold">D</span>
                <span className="text-xs font-medium">Demo Mode</span>
            </div>
        </div>
    )
}
