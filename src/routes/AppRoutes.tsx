// src/routes/AppRoutes.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { VerifyEmail } from "../pages/VerifyEmail";
import { ResetPassword } from "../pages/ResetPassword";
import { NewPassword } from "../pages/NewPassword";
import Products from "../pages/Products";
import { About } from "../pages/About";
import { Cart } from "../pages/Cart";
import { Checkout } from "../pages/Checkout";
import { Payment } from "../pages/Payment";
import { CartProvider } from "../context/CartContext";
import CartSidebar from "../components/cart/CartSidebar";
import { UserProfile } from "../pages/UserProfile";
import { AdminProfile } from "../pages/AdminProfile";
import { Profile } from "../pages/Profile";
import { Inventory } from "../pages/Inventory";
import BoletasFacturas from "../pages/BoletasFacturas";
import Proveedores from "../pages/Proveedores";
import { Category } from "../pages/Category";
/*
  AppRoutes instrumentado:
   - muestra en pantalla (y en consola) la location actual
   - incluye ruta catch-all para ver quÃ© path estÃ¡n pidiendo exactamente
*/

function LocationDebugger() {
  const loc = useLocation();
  // imprime en consola cada vez que cambia la ubicación
  console.log("[Router] location changed:", loc);
  return (
    <div style={{ position: "fixed", right: 8, bottom: 8, zIndex: 9999 }}>
      <div style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 8px", borderRadius: 6, fontSize: 12 }}>
        <div><strong>path:</strong> {loc.pathname}</div>
        <div><strong>search:</strong> {loc.search}</div>
      </div>
    </div>
  );
}

const AppRoutes: React.FC = () => (
  <CartProvider>
    <Router>
      {/* componente que imprime la location en consola y la muestra en pantalla */}
      <LocationDebugger />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/products" element={<Products />} />
        <Route path="/category/:categoryId" element={<Category />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/inventario" element={<Inventory />} />
  <Route path="/boletas-facturas" element={<BoletasFacturas />} />
  <Route path="/proveedores" element={<Proveedores />} />

        {/* catch-all: muestra la location en la UI si no hubo match */}
        <Route
          path="*"
          element={
            <div style={{ padding: 24 }}>
              <h2>Ruta no encontrada</h2>
              <p>La ruta solicitada no coincide con ninguna ruta definida.</p>
              <p>Abre la consola (F12) y pega aquÃ­ lo que veas en el log <code>[Router] location changed</code>.</p>
            </div>
          }
        />
      </Routes>

      {/* CartSidebar global - se muestra en toda la aplicaciÃ³n */}
      <CartSidebar />
    </Router>
  </CartProvider>
);

export default AppRoutes;


