import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout({ children }) {
  return (
    <div>
      <Navbar />

      <main style={{ minHeight: "80vh", padding: "20px" }}>{children}</main>

      <Footer />
    </div>
  );
}

export default MainLayout;
