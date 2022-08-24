import React from 'react'

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-3">
      <div className='animate-spin rounded-full h-32 w-32 border-red-700 border-b-2'/>
    </div>
  )
}

export default Loader