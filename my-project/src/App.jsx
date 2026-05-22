import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Camera from "./components/Camera";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/camera" element={<Camera />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
