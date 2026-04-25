import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import useReveal from "../hooks/useReveal"

export function About() {
    // Inicializar observer para animaciones de scroll
    useReveal();
    
    return (
        <>
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-10">
                    {/* Título principal */}
                    <div data-reveal className="opacity-0 transform translate-y-6 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Sobre Nosotros</h1>
                        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
                            Conoce más sobre Hurios Rally, tu tienda de confianza para repuestos y accesorios de motocicletas
                        </p>
                    </div>
                    
                    {/* Hero Image */}
                    <div data-reveal className="w-full opacity-0 transform translate-y-6 mb-12">
                        <img 
                            src="./assets/imgs/banner3.jpg" 
                            alt="Hurios Rally - Repuestos de motocicletas" 
                            className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg" 
                        />
                    </div>
                    
                    {/* Introducción */}
                    <div data-reveal className="opacity-0 transform translate-y-6 mb-16">
                        <div className="text-center max-w-4xl mx-auto">
                            <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                En <strong>Hurios Rally</strong> nos especializamos en ofrecer repuestos y accesorios de alta calidad 
                                para motocicletas de todas las marcas. Con años de experiencia en el sector, nos hemos consolidado 
                                como la tienda de confianza para motociclistas que buscan calidad y garantía.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Nuestro compromiso es brindar productos originales y de primera calidad, acompañados de un 
                                servicio al cliente excepcional que garantiza la satisfacción de nuestros usuarios.
                            </p>
                        </div>
                    </div>

                    {/* Secciones con contenido */}
                    <div className="w-full space-y-16 md:space-y-20">
                        {/* Nuestra Misión - imagen izquierda, texto derecha */}
                        <section data-reveal className="opacity-0 transform translate-y-6">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                <div className="w-full md:w-1/2 flex-shrink-0">
                                    <img 
                                        src="./assets/imgs/banner3.jpg" 
                                        alt="Nuestra misión en Hurios Rally"
                                        className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-lg shadow-lg"
                                    />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Nuestra Misión</h2>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        Proveer a los motociclistas repuestos y accesorios de la más alta calidad, 
                                        garantizando seguridad, rendimiento y durabilidad en cada uno de nuestros productos.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        Nos enfocamos en mantener un inventario completo de las mejores marcas del mercado, 
                                        asegurando que nuestros clientes encuentren exactamente lo que necesitan para 
                                        mantener sus motocicletas en óptimas condiciones.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Nuestra Experiencia - texto izquierda, imagen derecha */}
                        <section data-reveal className="opacity-0 transform translate-y-6">
                            <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
                                <div className="w-full md:w-1/2 flex-shrink-0">
                                    <img 
                                        src="./assets/imgs/banner3.jpg" 
                                        alt="Experiencia en repuestos de motocicletas"
                                        className="w-full h-64 md:h-72 lg:h-80 object-cover rounded-lg shadow-lg"
                                    />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Nuestra Experiencia</h2>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        Con más de una década en el mercado de repuestos para motocicletas, hemos construido 
                                        una sólida reputación basada en la confianza, calidad y servicio excepcional.
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">
                                        Nuestro equipo de expertos conoce a fondo cada producto que ofrecemos, 
                                        lo que nos permite brindar asesoría especializada y garantizar que cada 
                                        cliente obtenga el repuesto correcto para su motocicleta.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Compromiso con la Calidad */}
                        <section data-reveal className="opacity-0 transform translate-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Nuestro Compromiso</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
                                        <p className="text-gray-600">Todos nuestros productos pasan rigurosos controles de calidad</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
                                        <p className="text-gray-600">Envíos rápidos y seguros a todo el país</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Soporte Técnico</h3>
                                        <p className="text-gray-600">Asesoría especializada antes y después de la compra</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
        </>
    )
}