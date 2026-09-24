const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const supabase = require("./config/supabase");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. Static Files Serve Karein
app.use(express.static(path.join(__dirname, "frontend")));

// 2. GET BOOKS API
app.get("/api/books", async (req, res) => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
});

// 3. REGISTER API
app.post("/api/auth/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required."
    });
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  res.status(201).json({
    message: "Account created successfully. Please check your email."
  });
});

// 4. LOGIN API
app.post("/api/auth/login", async (req, res) => {
  const { email, password, loginRole } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  // Profile data fetch karein
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .maybeSingle();

  // Fallback values agar profile table row maujood na ho
  const userName = profile?.full_name || data.user.user_metadata?.full_name || email.split("@")[0];
  const userRole = profile?.role || "member";

  if (loginRole === "admin" && userRole !== "admin") {
    return res.status(403).json({
      message: "This account is not an admin account."
    });
  }

  res.json({
    message: "Login successful",
    token: data.session.access_token,
    user: {
      id: data.user.id,
      name: userName,
      email: data.user.email,
      role: userRole
    }
  });
});

// 5. FORGOT PASSWORD API
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5000"
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  res.json({
    message: "Password reset link has been sent to your email."
  });
});

// 6. SPA Catch-All Route (index.html serve karne ke liye)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});