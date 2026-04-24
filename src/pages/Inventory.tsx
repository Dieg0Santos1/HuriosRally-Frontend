import React from "react";
import Navbar from "../components/layout/Navbar";
import { useState, useRef, useEffect } from "react";
import ProductCard from "../components/product/ProductCard";
import { useNavigate } from "react-router-dom";
import { searchProducts, addStockToProduct, createProduct, uploadImage, deleteProduct, updateProduct, type Product as ProductType } from "../api/products";

type Product = ProductType & {
    expectedArrival?: string | null;
};

export function Inventory() {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const [activeTab, setActiveTab] = useState("search");
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showAddStockFor, setShowAddStockFor] = useState<number | null>(null);
    const [addQuantity, setAddQuantity] = useState<number>(0);
    const [stockLoading, setStockLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Estado para confirmar eliminación
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Estado para editar producto
    const [showEditModal, setShowEditModal] = useState<number | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
    const editFileRef = useRef<HTMLInputElement | null>(null);

    // form for creating a new product
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newStock, setNewStock] = useState("");
    const [newCategory, setNewCategory] = useState("");
    // preview URL for uploaded image
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    // Cargar productos al montar el componente o cuando cambia la query
    useEffect(() => {
        loadProducts();
    }, []);

    // Buscar productos cuando cambia la query (con debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === "search") {
                loadProducts();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, activeTab]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await searchProducts(query);
            console.log('Productos cargados:', data);
            console.log('URLs de imágenes:', data.map(p => ({ id: p.id, name: p.name, imageUrl: p.imageUrl })));
            setProducts(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error al cargar productos");
            }
        } finally {
            setLoading(false);
        }
    };

    const filtered = products;
    
    // calendario: mes visible y fecha seleccionada
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(null); 
    const navigate = useNavigate();

    // utilidades para el calendario
    const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const daysInMonth = (d: Date) => endOfMonth(d).getDate();

    const productsByArrivalDate: Record<string, Product[]> = {};
    products.forEach(p => {
        if (p.expectedArrival) {
            const iso = new Date(p.expectedArrival).toISOString().slice(0, 10);
            if (!productsByArrivalDate[iso]) productsByArrivalDate[iso] = [];
            productsByArrivalDate[iso].push(p);
        }
    });

    const arrivalsForVisibleMonth = (() => {
        const y = visibleMonth.getFullYear();
        const m = visibleMonth.getMonth();
        const days: { date: string; products: Product[] }[] = [];
        const dim = daysInMonth(visibleMonth);
        for (let day = 1; day <= dim; day++) {
            const iso = new Date(y, m, day).toISOString().slice(0, 10);
            days.push({ date: iso, products: productsByArrivalDate[iso] || [] });
        }
        return days;
    })();

    const newestArrivals = [...products].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
    }).slice(0, 6);
    
    const goPrevMonth = () => {
        setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const goNextMonth = () => {
        setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const openAddStock = (id: number) => {
        setShowAddStockFor(id);
        setAddQuantity(0);
    };

    const confirmAddStock = async () => {
        if (showAddStockFor == null) return;
        const qty = Number(addQuantity || 0);
        if (Number.isNaN(qty) || qty <= 0) {
            setError("La cantidad debe ser mayor a 0");
            return;
        }

        try {
            setStockLoading(true);
            setError(null);
            const result = await addStockToProduct(showAddStockFor, qty);
            
            // Actualizar el producto en el estado local
            setProducts(prev => prev.map(p => 
                p.id === showAddStockFor 
                    ? { ...p, stock: result.newStock } 
                    : p
            ));
            
            setSuccessMessage(result.message);
            setShowAddStockFor(null);
            setAddQuantity(0);
            
            // Ocultar mensaje después de 3 segundos
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error al agregar stock");
            }
        } finally {
            setStockLoading(false);
        }
    };

    const handleFile = (f?: File) => {
        if (!f) return;
        // Guardar el archivo para subir después
        setSelectedFile(f);
        // Crear preview temporal para mostrar al usuario
        const url = URL.createObjectURL(f);
        setPreview(url);
    };

    const handleCreateProduct = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        // Validar campos mínimos
        if (!newName.trim()) {
            setError("El nombre del producto es requerido");
            return;
        }
        if (!newPrice) {
            setError("El precio del producto es requerido");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Primero subir la imagen si hay una seleccionada
            let imageUrl: string | undefined = undefined;
            if (selectedFile) {
                const uploadResult = await uploadImage(selectedFile);
                imageUrl = uploadResult.imageUrl;
            }

            // Crear el producto en el backend
            const productData = {
                name: newName.trim(),
                price: Number(newPrice),
                description: newDesc.trim() || undefined,
                stock: Number(newStock) || 0,
                category: newCategory || undefined,
                imageUrl: imageUrl,
            };

            const newProduct = await createProduct(productData);
            
            // Agregar el producto al estado local
            setProducts(prev => [newProduct, ...prev]);
            
            // Limpiar formulario
            setNewName("");
            setNewPrice("");
            setNewDesc("");
            setNewStock("");
            setNewCategory("");
            setPreview(null);
            setSelectedFile(null);
            if (fileRef.current) fileRef.current.value = "";
            
            // Mostrar mensaje de éxito
            setSuccessMessage("Producto creado correctamente");
            setTimeout(() => setSuccessMessage(null), 3000);
            
            // Cambiar a pestaña de búsqueda para ver el producto añadido
            setActiveTab("search");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error al crear el producto");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClearForm = () => {
        setNewName("");
        setNewPrice("");
        setNewDesc("");
        setNewStock("");
        setNewCategory("");
        setPreview(null);
        setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = "";
        setError(null);
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            setDeleteLoading(true);
            setError(null);
            
            const result = await deleteProduct(id);
            
            // Eliminar el producto del estado local
            setProducts(prev => prev.filter(p => p.id !== id));
            
            setSuccessMessage(result.message);
            setShowDeleteConfirm(null);
            
            // Ocultar mensaje después de 3 segundos
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error al eliminar el producto");
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const openEditModal = (id: number) => {
        const product = products.find(p => p.id === id);
        if (product) {
            setShowEditModal(id);
            setEditName(product.name);
            setEditDesc(product.description || "");
            setEditPrice(product.price.toString());
            setEditPreview(product.imageUrl || null);
            setEditSelectedFile(null);
        }
    };

    const handleEditFile = (f?: File) => {
        if (!f) return;
        setEditSelectedFile(f);
        const url = URL.createObjectURL(f);
        setEditPreview(url);
    };

    const handleUpdateProduct = async () => {
        if (showEditModal === null) return;
        
        if (!editName.trim()) {
            setError("El nombre del producto es requerido");
            return;
        }
        
        if (!editPrice.trim()) {
            setError("El precio del producto es requerido");
            return;
        }
        
        const priceNum = Number(editPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError("El precio debe ser un número mayor a 0");
            return;
        }

        try {
            setEditLoading(true);
            setError(null);

            let imageUrl: string | undefined = undefined;
            
            // Si hay una nueva imagen, subirla
            if (editSelectedFile) {
                const uploadResult = await uploadImage(editSelectedFile);
                imageUrl = uploadResult.imageUrl;
            }

            // Actualizar el producto
            const updateData: { name: string; description?: string; price: number; imageUrl?: string } = {
                name: editName.trim(),
                description: editDesc.trim() || undefined,
                price: priceNum,
            };
            
            // Solo incluir imageUrl si se subió una nueva imagen
            if (imageUrl) {
                updateData.imageUrl = imageUrl;
            }

            const updatedProduct = await updateProduct(showEditModal, updateData);
            
            // Actualizar el producto en el estado local
            setProducts(prev => prev.map(p => 
                p.id === showEditModal ? updatedProduct : p
            ));
            
            setSuccessMessage("Producto actualizado correctamente");
            setShowEditModal(null);
            setEditName("");
            setEditDesc("");
            setEditPrice("");
            setEditPreview(null);
            setEditSelectedFile(null);
            if (editFileRef.current) editFileRef.current.value = "";
            
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error al actualizar el producto");
            }
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="p-4 sm:p-6 max-w-5xl mx-auto">
                <section className="bg-white/90 border border-white/20 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/admin-profile')} className="px-2 py-1 border rounded text-sm">Regresar</button>
                            <h1 className="text-2xl font-semibold">Inventario</h1>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab("search")}
                            className={`px-3 py-1 rounded-md text-sm ${activeTab === "search" ? "bg-[var(--Primary_3)] text-white" : "bg-transparent border border-[var(--Primary_3)] text-[var(--Primary_3)]"}`}>
                            Búsqueda de artículos
                        </button>
                        <button
                            onClick={() => setActiveTab("add")}
                            className={`px-3 py-1 rounded-md text-sm ${activeTab === "add" ? "bg-[var(--Primary_3)] text-white" : "bg-transparent border border-gray-200 text-gray-700"}`}>
                            Añadir stock / Producto
                        </button>
                        <button
                            onClick={() => setActiveTab("supply")}
                            className={`px-3 py-1 rounded-md text-sm ${activeTab === "supply" ? "bg-[var(--Primary_3)] text-white" : "bg-transparent border border-gray-200 text-gray-700"}`}>
                            Provisión de compras
                        </button>
                    </div>

                    {/* Mensajes de éxito/error */}
                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Search bar */}
                    {activeTab === "search" && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full px-3 py-2 border rounded-md outline-none"
                                />
                                {loading && <span className="text-sm text-gray-500">Buscando...</span>}
                            </div>
                        </div>
                    )}

                    {/* Add product form */}
                    {activeTab === "add" && (
                        <form onSubmit={handleCreateProduct} className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input value={newName} onChange={(e) => setNewName(e.target.value.replace(/[0-9]/g, ""))} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Precio (S/)</label>
                                <input value={newPrice} onChange={(e) => { const val = e.target.value; if (val === "" || parseFloat(val) >= 0) setNewPrice(val); }} type="number" step="0.01" min="0" className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium mb-1">Descripción</label>
                                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Stock inicial</label>
                                <input value={newStock} onChange={(e) => { const val = e.target.value; if (val === "" || parseInt(val) >= 0) setNewStock(val); }} type="number" min="0" className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Categoría</label>
                                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                                    <option value="">Seleccionar categoría</option>
                                    <option value="Motor">Motor</option>
                                    <option value="Suspensión">Suspensión</option>
                                    <option value="Frenos">Frenos</option>
                                    <option value="Eléctrico">Eléctrico</option>
                                    <option value="Accesorios">Accesorios</option>
                                    <option value="Transmisión">Transmisión</option>
                                    <option value="Carrocería">Carrocería</option>
                                    <option value="Neumáticos">Neumáticos</option>
                                    <option value="Lubricantes">Lubricantes</option>
                                    <option value="Filtros">Filtros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Foto del producto</label>
                                <input ref={fileRef} onChange={(e) => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); }} type="file" accept="image/*" className="w-full" />
                                {preview && <img src={preview} alt="preview" className="mt-2 h-28 object-contain" />}
                            </div>
                            <div className="sm:col-span-2">
                                <div className="flex gap-2">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="px-4 py-2 bg-[var(--Primary_5)] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Creando..." : "Crear producto"}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleClearForm}
                                        disabled={loading}
                                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Product grid/list (mostrar en todas las pestañas excepto 'supply') */}
                    {activeTab !== "supply" && (
                        <>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--Primary_5)]"></div>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    {query ? "No se encontraron productos" : "No hay productos disponibles"}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filtered.map((p) => (
                                        <div key={p.id} className="relative">
                                            <ProductCard product={{ id: p.id, name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl, stock: p.stock }} />
                                            {/* botones para añadir stock, editar y eliminar */}
                                            <div className="mt-2 flex gap-2">
                                                <button 
                                                    onClick={() => openAddStock(p.id)} 
                                                    className="flex-1 px-3 py-2 bg-[var(--Primary_5)] text-white rounded-md hover:bg-[#1e4a6f] transition-colors text-sm"
                                                >
                                                    Stock
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(p.id)} 
                                                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                                    title="Editar producto"
                                                >
                                                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => setShowDeleteConfirm(p.id)} 
                                                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                    title="Eliminar producto"
                                                >
                                                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* calendario y nuevas llegadas */}
                    {activeTab === "supply" && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-semibold">Calendario de provisiones</h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={goPrevMonth} className="px-2 py-1 border rounded">◀</button>
                                    <div className="px-3 py-1 bg-gray-50 rounded">{visibleMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                                    <button onClick={goNextMonth} className="px-2 py-1 border rounded">▶</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(w => (
                                    <div key={w} className="font-medium text-gray-600 py-1">{w}</div>
                                ))}
                                {/** build leading empty cells to align first day */}
                                {(() => {
                                    const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
                                    const cells: React.ReactNode[] = [];
                                    for (let i = 0; i < firstWeekday; i++) cells.push(<div key={`e-${i}`} />);
                                    arrivalsForVisibleMonth.forEach(d => {
                                        const dayNum = Number(d.date.slice(-2));
                                        const has = d.products.length > 0;
                                        cells.push(
                                            <div key={d.date} className={`p-2 border rounded ${selectedDate === d.date ? 'bg-[var(--Primary_3)] text-white' : ''}`} onClick={() => setSelectedDate(d.date)}>
                                                <div className="text-sm">{dayNum}</div>
                                                {has && <div className="text-xs mt-1 bg-[var(--Primary_5)] text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center">{d.products.length}</div>}
                                            </div>
                                        );
                                    });
                                    return cells;
                                })()}
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium mb-2">Productos previstos {selectedDate ? `para ${selectedDate}` : '(selecciona una fecha)'}</h3>
                                    <div className="space-y-3">
                                        {(selectedDate && productsByArrivalDate[selectedDate] ? productsByArrivalDate[selectedDate] : []).map(p => {
                                            const imgUrl = p.imageUrl 
                                                ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API_BASE}${p.imageUrl}`)
                                                : "/assets/imgs/placeholder.png";
                                            return (
                                            <div key={p.id} className="flex items-center gap-3 border rounded p-2">
                                                <img src={imgUrl} alt={p.name} className="w-12 h-12 object-contain" />
                                                <div>
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-sm text-gray-600">S/ {Number(p.price).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        );
                                        })}
                                        {!selectedDate && <div className="text-sm text-gray-500">Selecciona una fecha del calendario para ver los productos.</div>}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Nuevas llegadas</h3>
                                    <div className="space-y-2">
                                        {newestArrivals.map(p => {
                                            const imgUrl = p.imageUrl 
                                                ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API_BASE}${p.imageUrl}`)
                                                : "/assets/imgs/placeholder.png";
                                            return (
                                            <div key={p.id} className="flex items-center gap-3 border rounded p-2">
                                                <img src={imgUrl} alt={p.name} className="w-12 h-12 object-contain" />
                                                <div className="flex-1">
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-xs text-gray-500">Creado: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</div>
                                                </div>
                                                <div className="text-sm font-semibold">S/ {Number(p.price).toFixed(2)}</div>
                                            </div>
                                        );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* modal para editar producto */}
                    {showEditModal != null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="bg-white rounded-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <h3 className="text-lg font-semibold mb-4 text-green-600">Editar producto</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nombre *</label>
                                            <input 
                                                value={editName} 
                                                onChange={(e) => setEditName(e.target.value.replace(/[0-9]/g, ""))} 
                                                className="w-full px-3 py-2 border rounded-md" 
                                                placeholder="Nombre del producto"
                                                disabled={editLoading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Precio (S/) *</label>
                                            <input 
                                                value={editPrice} 
                                                onChange={(e) => { const val = e.target.value; if (val === "" || parseFloat(val) >= 0) setEditPrice(val); }} 
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border rounded-md" 
                                                placeholder="0.00"
                                                disabled={editLoading}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Descripción</label>
                                        <textarea 
                                            value={editDesc} 
                                            onChange={(e) => setEditDesc(e.target.value)} 
                                            className="w-full px-3 py-2 border rounded-md" 
                                            rows={3}
                                            placeholder="Descripción del producto"
                                            disabled={editLoading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Cambiar imagen (opcional)</label>
                                        <input 
                                            ref={editFileRef}
                                            onChange={(e) => { if (e.target.files && e.target.files[0]) handleEditFile(e.target.files[0]); }} 
                                            type="file" 
                                            accept="image/*" 
                                            className="w-full"
                                            disabled={editLoading}
                                        />
                                        {editPreview && (
                                            <div className="mt-2">
                                                <img 
                                                    src={editPreview.startsWith('blob:') ? editPreview : `${API_BASE}${editPreview}`} 
                                                    alt="preview" 
                                                    className="h-32 object-contain border rounded" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end mt-6">
                                    <button 
                                        className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors" 
                                        onClick={() => { 
                                            setShowEditModal(null); 
                                            setEditName("");
                                            setEditDesc("");
                                            setEditPrice("");
                                            setEditPreview(null);
                                            setEditSelectedFile(null);
                                            if (editFileRef.current) editFileRef.current.value = "";
                                            setError(null); 
                                        }}
                                        disabled={editLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                        onClick={handleUpdateProduct}
                                        disabled={editLoading}
                                    >
                                        {editLoading ? "Actualizando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* modal para confirmar eliminación */}
                    {showDeleteConfirm != null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="bg-white rounded-md p-6 w-full max-w-md">
                                <h3 className="text-lg font-semibold mb-2 text-red-600">Eliminar producto</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    ¿Estás seguro de que quieres eliminar el producto <strong>{products.find(p => p.id === showDeleteConfirm)?.name}</strong>?
                                </p>
                                <p className="text-xs text-gray-500 mb-6">
                                    Esta acción no se puede deshacer.
                                </p>
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors" 
                                        onClick={() => { setShowDeleteConfirm(null); setError(null); }}
                                        disabled={deleteLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                                        onClick={() => handleDeleteProduct(showDeleteConfirm)}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? "Eliminando..." : "Eliminar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* modal para añadir stock (simulado) */}
                    {showAddStockFor != null && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                            <div className="bg-white rounded-md p-6 w-full max-w-md">
                                <h3 className="text-lg font-semibold mb-2">Agregar stock</h3>
                                <p className="text-sm text-gray-600 mb-4">Producto: {products.find(p => p.id === showAddStockFor)?.name}</p>
                                <input 
                                    type="number" 
                                    value={addQuantity} 
                                    onChange={(e) => setAddQuantity(Math.max(0, Number(e.target.value)))} 
                                    className="w-full px-3 py-2 border rounded-md mb-4" 
                                    placeholder="Cantidad a agregar"
                                    min="0"
                                    disabled={stockLoading}
                                />
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        className="px-4 py-2 border rounded-md" 
                                        onClick={() => { setShowAddStockFor(null); setAddQuantity(0); setError(null); }}
                                        disabled={stockLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        className="px-4 py-2 bg-[var(--Primary_5)] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed" 
                                        onClick={confirmAddStock}
                                        disabled={stockLoading}
                                    >
                                        {stockLoading ? "Guardando..." : "Confirmar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
