import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";

function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((res) => {
        // Fetch first 3 products as featured
        setFeaturedProducts(res.data.slice(0, 3));
      })
      .catch((err) => console.log("Failed to fetch featured products:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Summer Tech Sale</span>
          <h1 className="hero-title">Experience Tomorrow’s Tech, Today</h1>
          <p className="hero-subtitle">
            Upgrade your lifestyle with our premium curated collection of cutting-edge electronics and accessories at unbeatable prices.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop the Collection
            </Link>
            <Link to="/products?category=Mobile" className="btn btn-secondary-outline btn-lg">
              Explore Mobiles
            </Link>
          </div>
        </div>
        <div className="hero-pattern-bg"></div>
      </section>

      {/* Categories Section */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-description">Find exactly what you need in our curated tech hubs</p>
        </div>

        <div className="categories-grid">
          {/* Mobile Category */}
          <div className="category-card" onClick={() => navigate("/products?category=Mobile")}>
            <div className="category-icon-wrapper text-mobile">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
            <h3 className="category-name">Mobiles</h3>
            <p className="category-count">Flagships & Accessories</p>
          </div>

          {/* Laptop Category */}
          <div className="category-card" onClick={() => navigate("/products?category=Laptop")}>
            <div className="category-icon-wrapper text-laptop">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="2" y1="20" x2="22" y2="20"></line>
                <line x1="12" y1="17" x2="12" y2="20"></line>
              </svg>
            </div>
            <h3 className="category-name">Laptops</h3>
            <p className="category-count">Workstations & Ultrabooks</p>
          </div>

          {/* Accessories Category */}
          <div className="category-card" onClick={() => navigate("/products?category=Accessories")}>
            <div className="category-icon-wrapper text-accessories">
              <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 0-10 10v7a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-7a10 10 0 0 0-10-10z"></path>
                <path d="M12 18v4"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <h3 className="category-name">Accessories</h3>
            <p className="category-count">Audio, Wearables & More</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-container bg-surface-alt">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-description">Handpicked bestsellers chosen for design and performance</p>
        </div>

        {loading ? (
          <div className="grid">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="empty-state">
            <p>No products featured at this time.</p>
          </div>
        ) : (
          <div className="grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-lg">
          <Link to="/products" className="btn btn-secondary-outline">
            View All Products
          </Link>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner-section">
        <div className="promo-content">
          <h2 className="promo-title">Get 10% Off Your First Purchase</h2>
          <p className="promo-text">Use the coupon code below at checkout to redeem your special welcome discount.</p>
          <div className="coupon-badge">SAVE10</div>
        </div>
      </section>
    </div>
  );
}

export default Home;
