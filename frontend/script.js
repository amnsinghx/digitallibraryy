const API_URL = "/api";

let currentRole = "member";
let allBooks = [];

// ===============================
// AUTH & LIBRARY ELEMENTS
// ===============================

const authPage = document.getElementById("authPage");
const libraryPage = document.getElementById("libraryPage");

const loginView = document.getElementById("loginView");
const registerView = document.getElementById("registerView");
const forgotView = document.getElementById("forgotView");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");

const roleButtons = document.querySelectorAll(
  ".role-buttons .role"
);

// ===============================
// SHOW REGISTER
// ===============================

document
  .getElementById("showRegister")
  .addEventListener("click", () => {
    loginView.classList.add("hidden");
    registerView.classList.remove("hidden");
  });

// ===============================
// SHOW FORGOT PASSWORD
// ===============================

document
  .getElementById("showForgot")
  .addEventListener("click", () => {
    loginView.classList.add("hidden");
    forgotView.classList.remove("hidden");
  });

// ===============================
// BACK BUTTONS
// ===============================

document.querySelectorAll(".back-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    registerView.classList.add("hidden");
    forgotView.classList.add("hidden");
    loginView.classList.remove("hidden");
  });
});

// ===============================
// ROLE SELECTION
// ===============================

roleButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    roleButtons.forEach((b) =>
      b.classList.remove("active")
    );

    e.target.classList.add("active");

    currentRole =
      e.target.getAttribute("data-role");
  });
});

// ===============================
// PASSWORD SHOW / HIDE
// ===============================

document
  .querySelectorAll(".toggle-password")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId =
        btn.getAttribute("data-target");

      const input =
        document.getElementById(targetId);

      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        btn.innerText = "🙈";
      } else {
        input.type = "password";
        btn.innerText = "👁️";
      }
    });
  });

// ===============================
// REGISTER
// ===============================

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName =
    document.getElementById("registerName").value.trim();

  const email =
    document.getElementById("registerEmail").value.trim();

  const password =
    document.getElementById("registerPassword").value;

  const messageEl =
    document.getElementById("registerMessage");

  messageEl.innerText =
    "Creating account...";

  try {
    const res = await fetch(
      `${API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          password
        })
      }
    );

    const data = await res.json();

    messageEl.innerText =
      data.message || "Registration completed.";

    if (res.ok) {
      registerForm.reset();

      setTimeout(() => {
        registerView.classList.add("hidden");
        loginView.classList.remove("hidden");
        messageEl.innerText = "";
      }, 2000);
    }

  } catch (error) {
    console.error("Register Error:", error);

    messageEl.innerText =
      "Server error. Try again.";
  }
});

// ===============================
// LOGIN
// ===============================

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  const messageEl =
    document.getElementById("loginMessage");

  messageEl.innerText =
    "Logging in...";

  try {
    const res = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          loginRole: currentRole
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      messageEl.innerText =
        data.message || "Login failed.";
      return;
    }

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    messageEl.innerText =
      "Login successful!";

    showLibrary(data.user);

  } catch (error) {
    console.error("Login Error:", error);

    messageEl.innerText =
      "Login failed. Check server.";
  }
});

// ===============================
// FORGOT PASSWORD
// ===============================

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email =
    document.getElementById("forgotEmail").value.trim();

  const messageEl =
    document.getElementById("forgotMessage");

  messageEl.innerText =
    "Sending reset link...";

  try {
    const res = await fetch(
      `${API_URL}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        })
      }
    );

    const data = await res.json();

    messageEl.innerText =
      data.message ||
      "Reset link request completed.";

  } catch (error) {
    console.error(
      "Forgot Password Error:",
      error
    );

    messageEl.innerText =
      "Error sending reset email.";
  }
});

// ===============================
// NAVIGATION
// ===============================

const navLinks =
  document.querySelectorAll(".nav-link");

const views =
  document.querySelectorAll(".view");

function switchView(viewId) {
  views.forEach((view) => {
    view.classList.add("hidden");
  });

  const targetView =
    document.getElementById(viewId);

  if (targetView) {
    targetView.classList.remove("hidden");
  }

  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("data-view") === viewId
    );
  });

  const sidebar =
    document.querySelector(".sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    switchView(
      link.getAttribute("data-view")
    );
  });
});

document
  .querySelectorAll("[data-goto]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      switchView(
        btn.getAttribute("data-goto")
      );
    });
  });

// ===============================
// SIDEBAR TOGGLE
// ===============================

const sidebarToggle =
  document.getElementById("sidebarToggle");

if (sidebarToggle) {
  sidebarToggle.addEventListener(
    "click",
    () => {
      const sidebar =
        document.querySelector(".sidebar");

      if (sidebar) {
        sidebar.classList.toggle("open");
      }
    }
  );
}

// ===============================
// THEME
// ===============================

const themeToggle =
  document.getElementById("themeToggle");

function applyTheme(theme) {
  document.documentElement.setAttribute(
    "data-theme",
    theme
  );

  if (themeToggle) {
    themeToggle.innerText =
      theme === "dark"
        ? "☀️"
        : "🌙";
  }

  localStorage.setItem(
    "theme",
    theme
  );
}

if (themeToggle) {
  themeToggle.addEventListener(
    "click",
    () => {
      const current =
        document.documentElement.getAttribute(
          "data-theme"
        ) || "light";

      applyTheme(
        current === "dark"
          ? "light"
          : "dark"
      );
    }
  );
}

applyTheme(
  localStorage.getItem("theme") ||
  "light"
);

// ===============================
// SHOW LIBRARY
// ===============================

function showLibrary(user) {
  authPage.classList.add("hidden");
  libraryPage.classList.remove("hidden");

  const userName =
    document.getElementById("userName");

  const userRole =
    document.getElementById("userRole");

  if (userName) {
    userName.innerText =
      user.name || user.email;
  }

  if (userRole) {
    userRole.innerText =
      user.role || "member";
  }

  switchView("dashboardView");

  fetchBooks();
}

// ===============================
// BOOK CARD
// ===============================

function renderBookCard(book) {
  const pdfUrl =
    book.book_url ||
    book.pdf_url ||
    book["BOOK URL"];

  return `
    <div class="book-card">

      <h3>
        📖 ${book.title || "Untitled Book"}
      </h3>

      <p>
        <strong>Author:</strong>
        ${book.author || "Unknown"}
      </p>

      ${
        book.description
          ? `<p>${book.description}</p>`
          : ""
      }

      ${
        pdfUrl
          ? `
            <a
              href="${pdfUrl}"
              target="_blank"
              class="read-button"
            >
              Read PDF 📖
            </a>
          `
          : `
            <p class="no-pdf">
              No PDF Link available
            </p>
          `
      }

    </div>
  `;
}

// ===============================
// GET BOOKS
// ===============================

async function fetchBooks() {
  const bookList =
    document.getElementById("bookList");

  const featuredList =
    document.getElementById(
      "featuredBookList"
    );

  if (bookList) {
    bookList.innerHTML =
      "<p>Loading books...</p>";
  }

  if (featuredList) {
    featuredList.innerHTML =
      "<p>Loading books...</p>";
  }

  try {
    const res = await fetch(
      `${API_URL}/books`
    );

    const books =
      await res.json();

    if (
      !res.ok ||
      !Array.isArray(books) ||
      books.length === 0
    ) {
      if (bookList) {
        bookList.innerHTML =
          "<p>No books available.</p>";
      }

      if (featuredList) {
        featuredList.innerHTML =
          "<p>No books available.</p>";
      }

      const total =
        document.getElementById(
          "statTotalBooks"
        );

      if (total) {
        total.innerText = "0";
      }

      return;
    }

    allBooks = books;

    if (bookList) {
      bookList.innerHTML =
        books
          .map(renderBookCard)
          .join("");
    }

    if (featuredList) {
      featuredList.innerHTML =
        books
          .slice(0, 3)
          .map(renderBookCard)
          .join("");
    }

    const total =
      document.getElementById(
        "statTotalBooks"
      );

    if (total) {
      total.innerText =
        books.length;
    }

  } catch (error) {
    console.error(
      "Books Error:",
      error
    );

    if (bookList) {
      bookList.innerHTML =
        "<p>Failed to load books.</p>";
    }

    if (featuredList) {
      featuredList.innerHTML =
        "<p>Failed to load books.</p>";
    }
  }
}

// ===============================
// LOGOUT
// ===============================

const logoutButton =
  document.getElementById(
    "logoutButton"
  );

if (logoutButton) {
  logoutButton.addEventListener(
    "click",
    () => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      libraryPage.classList.add(
        "hidden"
      );

      authPage.classList.remove(
        "hidden"
      );

      loginView.classList.remove(
        "hidden"
      );

      registerView.classList.add(
        "hidden"
      );

      forgotView.classList.add(
        "hidden"
      );
    }
  );
}

// ===============================
// AUTO LOGIN
// ===============================

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {
      try {
        const user =
          JSON.parse(savedUser);

        showLibrary(user);

      } catch (error) {
        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "token"
        );
      }
    }
  }
);