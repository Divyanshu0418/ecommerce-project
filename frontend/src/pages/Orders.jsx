import { useEffect, useState } from "react";
import { getMyOrders } from "../services/orderService";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      // Sort orders by ID descending so most recent is first
      const sorted = (response.data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
      setError("");
    } catch (err) {
      console.error("Orders fetch error:", err);
      setError("Failed to fetch order history.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return "badge-success";
      case "SHIPPED":
        return "badge-info";
      case "PLACED":
      case "PENDING":
        return "badge-warning";
      case "CANCELLED":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getPaymentStatusClass = (status) => {
    return status?.toUpperCase() === "PAID" ? "badge-success" : "badge-warning";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="page-container text-center py-lg">
        <div className="card max-w-md mx-auto p-lg">
          <h2>{error}</h2>
          <button onClick={fetchOrders} className="btn btn-primary mt-md">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My Order History</h1>
      <p className="page-subtitle">Track and review your orders and invoices</p>

      {orders.length === 0 ? (
        <div className="card text-center py-lg max-w-md mx-auto mt-md">
          <div className="empty-orders-icon-wrapper mb-md">
            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-muted">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="20" x2="22" y2="20"></line>
              <line x1="12" y1="17" x2="12" y2="20"></line>
            </svg>
          </div>
          <h2>No Orders Found</h2>
          <p className="text-muted mt-sm mb-lg">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-table-wrapper card">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Fulfillment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id}</strong>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <span className="payment-method-text">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Card Payment"}</span>
                  </td>
                  <td>
                    <span className={`badge ${getPaymentStatusClass(order.paymentStatus)}`}>
                      {order.paymentStatus || "PENDING"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(order.status)}`}>
                      {order.status || "PLACED"}
                    </span>
                  </td>
                  <td>
                    <strong className="order-total-price">₹{order.totalAmount.toLocaleString()}</strong>
                  </td>
                  <td>
                    <button className="btn btn-secondary-outline btn-sm" onClick={() => setSelectedOrder(order)}>
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {selectedOrder && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedOrder(null)}>
          <div className="card modal-content-card receipt-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Invoice</h2>
              <button className="btn-close-modal" onClick={() => setSelectedOrder(null)} aria-label="Close Modal">
                &times;
              </button>
            </div>

            <div className="modal-body receipt-body">
              <div className="receipt-brand-row">
                <span className="receipt-brand">RanjanBuy</span>
                <span className="receipt-status-tag">Receipt</span>
              </div>
              <hr className="divider" />

              <div className="receipt-meta-grid">
                <div>
                  <span className="receipt-label">Order ID</span>
                  <span className="receipt-val">#{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="receipt-label">Date Placed</span>
                  <span className="receipt-val">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div>
                  <span className="receipt-label">Payment Mode</span>
                  <span className="receipt-val">{selectedOrder.paymentMethod === "COD" ? "Cash on Delivery" : "Credit Card"}</span>
                </div>
                <div>
                  <span className="receipt-label">Payment Status</span>
                  <span className={`badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="receipt-delivery-box">
                <h4>Fulfillment Status</h4>
                <p>Your package status is currently marked as <span className={`badge ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span>. Standard courier shipping has been dispatched to your registered address.</p>
              </div>

              <hr className="divider" />

              <div className="receipt-total-row">
                <span>Total Amount Charged</span>
                <span className="receipt-amount">₹{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary-outline btn-sm" onClick={() => window.print()}>
                Print Invoice
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedOrder(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
