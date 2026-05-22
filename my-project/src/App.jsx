import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Camera from "./components/Camera";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import CreateEvent from "./components/CreateEvent";
import JoinEvent from "./components/JoinEvent";
import EventGallery from "./components/EventGallery";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {/* <Header /> */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/join-event" element={<JoinEvent />} />
            <Route path="/event/:eventId" element={<EventGallery />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
