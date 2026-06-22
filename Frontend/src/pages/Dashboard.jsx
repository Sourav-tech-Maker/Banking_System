import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import Loader from '../Components/Loader'
import { Wallet, ArrowLeftRight, Plus, IndianRupee, TrendingUp, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State for accounts data
  const [accounts, setAccounts] = useState([])
  const [balances, setBalances] = useState({}) // { accountId: balance }
  const [loading, setLoading] = useState(true)

  // If user is NOT logged in, redirect to login page
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Fetch accounts when page loads
  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  async function fetchAccounts() {
    setLoading(true)
    try {
      // Step 1: Get all accounts — calls GET /api/account/
      const response = await API.get('/account/')
      const accountsList = response.data.accounts
      setAccounts(accountsList)

      // Step 2: For each account, get its balance — calls GET /api/account/balance/:id
      const balanceMap = {}
      for (const account of accountsList) {
        try {
          const balRes = await API.get(`/account/balance/${account._id}`)
          balanceMap[account._id] = balRes.data.balance
        } catch {
          balanceMap[account._id] = 0
        }
      }
      setBalances(balanceMap)
    } catch (error) {
      toast.error('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  // Calculate total balance across all accounts
  const totalBalance = Object.values(balances).reduce((sum, bal) => sum + bal, 0)

  // Don't render anything if not logged in
  if (!user) return null

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome Header */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold mb-1 text-navy">
            Welcome back, <span className="text-gold-gradient">{user.username}</span> 👋
          </h1>
          <p className="text-text-secondary">Here's an overview of your banking activity</p>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {/* Total Balance Card */}
            <div className="bg-navy rounded-2xl p-8 mb-8 relative overflow-hidden animate-fade-in-up-delay-1">
              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-gold/5 rounded-full translate-y-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="text-gold" size={16} />
                  <p className="text-gold/70 text-sm font-medium">Total Balance</p>
                </div>
                <p className="text-4xl font-bold flex items-center gap-1 text-white mt-2">
                  <IndianRupee size={30} />
                  {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                  <p className="text-gold/60 text-sm">{accounts.length} account(s) active</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 animate-fade-in-up-delay-2">
              <Link
                to="/accounts"
                className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-5 hover:border-gold/30 hover:shadow-[0_4px_20px_rgba(212,175,55,0.08)] no-underline text-navy transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center group-hover:bg-success/15 transition-colors duration-300">
                  <Plus className="text-success" size={22} />
                </div>
                <div>
                  <p className="font-semibold text-navy">Manage Accounts</p>
                  <p className="text-text-secondary text-sm">Create or view your bank accounts</p>
                </div>
              </Link>

              <Link
                to="/transfer"
                className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-5 hover:border-gold/30 hover:shadow-[0_4px_20px_rgba(212,175,55,0.08)] no-underline text-navy transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center group-hover:bg-gold/15 transition-colors duration-300">
                  <ArrowLeftRight className="text-gold-dark" size={22} />
                </div>
                <div>
                  <p className="font-semibold text-navy">Transfer Funds</p>
                  <p className="text-text-secondary text-sm">Send money to another account</p>
                </div>
              </Link>
            </div>

            {/* Account Cards */}
            <div className="animate-fade-in-up-delay-3">
              <h2 className="text-xl font-bold mb-4 text-navy">Your Accounts</h2>
              {accounts.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-14 text-center">
                  <div className="w-16 h-16 bg-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="text-text-muted" size={32} />
                  </div>
                  <p className="text-text-secondary mb-4">You don't have any accounts yet</p>
                  <Link
                    to="/accounts"
                    className="bg-navy hover:bg-navy-light text-gold no-underline px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_2px_8px_rgba(11,31,58,0.2)] transition-all duration-300"
                  >
                    Create Your First Account
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.map((account) => (
                    <div key={account._id} className="bg-surface border border-border rounded-2xl p-6 hover:border-gold/30 hover:shadow-[0_4px_20px_rgba(212,175,55,0.08)] transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-navy/8 rounded-lg flex items-center justify-center">
                            <Wallet className="text-navy" size={18} />
                          </div>
                          <span className="text-sm text-text-secondary font-medium">Account</span>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          account.status === 'Active'
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}>
                          {account.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mb-3 font-mono bg-bg px-2.5 py-1.5 rounded-lg inline-block">
                        {account._id}
                      </p>
                      <p className="text-2xl font-bold flex items-center gap-1 text-navy mt-2">
                        <IndianRupee size={20} />
                        {(balances[account._id] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-1.5 mt-3 text-text-muted">
                        <Clock size={12} />
                        <span className="text-xs">Currency: {account.currency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
