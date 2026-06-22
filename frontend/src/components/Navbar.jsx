import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/cartService";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (token) {
      getCart()
        .then((res) => {
          setCartCount(res.data.length);
        })
        .catch((err) => console.log("Failed to fetch cart count:", err));
    } else {
      setCartCount(0);
    }
  }, [token, location.pathname]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu}>
            <span>Ranjan</span>Buy
          </Link>
        </div>

        {/* Hamburger Menu Icon */}
        <button className="menu-toggle-btn" onClick={() => setOpen(!open)} aria-label="Toggle Navigation">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>

        {/* Links */}
        <div className={open ? "nav-menu active" : "nav-menu"}>
          <Link to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"} onClick={closeMenu}>
            Home
          </Link>
          <Link to="/products" className={location.pathname === "/products" ? "nav-link active" : "nav-link"} onClick={closeMenu}>
            Shop
          </Link>

          {token && (
            <>
              <Link to="/wishlist" className={location.pathname === "/wishlist" ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                Wishlist
              </Link>
              <Link to="/orders" className={location.pathname === "/orders" ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                Orders
              </Link>
            </>
          )}

          {token && role === "ADMIN" && (
            <Link to="/admin" className={location.pathname === "/admin" ? "nav-link admin-badge active" : "nav-link admin-badge"} onClick={closeMenu}>
              Admin Panel
            </Link>
          )}

          <div className="nav-actions">
            {token && (
              <Link to="/cart" className="cart-icon-wrapper" onClick={closeMenu} aria-label="View Cart">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
              </Link>
            )}

            {!token ? (
              <div className="auth-btns">
                <Link to="/login" className="btn btn-secondary-outline" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                  Register
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
