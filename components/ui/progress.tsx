import React from 'react'

interface ProgressProps {
  value: number
}

export const Progress: React.FC<ProgressProps> = ({ value }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${value}%` }}></div>
    </div>
  )
}