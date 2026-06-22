import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductSkeleton from "../components/ProductSkeleton";
import ProductCard from "../components/ProductCard";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  // Keep category in sync with URL queries (e.g. clicking on Home page categories)
  useEffect(() => {
    const cat = searchParams.get("category") || "";
    setCategory(cat);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
      setError("");
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    setCurrentPage(1);
    // Update URL query parameters
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      category === "" ||
      (product.category &&
        product.category.toLowerCase() === category.toLowerCase());

    const matchPrice = maxPrice === "" || product.price <= Number(maxPrice);

    return matchSearch && matchCategory && matchPrice;
  });

  const lastIndex = currentPage * productsPerPage;
  const firstIndex = lastIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="page-container">
        <div className="products-layout-header">
          <h1 className="page-title">Shop Products</h1>
        </div>
        <div className="products-grid-layout">
          <div className="filter-sidebar skeleton" style={{ height: "300px" }}></div>
          <div className="grid">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container text-center py-lg">
        <div className="card max-w-md mx-auto p-lg">
          <div className="text-danger mb-md">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2>{error}</h2>
          <button onClick={fetchProducts} className="btn btn-primary mt-md">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="products-layout-header">
        <h1 className="page-title">Explore Tech Hub</h1>
        <p className="page-subtitle">Showing {filteredProducts.length} premium quality electronics</p>
      </div>

      <div className="products-grid-layout">
        {/* Filters Sidebar */}
        <aside className="filter-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            {(search || category || maxPrice) && (
              <button
                className="btn-link-clear"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setMaxPrice("");
                  setSearchParams({});
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="filter-group">
            <label htmlFor="search-input">Search Product</label>
            <div className="search-input-wrapper">
              <input
                id="search-input"
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="category-select">Category</label>
            <select id="category-select" value={category} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              <option value="Mobile">Mobile</option>
              <option value="Laptop">Laptop</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="price-range">Max Price (₹{maxPrice ? Number(maxPrice).toLocaleString() : "Max"})</label>
            <input
              id="price-range"
              type="number"
              min="0"
              max="300000"
              placeholder="e.g. 150000"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </aside>

        {/* Products Display */}
        <main className="products-main-content">
          {currentProducts.length === 0 ? (
            <div className="card empty-products-state">
              <div className="empty-icon-wrapper">
                <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <h3>No Products Match Your Criteria</h3>
              <p>Try modifying your search text, category, or price limit.</p>
            </div>
          ) : (
            <>
              <div className="grid">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    className="btn btn-secondary-outline btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>

                  <span className="pagination-text">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>

                  <button
                    className="btn btn-secondary-outline btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Products;
