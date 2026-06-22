import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getAllUsers,
  getAllOrders,
  deleteUser,
  updateOrderStatus,
} from "../services/adminService";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../services/productService";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Product Modals & Form State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("Mobile");
  const [prodImageFile, setProdImageFile] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        getAllUsers(),
        getAllOrders(),
        getProducts(),
      ]);
      setUsers(usersRes.data || []);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // User deletion
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteUser(userId);
      toast.success("User deleted successfully.");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user.");
    }
  };

  // Order status update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status.");
    }
  };

  // Product deletion
  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully.");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  // Open product form modal for Add
  const openAddModal = () => {
    setEditingProduct(null);
    setProdName("");
    setProdPrice("");
    setProdCategory("Mobile");
    setProdImageFile(null);
    setProductModalOpen(true);
  };

  // Open product form modal for Edit
  const openEditModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdCategory(product.category || "Mobile");
    setProdImageFile(null);
    setProductModalOpen(true);
  };

  // Submit Product Form (Add or Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!prodName.trim()) {
      toast.error("Product Name is required");
      return;
    }
    if (!prodPrice || Number(prodPrice) <= 0) {
      toast.error("Valid Product Price is required");
      return;
    }

    try {
      setSubmittingProduct(true);

      if (editingProduct) {
        // Edit Product (Backend updates name and price)
        const updateRes = await updateProduct(editingProduct.id, {
          name: prodName,
          price: Number(prodPrice),
        });

        // If there's an image file selected, upload it
        if (prodImageFile) {
          toast.info("Uploading image, please wait...");
          await uploadProductImage(editingProduct.id, prodImageFile);
        }

        toast.success("Product updated successfully!");
      } else {
        // Add Product
        const addRes = await addProduct({
          name: prodName,
          price: Number(prodPrice),
          category: prodCategory,
          imageUrl: "", // will be set by image upload
        });

        const createdProduct = addRes.data;

        // If there's an image file selected, upload it
        if (prodImageFile && createdProduct?.id) {
          toast.info("Uploading image to Cloudinary...");
          await uploadProductImage(createdProduct.id, prodImageFile);
        }

        toast.success("Product added successfully!");
      }

      setProductModalOpen(false);
      // Reload products list
      const productsRes = await getProducts();
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Calculations for Stats
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page-container admin-portal-layout">
      <h1 className="page-title">Admin Management Portal</h1>
      <p className="page-subtitle">Oversee inventory, manage orders, and moderate users</p>

      {/* Tabs Selector */}
      <div className="admin-tabs-nav">
        <button
          className={activeTab === "overview" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "products" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("products")}
        >
          Manage Products
        </button>
        <button
          className={activeTab === "orders" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("orders")}
        >
          Manage Orders
        </button>
        <button
          className={activeTab === "users" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>
      </div>

      {/* OVERVIEW PANEL */}
      {activeTab === "overview" && (
        <div className="admin-tab-panel animate-fade-in">
          {/* Stats Cards Row */}
          <div className="admin-stats-grid">
            <div className="card stat-card">
              <div className="stat-icon-wrapper text-mobile">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{users.length}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper text-laptop">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">{orders.length}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper text-accessories">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">₹{totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper text-primary">
                <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-label">Active Catalog</span>
                <span className="stat-value">{products.length} Items</span>
              </div>
            </div>
          </div>

          <div className="card mt-md">
            <h3>Recent Store Activity</h3>
            <p className="text-muted mt-sm">Admin operations are online. DB matches status 200 OK. Standard SMTP mail notifications are configured for order updates.</p>
          </div>
        </div>
      )}

      {/* PRODUCTS PANEL */}
      {activeTab === "products" && (
        <div className="admin-tab-panel animate-fade-in">
          <div className="panel-actions-bar">
            <h3>Store Inventory</h3>
            <button className="btn btn-primary" onClick={openAddModal}>
              + Add New Product
            </button>
          </div>

          <div className="orders-table-wrapper card mt-sm">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src={product.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=100&auto=format&fit=crop"}
                          alt={product.name}
                          className="admin-prod-thumb"
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <div className="text-muted small">ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-category-pill">{product.category || "General"}</span>
                    </td>
                    <td>₹{product.price.toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary-outline btn-sm"
                        onClick={() => openEditModal(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-logout btn-sm"
                        style={{ marginLeft: "8px" }}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS PANEL */}
      {activeTab === "orders" && (
        <div className="admin-tab-panel animate-fade-in">
          <h3>Customer Orders</h3>
          
          <div className="orders-table-wrapper card mt-sm">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>User #{order.userId}</td>
                    <td><strong>₹{order.totalAmount.toLocaleString()}</strong></td>
                    <td>
                      <span className={order.paymentStatus === "PAID" ? "badge badge-success" : "badge badge-warning"}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status || "PLACED"}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="admin-status-dropdown"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS PANEL */}
      {activeTab === "users" && (
        <div className="admin-tab-panel animate-fade-in">
          <h3>Registered Users</h3>

          <div className="orders-table-wrapper card mt-sm">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Account Role</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.role === "ADMIN" ? "badge badge-success" : "badge badge-secondary"}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-logout btn-sm"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.role === "ADMIN"} // Prevent self-deletion / admin locks
                      >
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT FORM MODAL */}
      {productModalOpen && (
        <div className="modal-overlay animate-fade-in" onClick={() => setProductModalOpen(false)}>
          <div className="card modal-content-card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? `Edit ${editingProduct.name}` : "Add New Product"}</h2>
              <button className="btn-close-modal" onClick={() => setProductModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="modal-body">
                <div className="form-group col-12">
                  <label htmlFor="prod-name">Product Name</label>
                  <input
                    id="prod-name"
                    type="text"
                    placeholder="e.g. iPhone 15 Pro"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    disabled={submittingProduct}
                  />
                </div>

                <div className="form-group col-12">
                  <label htmlFor="prod-price">Price (₹)</label>
                  <input
                    id="prod-price"
                    type="number"
                    placeholder="e.g. 129000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    disabled={submittingProduct}
                  />
                </div>

                {!editingProduct && (
                  <div className="form-group col-12">
                    <label htmlFor="prod-cat">Category</label>
                    <select
                      id="prod-cat"
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      disabled={submittingProduct}
                    >
                      <option value="Mobile">Mobile</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                )}

                <div className="form-group col-12">
                  <label htmlFor="prod-image">Product Image File (Cloudinary Upload)</label>
                  <input
                    id="prod-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProdImageFile(e.target.files[0])}
                    disabled={submittingProduct}
                    style={{ padding: "8px 0" }}
                  />
                  {editingProduct && (
                    <p className="text-muted small">
                      Leave empty to retain original product thumbnail:{" "}
                      <a href={editingProduct.imageUrl} target="_blank" rel="noreferrer">
                        View Image
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary-outline btn-sm"
                  onClick={() => setProductModalOpen(false)}
                  disabled={submittingProduct}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingProduct}>
                  {submittingProduct ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
