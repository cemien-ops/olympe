import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import Particles from "./components/Particles";
import IntroAnimation from "./components/IntroAnimation";
import CursorTrail from "./components/CursorTrail";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Members from "./pages/Members";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Messages from "./pages/Messages";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ flex: 1 }}
      >
        <Routes location={location}>
          <Route path="/"         element={<Home />} />
          <Route path="/shop"     element={<Shop />} />
          <Route path="/members"  element={<Members />} />
          <Route path="/auth"     element={<Auth />} />
          <Route path="/admin"    element={<Admin />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    localStorage.setItem("mh_faction", "olympe");
    document.documentElement.setAttribute("data-faction", "olympe");
    document.body.setAttribute("data-faction", "olympe");
  }, []);

  return (
    <>
      <AnimatePresence>
        {!introDone && (
          <IntroAnimation key="intro" onComplete={() => setIntroDone(true)} />
        )}
      </AnimatePresence>

      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <CursorTrail />
            <Particles />
            <Navbar />
            <Cart />
            <AnimatedRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
