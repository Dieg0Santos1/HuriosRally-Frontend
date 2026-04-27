
import React, { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/layout/Hero";
import BrandsCarousel from "../components/product/BrandsCarousel";
import ShopCard, { type Product } from "../components/product/ShopCard";
import Footer from "../components/layout/Footer";
import useReveal from "../hooks/useReveal";
import { getAllProducts } from "../api/products";

const Home: React.FC = () => {
  useReveal();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar productos al montar el componente
    (async () => {
      try {
      const data = await getAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <Hero />

        {/* nuevos repuestos */}
        <section
          data-reveal
          className="max-w-7xl mx-auto px-4 py-10 opacity-0 transform translate-y-6"
        >
          <h2 className="text-2xl font-bold mb-4">Nuevos repuestos</h2>
          {loading ? (
            <div className="text-center py-8">Cargando productos...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <ShopCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* marcas (slider) */}
        <BrandsCarousel />

        {/* mÃ¡s vendidos */}
        <section
          data-reveal
          className="max-w-7xl mx-auto px-4 py-10 opacity-0 transform translate-y-6"
        >
          <h2 className="text-2xl font-bold mb-4">Los mÃ¡s vendidos</h2>
          {loading ? (
            <div className="text-center py-8">Cargando productos...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Mostramos los Ãºltimos 4 productos (diferentes a los de nuevos repuestos) */}
              {products.slice(-4).map((product) => (
                <ShopCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
