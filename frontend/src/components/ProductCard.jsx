import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../services/cartService";

function ProductCard({ product, onWishlistRemove }) {
  const { token } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = saved.some((item) => item.id === product.id);
    setIsWishlisted(exists);
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.warning("Please login to manage your wishlist");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = saved.some((item) => item.id === product.id);

    if (exists) {
      const updated = saved.filter((item) => item.id !== product.id);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsWishlisted(false);
      toast.success("Removed from wishlist");
      if (onWishlistRemove) {
        onWishlistRemove(product.id);
      }
    } else {
      const updated = [...saved, product];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsWishlisted(true);
      toast.success("Added to wishlist");
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      await addToCart(product.id);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-image-container">
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=350&auto=format&fit=crop"}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          {product.category && <span className="product-category-tag">{product.category}</span>}
          
          <button
            onClick={toggleWishlist}
            className={isWishlisted ? "wishlist-btn active" : "wishlist-btn"}
            aria-label="Add to Wishlist"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill={isWishlisted ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <div className="product-card-info">
          <h3 className="product-title">{product.name}</h3>
          <div className="product-card-footer">
            <span className="product-price">₹{product.price.toLocaleString()}</span>
            <button onClick={handleAddToCart} className="btn-icon-add" aria-label="Add to Cart">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
