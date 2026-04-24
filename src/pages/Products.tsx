// src/pages/Products.tsx
import { useEffect, useState } from "react";
import { getAllProducts } from "../api/products";
import ShopCard, { type Product } from "../components/product/ShopCard";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const CATEGORIES = [
    { name: "Motor", keywords: ["motor", "pistón"] },
    { name: "Suspensión", keywords: ["suspensión", "amortiguador"] },
    { name: "Frenos", keywords: ["freno", "pastilla"] },
    { name: "Eléctrico", keywords: ["eléctrico", "batería"] },
    { name: "Accesorios", keywords: ["accesorio"] },
];

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

    useEffect(() => {
        // cargar productos al montar
        (async () => {
            try {
                const data = await getAllProducts();
                setProducts(data);
                setFilteredProducts(data);
            } catch (err: any) {
                setError(err.message || "Error al cargar productos");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Aplicar filtros cuando cambien los valores
    useEffect(() => {
        let filtered = [...products];

        // Filtro por categoría
        if (selectedCategory) {
            const category = CATEGORIES.find(c => c.name === selectedCategory);
            if (category) {
                filtered = filtered.filter((p) => {
                    const searchText = `${p.name} ${p.description || ""}`.toLowerCase();
                    return category.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
                });
            }
        }

        // Filtro por búsqueda
        if (searchQuery.trim()) {
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtro por rango de precio
        filtered = filtered.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );

        // Ordenar
        if (sortBy === "name") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("");
        setPriceRange([0, 10000]);
        setSortBy("name");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <h1 className="text-2xl font-bold mb-6">Productos</h1>

                    {loading ? (
                        <div className="text-center py-8">Cargando productos...</div>
                    ) : error ? (
                        <div className="text-center text-red-600 py-8">{error}</div>
                    ) : (
                        <>
                            {/* Filtros */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {/* Búsqueda */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Buscar
                                        </label>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Buscar por nombre o descripción..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--Primary_5)]"
                                        />
                                    </div>

                                    {/* Categoría */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Categoría
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--Primary_5)]"
                                        >
                                            <option value="">Todas</option>
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Ordenar */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ordenar por
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--Primary_5)]"
                                        >
                                            <option value="name">Nombre</option>
                                            <option value="price-asc">Precio: Menor a Mayor</option>
                                            <option value="price-desc">Precio: Mayor a Menor</option>
                                        </select>
                                    </div>

                                    {/* Rango de precio */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Precio máximo: S/ {priceRange[1]}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000"
                                            step="50"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Botón resetear filtros */}
                                <div className="mt-4 flex justify-between items-center">
                                    <p className="text-sm text-gray-600">
                                        Mostrando {filteredProducts.length} de {products.length} productos
                                    </p>
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-sm text-[var(--Primary_5)] hover:underline"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>

                            {/* Grid de productos */}
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No se encontraron productos con los filtros aplicados</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredProducts.map((p) => <ShopCard key={p.id} product={p} />)}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
