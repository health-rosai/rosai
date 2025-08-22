'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/login')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">労災二次健診進捗管理システム</h1>
        <p className="text-gray-600">ログインページへリダイレクトしています...</p>
      </div>
    </div>
  )
}
