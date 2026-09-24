const API_URL = "http://localhost:5000/api";
let currentRole = "member";
let allBooks = [];

const authPage = document.getElementById("authPage");
const libraryPage = document.getElementById("libraryPage");

const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");
const forgotView = document.getElementById("forgotView");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");

const roleButtons = document.querySelectorAll(".role-buttons .role");

document.getElementById("showRegister").addEventListener("click", () => {
  loginView.classList.add("hidden");
  registerView.classList.remove("hidden");
});

document.getElementById("showForgot").addEventListener("click", () => {
  loginView.classList.add("hidden");
  forgotView.classList.remove("hidden");
});

document.querySelectorAll(".back-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    registerView.classList.add("hidden");
    forgotView.classList.add("hidden");
    loginView.classList.remove("hidden");
  });
});

roleButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    roleButtons.forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    currentRole = e.target.getAttribute("data-role");
  });
});

// --- PASSWORD SHOW/HIDE TOGGLE ---
document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (input.type === "password") {
      input.type = "text";
      btn.innerText = "🙈";
    } else {
      input.type = "password";
      btn.innerText = "👁️";
    }
  });
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullName = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const messageEl = document.getElementById("registerMessage");

  messageEl.innerText = "Creating account...";

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await res.json();
    messageEl.innerText = data.message;

    if (res.ok) {
      registerForm.reset();
      setTimeout(() => {
        registerView.classList.add("hidden");
        loginView.classList.remove("hidden");
        messageEl.innerText = "";
      }, 2000);
    }
  } catch (err) {
    messageEl.innerText = "Server error. Try again.";
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const messageEl = document.getElementById("loginMessage");

  messageEl.innerText = "Logging in...";

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, loginRole: currentRole })
    });

    const data = await res.json();

    if (!res.ok) {
      messageEl.innerText = data.message;
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showLibrary(data.user);
  } catch (err) {
    messageEl.innerText = "Login failed. Check server.";
  }
});

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value;
  const messageEl = document.getElementById("forgotMessage");

  messageEl.innerText = "Sending reset link...";

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    messageEl.innerText = data.message;
  } catch (err) {
    messageEl.innerText = "Error sending reset email.";
  }
});

const navLinks = document.querySelectorAll(".nav-link");
const views = document.querySelectorAll(".view");

function switchView(viewId) {
  views.forEach((v) => v.classList.add("hidden"));
  document.getElementById(viewId).classList.remove("hidden");

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-view") === viewId);
  });

  document.querySelector(".sidebar").classList.remove("open");
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => switchView(link.getAttribute("data-view")));
});

document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.getAttribute("data-goto")));
});

document.getElementById("sidebarToggle").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.innerText = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "dark" ? "light" : "dark");
});

applyTheme(localStorage.getItem("theme") || "light");

function showLibrary(user) {
  authPage.classList.add("hidden");
  libraryPage.classList.remove("hidden");

  document.getElementById("userName").innerText = user.name || user.email;
  document.getElementById("userRole").innerText = user.role;

  switchView("dashboardView");
  fetchBooks();
}

function renderBookCard(book) {
  const pdfUrl = book.book_url || book.pdf_url || book["BOOK URL"];
  return `
    <div class="book-card">
      <h3>📖 ${book.title || "Untitled Book"}</h3>
      <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
      ${book.description ? `<p>${book.description}</p>` : ""}
      ${
        pdfUrl
          ? `<a href="${pdfUrl}" target="_blank" class="read-button">Read PDF 📖</a>`
          : '<p class="no-pdf">No PDF Link available</p>'
      }
    </div>
  `;
}

async function fetchBooks() {
  const bookList = document.getElementById("bookList");
  const featuredList = document.getElementById("featuredBookList");
  bookList.innerHTML = "<p>Loading books...</p>";
  featuredList.innerHTML = "<p>Loading books...</p>";

  try {
    const res = await fetch(`${API_URL}/books`);
    const books = await res.json();

    if (!res.ok || !books.length) {
      bookList.innerHTML = "<p>No books available.</p>";
      featuredList.innerHTML = "<p>No books available.</p>";
      document.getElementById("statTotalBooks").innerText = "0";
      return;
    }

    allBooks = books;

    bookList.innerHTML = books.map(renderBookCard).join("");
    featuredList.innerHTML = books.slice(0, 3).map(renderBookCard).join("");

    document.getElementById("statTotalBooks").innerText = books.length;
  } catch (err) {
    bookList.innerHTML = "<p>Failed to load books.</p>";
    featuredList.innerHTML = "<p>Failed to load books.</p>";
  }
}

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  libraryPage.classList.add("hidden");
  authPage.classList.remove("hidden");
});

window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    showLibrary(user);
  }
});