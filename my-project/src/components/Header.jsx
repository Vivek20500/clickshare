import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">ClickShare</h1>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="text-sm sm:text-base hover:text-blue-200 transition duration-300"
            >
              Home
            </Link>
            <Link
              to="/camera"
              className="text-sm sm:text-base hover:text-blue-200 transition duration-300"
            >
              Camera
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
