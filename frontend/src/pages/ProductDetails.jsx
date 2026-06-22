import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getProductById } from "../services/productService";
import { addToCart } from "../services/cartService";
import LoadingSpinner from "../components/LoadingSpinner";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProduct();
    // Load reviews from local storage for persistence (backend lacks reviews entity)
    const savedReviews = JSON.parse(localStorage.getItem(`reviews_${id}`)) || [];
    setReviews(savedReviews);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(id);
      setProduct(response.data);
      setError("");
    } catch (err) {
      console.error("Error loading product details:", err);
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(id);
      toast.success("Product added to cart!");
    } catch (err) {
      console.error(err);
      toast.error("Please login to add products to your cart.");
    }
  };

  const addToWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = saved.find((item) => item.id === product.id);

    if (exists) {
      toast.info("Product is already in your wishlist.");
      return;
    }

    const updated = [...saved, product];
    localStorage.setItem("wishlist", JSON.stringify(updated));
    toast.success("Added to wishlist!");
  };

  const submitReview = () => {
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    if (!review.trim()) {
      toast.error("Please write a review message.");
      return;
    }

    const newReview = {
      id: Date.now(),
      rating,
      review: review.trim(),
      date: new Date().toLocaleDateString(),
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));

    setRating(0);
    setReview("");
    toast.success("Thank you! Review added successfully.");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="page-container text-center py-lg">
        <div className="card max-w-md mx-auto p-lg">
          <h2>{error}</h2>
          <p className="text-muted mt-sm">The product you are looking for may have been removed or does not exist.</p>
          <Link to="/products" className="btn btn-primary mt-md inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="back-link-wrapper">
        <Link to="/products" className="back-link">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Shop
        </Link>
      </div>

      {/* Main Details Grid */}
      <div className="product-details-grid">
        {/* Left: Product Image */}
        <div className="details-image-card">
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop"}
            alt={product.name}
            className="details-product-image"
          />
          {product.category && <span className="details-category-badge">{product.category}</span>}
        </div>

        {/* Right: Product Info */}
        <div className="details-info-card">
          <h1 className="details-product-title">{product.name}</h1>
          <div className="details-price-badge">₹{product.price.toLocaleString()}</div>
          
          <div className="details-meta-group">
            <div className="meta-row">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{product.category || "General"}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Availability:</span>
              <span className="meta-value text-success">In Stock</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Shipping:</span>
              <span className="meta-value text-success">Free Delivery</span>
            </div>
          </div>

          <div className="details-description-box">
            <h3>Overview</h3>
            <p>
              Experience the pinnacle of hardware engineering with the {product.name}. Designed to offer state-of-the-art performance, premium craftsmanship, and unparalleled reliability in its class. Perfect for modern lifestyles demanding excellence.
            </p>
          </div>

          <div className="details-actions-row">
            <button onClick={handleAddToCart} className="btn btn-primary btn-lg flex-1">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", verticalAlign: "middle" }}>
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add To Cart
            </button>
            <button onClick={addToWishlist} className="btn btn-secondary-outline btn-lg" aria-label="Add to Wishlist">
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings section */}
      <div className="reviews-section-layout">
        {/* Left Column: Submit Review */}
        <div className="card review-form-card">
          <h2>Leave a Review</h2>
          <p className="text-muted mb-md">Share your experience with other customers</p>

          <div className="rating-picker-group">
            <span className="rating-label">Rating:</span>
            <div className="stars-wrapper">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="star-picker-btn"
                  type="button"
                  aria-label={`Rate ${star} Stars`}
                >
                  <span className={star <= rating ? "star active" : "star"}>★</span>
                </button>
              ))}
            </div>
          </div>

          <div className="review-textarea-wrapper">
            <textarea
              placeholder="Write your detailed review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              style={{ minHeight: "100px" }}
            />
          </div>

          <button onClick={submitReview} className="btn btn-primary mt-sm w-full">
            Submit Review
          </button>
        </div>

        {/* Right Column: Reviews List */}
        <div className="card reviews-list-card">
          <h2>Customer Reviews ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <div className="empty-reviews-state">
              <p className="text-muted">No reviews yet for this product. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="reviews-scroller">
              {reviews.map((item) => (
                <div className="review-item" key={item.id}>
                  <div className="review-item-header">
                    <span className="review-stars">{"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</span>
                    <span className="review-date">{item.date}</span>
                  </div>
                  <p className="review-text">{item.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
