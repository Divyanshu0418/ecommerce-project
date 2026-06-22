import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(saved);
  }, []);

  const handleWishlistRemove = (id) => {
    setWishlist((prevList) => prevList.filter((item) => item.id !== id));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">My Wishlist</h1>
      <p className="page-subtitle">Products you have saved for later</p>

      {wishlist.length === 0 ? (
        <div className="card text-center py-lg max-w-md mx-auto mt-md">
          <div className="empty-wishlist-icon mb-md">
            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-muted">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <h2>Your wishlist is empty</h2>
          <p className="text-muted mt-sm mb-lg">Start exploring the shop and save your favorite gear!</p>
          <Link to="/products" className="btn btn-primary">
            Go to Products
          </Link>
        </div>
      ) : (
        <div className="grid">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onWishlistRemove={handleWishlistRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
