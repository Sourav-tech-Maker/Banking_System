import React from 'react'

const Loader = () => {
  return (
    
    <div className="flex flex-col items-center justify-center min-h-[50vh]">

     
      <div className="w-12 h-12 border-4 border-border border-t-gold rounded-full animate-spin"></div>

      <p className="mt-4 text-text-secondary text-sm">Loading...</p>
    </div>
  )
}

export default Loader
