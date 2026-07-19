// js/dashboard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// DOM Elements
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionList = document.getElementById("transactionList");
const transactionForm = document.getElementById("transactionForm");
const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const modal = document.getElementById("transactionModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// ===============================
// Utility
// ===============================
function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// ===============================
// Modal handling
// ===============================
openModalBtn.addEventListener("click", () => (modal.style.display = "flex"));
closeModalBtn.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// ===============================
// Categories
// ===============================
let categories = [];
let currentUserUid = null;

function saveCategories() {
  if (!currentUserUid) return;
  localStorage.setItem(`categories_${currentUserUid}`, JSON.stringify(categories));
}

function renderCategories() {
  categorySelect.innerHTML = `<option value="">Select Category</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ===============================
// Transactions
// ===============================
let transactions = [];

function loadUserTransactions(uid) {
  currentUserUid = uid;
  transactions = JSON.parse(localStorage.getItem(`transactions_${uid}`)) || [];

  // Add timestamp for old data
  transactions = transactions.map((t) => ({
    ...t,
    timestamp: t.timestamp || new Date(t.date).getTime(),
  }));
}

function saveTransactions() {
  if (!currentUserUid) return;
  localStorage.setItem(
    `transactions_${currentUserUid}`,
    JSON.stringify(transactions)
  );
}

// ===============================
// Update UI
// ===============================
function updateUI() {
  let total = 0,
    income = 0,
    expense = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
      total += t.amount;
    } else {
      expense += t.amount;
      total -= t.amount;
    }
  });

  balanceEl.textContent = `₹${total.toFixed(2)}`;
  incomeEl.textContent = `₹${income.toFixed(2)}`;
  expenseEl.textContent = `₹${expense.toFixed(2)}`;

  transactionList.innerHTML = "";

  const sorted = [...transactions].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  sorted.forEach((t) => {
    const li = document.createElement("li");
    li.classList.add(t.type);

    const categoryHTML =
      t.type === "expense"
        ? `<span class="separator"> — </span><span class="category">${t.category}</span>`
        : "";

    li.innerHTML = `
      <div class="details">
        <strong>${t.type.toUpperCase()}</strong>
        <span class="separator"> — </span>
        <span>${new Date(t.date).toLocaleDateString()}</span>
        ${categoryHTML}
      </div>
      <div class="amount ${t.type}">
        ${t.type === "income" ? "+" : "-"}₹${t.amount.toFixed(2)}
      </div>
    `;

    transactionList.appendChild(li);
  });
}

// ===============================
// Add Transaction
// ===============================
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = typeInput.value;
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const date = dateInput.value;

  if (!date || isNaN(amount) || amount <= 0) {
    alert("Invalid input");
    return;
  }

  if (type === "expense" && !category) {
    alert("Select category for expense");
    return;
  }

  const newTransaction = {
    id: generateId(),
    type,
    amount,
    category: type === "expense" ? category : "",
    date,
    timestamp: Date.now(),
  };

  transactions.push(newTransaction);
  saveTransactions();
  updateUI();

  transactionForm.reset();
  modal.style.display = "none";
});

// ===============================
// Wait for Auth
// ===============================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUserUid = user.uid;

  // Load user categories
  categories =
    JSON.parse(localStorage.getItem(`categories_${currentUserUid}`)) || [
      "Housing",
      "Utilities",
      "Transportation",
      "Groceries",
      "Entertainment",
      "Health",
      "Education",
      "Others",
    ];

  renderCategories();

  // Load user transactions
  loadUserTransactions(currentUserUid);
  updateUI();
});
