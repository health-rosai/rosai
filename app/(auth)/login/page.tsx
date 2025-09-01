'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription, PremiumCardContent } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { MotionWrapper } from '@/components/ui/motion'

export default function LoginPage() {
  const isDev = process.env.NODE_ENV === 'development'
  // クライアントサイドでは環境変数を直接チェックできないため、常にデモモードとして扱う
  const isDemoMode = true
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // デモモードの場合は/api/dev-loginを使用
      if (isDemoMode) {
        const response = await fetch('/api/dev-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('demo-user', JSON.stringify(data.user));
          }
          toast.success('ログインしました（デモモード）');
          router.push('/dashboard');
          return;
        } else {
          toast.error('ログインに失敗しました', {
            description: 'テストアカウントを使用してください'
          });
          return;
        }
      }

      // 本番モードの場合はSupabase認証を使用
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('ログインに失敗しました', {
          description: error.message,
        });
        return;
      }

      if (data?.user) {
        toast.success('ログインしました');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        toast.error('Googleログインに失敗しました', {
          description: error.message,
        })
      }
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-emerald-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <MotionWrapper variant="slideUp" className="space-y-6">
          {/* Main Login Card */}
          <PremiumCard variant="glass" size="lg" className="backdrop-blur-xl border-border/50">
            <PremiumCardHeader className="text-center space-y-4">
              {/* Logo/Icon */}
              <MotionWrapper variant="scale" delay={0.1}>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </MotionWrapper>
              
              <div className="space-y-2">
                <PremiumCardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-light to-accent-royal bg-clip-text text-transparent">
                  労災二次健診システム
                </PremiumCardTitle>
                <PremiumCardDescription className="text-foreground-secondary">
                  アカウント情報を入力してセキュアにログイン
                </PremiumCardDescription>
              </div>
            </PremiumCardHeader>

            <PremiumCardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <MotionWrapper variant="slideUp" delay={0.2}>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      メールアドレス
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={isLoading}
                        className={`pl-4 pr-4 h-12 text-base transition-all duration-200 border-2 ${
                          focusedField === 'email'
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                            : 'border-border hover:border-border-accent'
                        }`}
                      />
                      {focusedField === 'email' && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-transparent opacity-20 pointer-events-none" />
                      )}
                    </div>
                  </div>
                </MotionWrapper>

                {/* Password Field */}
                <MotionWrapper variant="slideUp" delay={0.3}>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      パスワード
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={isLoading}
                        className={`pl-4 pr-12 h-12 text-base transition-all duration-200 border-2 ${
                          focusedField === 'password'
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                            : 'border-border hover:border-border-accent'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {focusedField === 'password' && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-transparent opacity-20 pointer-events-none" />
                      )}
                    </div>
                  </div>
                </MotionWrapper>

                {/* Login Button */}
                <MotionWrapper variant="slideUp" delay={0.4}>
                  <PremiumButton
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full h-12 text-base font-semibold shadow-xl hover:shadow-2xl"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {!isLoading && <Shield className="h-5 w-5" />}
                    ログイン
                  </PremiumButton>
                </MotionWrapper>
              </form>

              {/* Divider */}
              <MotionWrapper variant="fade" delay={0.5}>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-4 text-foreground-secondary font-medium backdrop-blur-sm">または</span>
                  </div>
                </div>
              </MotionWrapper>

              {/* Google Login */}
              <MotionWrapper variant="slideUp" delay={0.6}>
                <PremiumButton
                  type="button"
                  variant="glass"
                  size="lg"
                  className="w-full h-12 text-base font-medium border-2 hover:border-primary/30"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {!isLoading && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 18 18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g fill="none" fillRule="evenodd">
                        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                      </g>
                    </svg>
                  )}
                  Googleでログイン
                </PremiumButton>
              </MotionWrapper>
            </PremiumCardContent>
          </PremiumCard>
      
          {/* Test Accounts for Demo Mode */}
          <div className="mt-4">
            <div className="backdrop-blur-md border-2 border-amber-200 bg-amber-50/90 rounded-lg p-4">
              <div className="mb-2">
                <h3 className="text-base font-semibold flex items-center gap-2 text-amber-800">
                  <Sparkles className="h-4 w-4" />
                  デモモード - テストアカウント
                </h3>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  {[
                    { role: '管理者', email: 'admin@test.com', password: 'admin123456' },
                    { role: 'マネージャー', email: 'manager@test.com', password: 'manager123456' },
                    { role: 'オペレーター', email: 'operator@test.com', password: 'operator123456' },
                    { role: '閲覧者', email: 'viewer@test.com', password: 'viewer123456' }
                  ].map((account, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-semibold text-amber-800">{account.role}:</p>
                      <p className="text-xs text-amber-700 font-mono break-all">{account.email}</p>
                      <p className="text-xs text-amber-600 font-mono">{account.password}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full py-2 px-4 border-2 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-lg transition-colors"
                  onClick={() => {
                    setEmail('admin@test.com')
                    setPassword('admin123456')
                  }}
                >
                  管理者アカウントで自動入力
                </button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </div>
  )
}