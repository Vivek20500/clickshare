import React from 'react'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">About ClickShare</h3>
            <p className="text-sm">Capture and share your moments with ease. Your personal photo gallery on the go.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/camera" className="hover:text-white transition">Camera</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <p className="text-sm">Email: info@clickshare.com</p>
            <p className="text-sm">© {currentYear} ClickShare. All rights reserved.</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-xs sm:text-sm">
          <p>&copy; {currentYear} ClickShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
