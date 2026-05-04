import React from "react";

const slides = [
  "/assets/imgs/banner1.jpg",
  "/assets/imgs/banner2.jpg",
  "/assets/imgs/banner3.jpg",
];

const Hero: React.FC = () => {
  return (
    /* Reducimos la altura: h-[45vh] en móviles y h-[55vh] en pantallas medianas/grandes */
    <section className="relative w-full h-[45vh] md:h-[55vh] overflow-hidden">
      
      {/* Contenedor de slides */}
      <div className="absolute inset-0">
        {slides.map((src, idx) => (
          <div
            key={idx}
            className={`hero-slide hero-slide-${idx}`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
            aria-hidden
          />
        ))}
      </div>

      {/* Capa oscura (Overlay de contraste) */}
      <div className="absolute inset-0 bg-black/40 z-[5]" aria-hidden></div>

      {/* Contenido centrado con padding ajustado */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4 pt-4">
        {/* Bajamos un poco el tamaño de fuente para que no sature el espacio reducido */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl leading-tight tracking-tighter">
          HURIOS RALLY
        </h1>
        <p className="mt-2 text-white/90 max-w-xl text-base md:text-lg lg:text-xl drop-shadow-md">
          Bienvenido a nuestra tienda online — repuestos y accesorios con garantía.
        </p>
      </div>
    </section>
  );
};

export default Hero;