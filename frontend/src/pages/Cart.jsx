import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../services/cartService";
import { getProductById } from "../services/productService";
import LoadingSpinner from "../components/LoadingSpinner";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartResponse = await getCart();
      const items = cartResponse.data;

      const itemsWithProduct = await Promise.all(
        items.map(async (item) => {
          const productResponse = await getProductById(item.productId);
          return {
            ...item,
            product: productResponse.data,
          };
        }),
      );

      setCartItems(itemsWithProduct);
      setError("");
    } catch (err) {
      console.error("Cart error:", err);
      setError("Failed to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async (item) => {
    try {
      await updateCartQuantity(item.id, item.quantity + 1);
      // Optimistic update
      setCartItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, quantity: prevItem.quantity + 1 }
            : prevItem
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to increase quantity");
      fetchCart();
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;
    try {
      await updateCartQuantity(item.id, item.quantity - 1);
      // Optimistic update
      setCartItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, quantity: prevItem.quantity - 1 }
            : prevItem
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to decrease quantity");
      fetchCart();
    }
  };

  const handleRemove = async (cartItemId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this product from your cart?",
    );

    if (!confirmDelete) return;

    try {
      await removeFromCart(cartItemId);
      toast.success("Product removed from cart");
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
    } catch (error) {
      console.error(error);
      toast.error("Removal failed");
    }
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAVE10") {
      const discountAmount = total * 0.1;
      setDiscount(discountAmount);
      setCouponApplied(true);
      toast.success("Promo code 'SAVE10' applied: 10% discount!");
    } else {
      setDiscount(0);
      setCouponApplied(false);
      toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCoupon("");
    setCouponApplied(false);
    toast.info("Coupon code removed");
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const finalTotal = total - discount;

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        items: cartItems,
        total,
        discount,
        finalTotal,
        couponCode: couponApplied ? "SAVE10" : null,
      },
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="page-container text-center py-lg">
        <div className="card max-w-md mx-auto p-lg">
          <h2>{error}</h2>
          <button onClick={fetchCart} className="btn btn-primary mt-md">
            Retry Loading Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Your Shopping Cart</h1>
      <p className="page-subtitle">Manage items you selected for checkout</p>

      {cartItems.length === 0 ? (
        <div className="card text-center py-lg max-w-xl mx-auto mt-md">
          <div className="empty-cart-icon-wrapper mb-md">
            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>Your cart is currently empty</h2>
          <p className="text-muted mt-sm mb-lg">Looks like you haven't added anything to your cart yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/products")}>
            Browse Shop Catalog
          </button>
        </div>
      ) : (
        <div className="cart-page-layout">
          {/* Left Column: Cart Items list */}
          <div className="cart-items-column">
            {cartItems.map((item) => (
              <div className="card cart-item-row" key={item.id}>
                <div className="cart-item-image-wrapper">
                  <img
                    src={item.product?.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=200&auto=format&fit=crop"}
                    alt={item.product?.name || "Product"}
                    className="cart-item-img"
                  />
                </div>

                <div className="cart-item-details">
                  <h3 className="cart-item-name">
                    <Link to={`/products/${item.productId}`}>{item.product?.name || "Product Info"}</Link>
                  </h3>
                  <div className="cart-item-price-tag">₹{(item.product?.price || 0).toLocaleString()} each</div>
                </div>

                <div className="cart-item-quantity-controls">
                  <button
                    onClick={() => handleDecrease(item)}
                    disabled={item.quantity <= 1}
                    className="btn-qty-adjust"
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <span className="qty-value-display">{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item)}
                    className="btn-qty-adjust"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-subtotal-cell">
                  <div className="item-subtotal-label">Subtotal</div>
                  <div className="item-subtotal-value">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="btn-item-delete"
                  aria-label="Remove item"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Right Column: Cart Summary */}
          <div className="cart-summary-column">
            <div className="card summary-card-sticky">
              <h2>Order Summary</h2>
              <hr className="divider" />

              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              {/* Coupon Section */}
              <div className="coupon-form-group">
                <label htmlFor="coupon-input">Promo Code</label>
                {couponApplied ? (
                  <div className="applied-coupon-row">
                    <span className="coupon-code-text">SAVE10 (10% Off)</span>
                    <button className="btn-link-remove" onClick={removeCoupon}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-wrapper">
                    <input
                      id="coupon-input"
                      type="text"
                      placeholder="e.g. SAVE10"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button className="btn btn-secondary-outline btn-sm" onClick={applyCoupon}>
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {discount > 0 && (
                <div className="summary-row text-success">
                  <span>Promo Code Discount</span>
                  <span>–₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span className="text-success">FREE</span>
              </div>

              <hr className="divider" />

              <div className="summary-row total-row">
                <span>Final Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              <button onClick={handleCheckout} className="btn btn-primary btn-lg w-full mt-md">
                Proceed to Checkout
              </button>
              <button onClick={() => navigate("/products")} className="btn btn-secondary-outline w-full mt-sm">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
