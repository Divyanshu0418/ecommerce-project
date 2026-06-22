import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { checkoutOrder, getMyOrders, payOrder } from "../services/orderService";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve checkout totals and items from Router state passed by Cart
  const { items = [], total = 0, discount = 0, finalTotal = 0 } = location.state || {};

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  // Card Payment States (Dummy)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    // If user lands directly on checkout without items, redirect to cart
    if (!location.state || items.length === 0) {
      toast.warning("Your cart is empty. Please select products to buy.");
      navigate("/cart");
    }
  }, [items, location.state, navigate]);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Full Name is required");
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      toast.error("Valid 10-digit Phone Number is required");
      return false;
    }
    if (!address.trim()) {
      toast.error("Shipping Address is required");
      return false;
    }
    if (!city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!zip.trim() || zip.length < 5) {
      toast.error("Valid Zip Code is required");
      return false;
    }

    if (paymentMethod === "CARD") {
      if (cardNumber.replace(/\s+/g, "").length !== 16) {
        toast.error("Card number must be 16 digits");
        return false;
      }
      if (!cardExpiry.includes("/")) {
        toast.error("Card expiry must be in MM/YY format");
        return false;
      }
      if (cardCvv.length !== 3) {
        toast.error("CVV must be 3 digits");
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      // 1. Call checkout API to create the order
      const response = await checkoutOrder();

      if (response.data === "Cart is empty") {
        toast.error("Your cart appears to be empty");
        setLoading(false);
        return;
      }

      // 2. Fetch the newly placed order ID from history
      const ordersResponse = await getMyOrders();
      const userOrders = ordersResponse.data;

      // Find the most recent order (highest ID or latest timestamp)
      const sortedOrders = userOrders.sort((a, b) => b.id - a.id);
      const latestOrder = sortedOrders[0];

      if (!latestOrder) {
        throw new Error("Could not retrieve created order details");
      }

      setPlacedOrderId(latestOrder.id);

      // 3. If credit card was chosen, invoke the payment pay endpoint
      if (paymentMethod === "CARD") {
        const payResponse = await payOrder(latestOrder.id);
        if (payResponse.data === "Payment Successful") {
          toast.success("Payment processed successfully!");
        } else {
          toast.warning("Order placed, but payment status could not be finalized: " + payResponse.data);
        }
      } else {
        toast.success("Order placed successfully (Cash on Delivery)");
      }

      setOrderSuccess(true);
    } catch (error) {
      console.error("Checkout process failed:", error);
      toast.error("Order processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="page-container text-center py-lg">
        <div className="card max-w-lg mx-auto p-lg order-success-card">
          <div className="success-icon-wrapper mb-md">
            <svg viewBox="0 0 24 24" width="72" height="72" stroke="currentColor" strokeWidth="2" fill="none" className="text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">Thank you for shopping with RanjanBuy.</p>
          
          <div className="order-receipt-box my-lg">
            <p><strong>Order ID:</strong> #{placedOrderId || "N/A"}</p>
            <p><strong>Amount Paid:</strong> ₹{finalTotal.toLocaleString()}</p>
            <p><strong>Payment Status:</strong> {paymentMethod === "CARD" ? "PAID" : "COD (PENDING)"}</p>
            <p>A confirmation email has been dispatched to your mailbox.</p>
          </div>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate("/orders")}>
              Track Your Orders
            </button>
            <button className="btn btn-secondary-outline mt-sm block-w" onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Secure Checkout</h1>
      <p className="page-subtitle">Provide your delivery address and payment preferences</p>

      <div className="checkout-page-layout">
        {/* Left Column: Billing/Shipping & Payment Form */}
        <form onSubmit={handlePlaceOrder} className="checkout-form-column">
          <div className="card checkout-card">
            <h2>Shipping Information</h2>
            <hr className="divider" />

            <div className="form-grid">
              <div className="form-group col-12">
                <label htmlFor="name-input">Full Name</label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group col-12">
                <label htmlFor="phone-input">Phone Number</label>
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group col-12">
                <label htmlFor="address-input">Street Address</label>
                <input
                  id="address-input"
                  type="text"
                  placeholder="Apt, Suite, Building, Street Details"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group col-6">
                <label htmlFor="city-input">City</label>
                <input
                  id="city-input"
                  type="text"
                  placeholder="New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group col-6">
                <label htmlFor="zip-input">Zip Code</label>
                <input
                  id="zip-input"
                  type="text"
                  placeholder="110001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="card checkout-card mt-md">
            <h2>Payment Method</h2>
            <hr className="divider" />

            <div className="payment-options-grid">
              <label className={paymentMethod === "COD" ? "payment-label-option active" : "payment-label-option"}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  disabled={loading}
                />
                <div className="payment-opt-desc">
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Pay with cash upon package receipt.</p>
                </div>
              </label>

              <label className={paymentMethod === "CARD" ? "payment-label-option active" : "payment-label-option"}>
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  disabled={loading}
                />
                <div className="payment-opt-desc">
                  <strong>Credit / Debit Card</strong>
                  <p>Pay securely now via mock gateway.</p>
                </div>
              </label>
            </div>

            {paymentMethod === "CARD" && (
              <div className="card-details-form-box mt-md animate-fade-in">
                <div className="form-group col-12">
                  <label htmlFor="card-number-input">Card Number</label>
                  <input
                    id="card-number-input"
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    maxLength="19"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                    disabled={loading}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group col-6">
                    <label htmlFor="card-expiry-input">Expiry Date</label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group col-6">
                    <label htmlFor="card-cvv-input">Security Code (CVV)</label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      placeholder="123"
                      maxLength="3"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Right Column: Order Summary details */}
        <div className="checkout-summary-column">
          <div className="card checkout-summary-card">
            <h2>Items in Order ({items.length})</h2>
            <hr className="divider" />

            <div className="checkout-summary-items-list">
              {items.map((item) => (
                <div className="summary-item-row" key={item.id}>
                  <div className="summary-item-img-box">
                    <img
                      src={item.product?.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=100&auto=format&fit=crop"}
                      alt={item.product?.name || "Product"}
                    />
                  </div>
                  <div className="summary-item-desc">
                    <div className="summary-item-title">{item.product?.name || "Product"}</div>
                    <div className="summary-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="summary-item-total-price">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <hr className="divider" />

            <div className="summary-row">
              <span>Cart Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="summary-row text-success">
                <span>Welcome Discount</span>
                <span>–₹{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Shipping Fee</span>
              <span className="text-success">FREE</span>
            </div>

            <hr className="divider" />

            <div className="summary-row total-row">
              <span>Total Payable</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
              className="btn btn-primary btn-lg w-full mt-md"
            >
              {loading ? "Processing Order..." : `Place Order (₹${finalTotal.toLocaleString()})`}
            </button>
            
            <Link to="/cart" className="btn btn-secondary-outline w-full mt-sm text-center">
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
