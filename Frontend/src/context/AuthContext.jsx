import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [loading, setLoading] = useState(false)

  async function sendOtp(email, username) {
    setLoading(true)
    try {
      const response = await API.post('/auth/send-otp', { email, username })
      toast.success(response.data.message || 'OTP sent to your email!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(email, otp) {
    setLoading(true)
    try {
      const response = await API.post('/auth/verify-otp', { email, otp })
      toast.success(response.data.message || 'Email verified successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp(email) {
    setLoading(true)
    try {
      const response = await API.post('/auth/resend-otp', { email })
      toast.success(response.data.message || 'New OTP sent!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    setLoading(true)
    try {
      const response = await API.post('/auth/login', { email, password })
      const userData = response.data.user
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  async function register(username, email, password) {
    setLoading(true)
    try {
      const response = await API.post('/auth/register', { username, email, password })
      const userData = response.data.user
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    try {
      await API.post('/auth/logout')
    } catch (error) {

    }
    setUser(null)
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    sendOtp,
    verifyOtp,
    resendOtp,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
