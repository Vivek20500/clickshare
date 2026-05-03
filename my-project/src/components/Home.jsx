import React, { useState, useEffect } from 'react'

function Home() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [images, setImages] = useState([])

  useEffect(() => {
    fetch(`http://localhost:5000/images`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched images:", data);
        setImages(data);
      });
  }, []);

  return (
    <div className="flex flex-col bg-gray-100 p-4 sm:p-6 md:p-8 min-h-screen">

      {/* HEADER */}
      <div className="w-full mb-8">
        <h1 className="text-3xl font-bold mb-2">ClickShare</h1>
        <p className="text-gray-600 mb-4">Capture and share your moments.</p>

        <a
          href="/camera"
          className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📸 Open Camera
        </a>
      </div>

      {/* GALLERY */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Images</h2>

        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <img
              key={img._id}
              src={img.imageUrl}
              onClick={() => setSelectedImage(img.imageUrl)}
              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition"
            />
          ))}
        </div>

        {images.length === 0 && (
          <p className="text-gray-500 text-center mt-10">No images yet</p>
        )}
      </div>

      {/* MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            className="max-w-[90%] max-h-[90%] rounded-lg"
          />

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 bg-white text-black w-10 h-10 rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export default Home