// import React, { useState, useEffect } from 'react'

// function Home() {
//   const [selectedImage, setSelectedImage] = useState(null)
//   const [images, setImages] = useState([])

//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_API_URL}/images`)
//       .then(res => res.json())
//       .then(data => {
//         console.log("Fetched images:", data);
//         setImages(data);
//       });
//   }, []);

//   return (
//     <div className="flex flex-col bg-gray-100 p-4 sm:p-6 md:p-8 min-h-screen">

//       {/* HEADER */}
//       <div className="w-full mb-8">
//         <h1 className="text-3xl font-bold mb-2">ClickShare</h1>
//         <p className="text-gray-600 mb-4">Capture and share your moments.</p>

//         <a
//           href="/camera"
//           className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           📸 Open Camera
//         </a>
//       </div>

//       {/* GALLERY */}
//       <div>
//         <h2 className="text-xl font-bold mb-4">Recent Images</h2>

//         <div className="grid grid-cols-3 gap-2">
//           {images.map((img) => (
//             <img
//               key={img._id}
//               src={img.imageUrl}
//               onClick={() => setSelectedImage(img.imageUrl)}
//               className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition"
//             />
//           ))}
//         </div>

//         {images.length === 0 && (
//           <p className="text-gray-500 text-center mt-10">No images yet</p>
//         )}
//       </div>

//       {/* MODAL */}
//       {selectedImage && (
//         <div
//           className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
//           onClick={() => setSelectedImage(null)}
//         >
//           <img
//             src={selectedImage}
//             className="max-w-[90%] max-h-[90%] rounded-lg"
//           />

//           <button
//             onClick={() => setSelectedImage(null)}
//             className="absolute top-5 right-5 bg-white text-black w-10 h-10 rounded-full"
//           >
//             ✕
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Home
import React, { useState, useEffect } from "react";

function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/images`)
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Click<span className="text-blue-400">Share</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-400">
              Capture & share memories
            </p>
          </div>

          <a
            href="/camera"
            className="
            hidden sm:flex
            items-center gap-2
            px-4 py-2
            rounded-xl
            bg-blue-500
            hover:bg-blue-600
            transition
            font-medium
            shadow-lg shadow-blue-500/20
            "
          >
            📸 Camera
          </a>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-6 sm:p-10">

          {/* GLOW */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-8">
            
            {/* TEXT */}
            <div className="text-center sm:text-left">
              
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                Capture.
                <br />
                Share.
                <br />
                Relive.
              </h2>

              <p className="text-gray-300 mt-4 text-sm sm:text-lg max-w-xl mx-auto sm:mx-0">
                Instantly click photos and create a beautiful live gallery
                experience for your events and memories.
              </p>

              {/* BUTTONS */}
              <div className="mt-7 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                
                {/* MAIN BUTTON */}
                <a
                  href="/camera"
                  className="
                  group relative
                  flex items-center justify-center
                  px-6 py-4
                  rounded-2xl
                  bg-gradient-to-r from-blue-500 to-cyan-400
                  hover:from-blue-600 hover:to-cyan-500
                  text-white font-semibold text-base
                  transition-all duration-300
                  shadow-[0_0_25px_rgba(59,130,246,0.7)]
                  active:scale-95
                  overflow-hidden
                  "
                >
                  {/* SHINE EFFECT */}
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000"></span>

                  <span className="relative z-10 flex items-center gap-2">
                    📸 Start Capturing
                  </span>
                </a>

                {/* SECOND BUTTON */}
                <button
                  className="
                  px-6 py-4
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  hover:bg-white/10
                  active:scale-95
                  transition
                  "
                >
                  Explore Gallery
                </button>
              </div>
            </div>

            {/* MOBILE IMAGE PREVIEW */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:hidden">
                {images.slice(0, 3).map((img) => (
                  <img
                    key={img._id}
                    src={img.imageUrl}
                    className="
                    w-full h-28
                    object-cover
                    rounded-2xl
                    border border-white/10
                    "
                  />
                ))}
              </div>
            )}

            {/* DESKTOP PREVIEW */}
            {images.length > 0 && (
              <div className="hidden sm:grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((img) => (
                  <img
                    key={img._id}
                    src={img.imageUrl}
                    className="
                    w-full h-48
                    object-cover
                    rounded-2xl
                    border border-white/10
                    hover:scale-105
                    transition duration-300
                    "
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Recent Images
          </h2>

          <p className="text-gray-400 mt-1 text-sm">
            {images.length} photos uploaded
          </p>
        </div>

        {images.length === 0 ? (
          <div className="flex items-center justify-center h-52 rounded-3xl border border-dashed border-white/10 bg-white/5">
            <p className="text-gray-400">
              No images uploaded yet 📂
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE GRID */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              {images.map((img) => (
                <div
                  key={img._id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className="
                  relative overflow-hidden
                  rounded-2xl
                  active:scale-95
                  transition
                  "
                >
                  <img
                    src={img.imageUrl}
                    className="
                    w-full h-44
                    object-cover
                    "
                  />
                </div>
              ))}
            </div>

            {/* DESKTOP MASONRY */}
            <div className="hidden sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((img) => (
                <div
                  key={img._id}
                  className="
                  group relative
                  overflow-hidden
                  rounded-2xl
                  cursor-pointer
                  break-inside-avoid
                  "
                  onClick={() => setSelectedImage(img.imageUrl)}
                >
                  <img
                    src={img.imageUrl}
                    className="
                    w-full object-cover
                    rounded-2xl
                    transition duration-500
                    group-hover:scale-105
                    "
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300"></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FLOATING CAMERA BUTTON FOR MOBILE */}
      <a
        href="/camera"
        className="
        sm:hidden
        fixed bottom-6 right-5 z-50
        w-16 h-16
        rounded-full
        bg-gradient-to-r from-blue-500 to-cyan-400
        flex items-center justify-center
        text-2xl
        shadow-[0_0_30px_rgba(59,130,246,0.8)]
        active:scale-90
        transition
        "
      >
        📸
      </a>

      {/* MODAL */}
      {selectedImage && (
        <div
          className="
          fixed inset-0 z-50
          bg-black/95
          backdrop-blur-md
          flex items-center justify-center
          p-4
          "
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full flex justify-center">
            
            <img
              src={selectedImage}
              className="
              max-w-full
              max-h-[85vh]
              rounded-2xl
              "
            />

            <button
              onClick={() => setSelectedImage(null)}
              className="
              absolute top-3 right-3
              w-11 h-11
              rounded-full
              bg-black/50
              border border-white/20
              text-white text-lg
              "
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;