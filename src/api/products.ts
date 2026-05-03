import { getProducts, nextProductId, saveProducts, type LocalProduct } from "./localStorageDb";
import { getToken } from "../utils/token";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  category?: string;
  createdAt?: string;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function requireSession() {
  const token = getToken();
  if (!token) throw new Error("No hay sesi\u00f3n activa");
}

function sortByDateDesc<T extends { createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

function toProduct(product: LocalProduct): Product {
  return { ...product };
}

export async function getAllProducts(category?: string): Promise<Product[]> {
  let items = getProducts();
  if (category?.trim()) {
    const normalized = normalizeText(category);
    items = items.filter((p) => normalizeText(p.category || "").includes(normalized));
  }
  return sortByDateDesc(items).map(toProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const normalized = normalizeText(query || "");
  const items = getProducts();
  if (!normalized) return sortByDateDesc(items).map(toProduct);

  return sortByDateDesc(
    items.filter((p) => {
      const content = `${p.name} ${p.description || ""} ${p.category || ""}`.toLowerCase();
      return content.includes(normalized);
    })
  ).map(toProduct);
}

export async function addStockToProduct(
  productId: number,
  quantity: number
): Promise<{ message: string; newStock: number }> {
  requireSession();
  if (quantity <= 0) throw new Error("La cantidad debe ser mayor a 0");

  const items = getProducts();
  const index = items.findIndex((p) => p.id === productId);
  if (index < 0) throw new Error("Producto no encontrado");

  const currentStock = items[index].stock || 0;
  const newStock = currentStock + quantity;
  items[index] = { ...items[index], stock: newStock };
  saveProducts(items);

  return { message: "Stock agregado correctamente", newStock };
}

export async function getProductById(id: number): Promise<Product> {
  const item = getProducts().find((p) => p.id === id);
  if (!item) throw new Error("Producto no encontrado");
  return toProduct(item);
}

export async function uploadImage(file: File): Promise<{ imageUrl: string; filename: string }> {
  requireSession();
  const imageUrl = URL.createObjectURL(file);
  return { imageUrl, filename: file.name };
}

export async function updateProduct(
  productId: number,
  productData: { name?: string; description?: string; price?: number; imageUrl?: string }
): Promise<Product> {
  requireSession();
  const items = getProducts();
  const index = items.findIndex((p) => p.id === productId);
  if (index < 0) throw new Error("Producto no encontrado");

  const updated = { ...items[index], ...productData };
  items[index] = updated;
  saveProducts(items);
  return toProduct(updated);
}

export async function deleteProduct(productId: number): Promise<{ message: string; id: number }> {
  requireSession();
  const items = getProducts();
  const index = items.findIndex((p) => p.id === productId);
  if (index < 0) throw new Error("Producto no encontrado");

  items.splice(index, 1);
  saveProducts(items);
  return { message: "Producto eliminado correctamente", id: productId };
}

export async function createProduct(productData: {
  name: string;
  price: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
}): Promise<Product> {
  requireSession();
  const items = getProducts();
  const created: LocalProduct = {
    id: nextProductId(),
    name: productData.name,
    price: productData.price,
    description: productData.description,
    stock: productData.stock ?? 0,
    imageUrl: productData.imageUrl,
    createdAt: new Date().toISOString(),
  };
  items.unshift(created);
  saveProducts(items);
  return toProduct(created);
}

