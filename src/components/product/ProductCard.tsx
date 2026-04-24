// src/components/ProductCard.tsx
import React from "react";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
};

type ProductCardProps = {
  product: Product;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const [imgError, setImgError] = React.useState(false);
  
  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl}`)
    : "/assets/imgs/placeholder.png";

  const handleImageError = () => {
    console.error(`Error cargando imagen para producto ${product.id}:`, imageUrl);
    setImgError(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <img
        src={imgError ? "/assets/imgs/placeholder.png" : imageUrl}
        alt={product.name}
        className="w-full h-40 object-cover mb-3"
        onError={handleImageError}
      />
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="text-blue-600 font-bold">S/ {product.price.toFixed(2)}</p>
      {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
        <p className="text-sm text-orange-600 font-medium mt-1">¡Solo quedan {product.stock}!</p>
      )}
      {product.stock !== undefined && product.stock === 0 && (
        <p className="text-sm text-red-600 font-medium mt-1">Agotado</p>
      )}
    </div>
  );
};

export default ProductCard;
