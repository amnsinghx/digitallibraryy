const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const supabase = require("./config/supabase");

const app = express();

app.use(cors());
app.use(express.json());

// Frontend serve
app.use(express.static(path.join(__dirname, "frontend")));

// ===============================
// GET BOOKS
// ===============================
app.get("/api/books", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return res.status(500).json({
        message: error.message
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
});

// ===============================
// REGISTER
// ===============================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(201).json({
      message: "Account created successfully. Please check your email.",
      user: data.user
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error. Try again."
    });
  }
});

// ===============================
// LOGIN
// ===============================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, loginRole } = req.body;

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      return res.status(401).json({
        message: error.message
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", data.user.id)
      .maybeSingle();

    const userName =
      profile?.full_name ||
      data.user.user_metadata?.full_name ||
      email.split("@")[0];

    const userRole =
      profile?.role || "member";

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

  } catch (error) {
    res.status(500).json({
      message: "Server error. Try again."
    });
  }
});

// ===============================
// FORGOT PASSWORD
// ===============================
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://digitallibraryy.vercel.app/"
      });

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.json({
      message: "Password reset link has been sent to your email."
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error. Try again."
    });
  }
});

// ===============================
// FRONTEND
// ===============================
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "index.html")
  );
});

// VERCEL
module.exports = app;