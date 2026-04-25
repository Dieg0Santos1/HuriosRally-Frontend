
import React from "react";

/*
 Hero.tsx
 - Hero con imágenes en capas que hacen crossfade por CSS.
 - El texto está en un overlay (position: absolute) para quedarse fijo encima.
 - Reemplaza las rutas en `slides` por tus imágenes en public/assets/imgs/.
*/

const slides = [
  "/assets/imgs/banner1.jpg",
  "/assets/imgs/banner2.jpg",
  "/assets/imgs/banner3.jpg",
];

const Hero: React.FC = () => {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Contenedor de slides: ponemos cada img como fondo en una capa */}
      <div className="absolute inset-0">
        {slides.map((src, idx) => (
          // cada capa tiene la animación fade; CSS en index.css controla delay/tiempo
          <div
            key={idx}
            className={`hero-slide hero-slide-${idx}`}
            style={{
              backgroundImage: `url(${src})`,
            }}
            aria-hidden
          />
        ))}
      </div>
      <div>
        {/* Capa oscura encima de las imágenes para mejorar contraste */}
        <div className="absolute inset-0 bg-black/40 z-5" aria-hidden></div>
      </div>
      {/* Overlay fijo encima de las imágenes */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4">
        <h1 className="text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-extrabold text-white drop-shadow-lg leading-tight">HURIOS RALLY</h1>
        <p className="mt-4 text-white/90 max-w-2xl md:text-xl lg:text-2xl xl:text-3xl">Bienvenido a nuestra tienda online — repuestos y accesorios con garantía.</p>

      </div>
    </section>
  );
};

export default Hero;
