import { toast } from "react-toastify";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await registerUser({
        name,
        email,
        password,
        role: "USER",
      });

      toast.success("Account created successfully. Please login.");
      setSuccessMessage("Registration Successful!");
      
      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);

      if (error.response && error.response.data && typeof error.response.data === 'string') {
        toast.error(error.response.data);
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: "400px", margin: "auto" }}>
        <h1>Register</h1>
        
        {successMessage && <div style={{ color: "green", marginBottom: "15px", textAlign: "center", fontWeight: "bold", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "5px", border: "1px solid #c8e6c9" }}>{successMessage}</div>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
