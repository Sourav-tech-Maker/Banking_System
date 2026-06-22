import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Zap, BarChart3, ArrowRight, Sparkles } from 'lucide-react'

const Landing = () => {
  return (
    <div className="min-h-screen bg-bg">

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-navy/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
          {/* Small badge */}
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold-dark text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-gold/20 animate-fade-in-up">
            <Sparkles size={14} />
            Secure Digital Banking
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-navy animate-fade-in-up-delay-1">
            Your Money, Your Way
            <br />
            <span className="text-gold-gradient">Anytime, Anywhere</span>
          </h1>

          {/* Description */}
          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up-delay-2">
            Experience next-generation banking with instant transfers, real-time balance tracking, and bank-grade security — all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 animate-fade-in-up-delay-3">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-navy hover:bg-navy-light text-gold no-underline px-8 py-3.5 rounded-xl font-semibold text-base shadow-[0_4px_16px_rgba(11,31,58,0.25)] hover:shadow-[0_6px_24px_rgba(11,31,58,0.35)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Open Account
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="text-navy hover:text-navy-light no-underline border-2 border-navy/20 hover:border-navy/40 px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1 - Security */}
          <div className="bg-surface border border-border rounded-2xl p-7 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] hover:-translate-y-1 group animate-fade-in-up-delay-1">
            <div className="w-13 h-13 bg-navy/8 rounded-xl flex items-center justify-center mb-5 group-hover:bg-navy/12 transition-colors duration-300" style={{width: '52px', height: '52px'}}>
              <Shield className="text-navy" size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">Bank-Grade Security</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Your data is protected with JWT authentication, encrypted passwords, and secure session management.
            </p>
          </div>

          {/* Card 2 - Speed */}
          <div className="bg-surface border border-border rounded-2xl p-7 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] hover:-translate-y-1 group animate-fade-in-up-delay-2">
            <div className="w-13 h-13 bg-success/8 rounded-xl flex items-center justify-center mb-5 group-hover:bg-success/12 transition-colors duration-300" style={{width: '52px', height: '52px'}}>
              <Zap className="text-success" size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">Instant Transfers</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Send money between accounts instantly with idempotency protection — no duplicate transactions, ever.
            </p>
          </div>

          {/* Card 3 - Tracking */}
          <div className="bg-surface border border-border rounded-2xl p-7 hover:border-gold/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] hover:-translate-y-1 group animate-fade-in-up-delay-3">
            <div className="w-13 h-13 bg-gold/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-gold/15 transition-colors duration-300" style={{width: '52px', height: '52px'}}>
              <BarChart3 className="text-gold-dark" size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">Real-Time Tracking</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Monitor your account balances in real-time. Every credit and debit is tracked through our double-entry ledger.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-text-muted text-sm bg-surface">
        © 2026 NexBank. Built with ❤️ for secure digital banking.
      </footer>
    </div>
  )
}

export default Landing
