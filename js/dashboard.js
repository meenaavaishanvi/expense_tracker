// js/dashboard.js

import {
  auth,
  db,
  ref,
  push,
  set,
  onValue
} from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// ===============================
// DOM Elements
// ===============================
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
// Variables
// ===============================
let currentUserUid = null;
let categories = [];
let transactions = [];

// ===============================
// Utility
// ===============================
function generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

// ===============================
// Modal
// ===============================
openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

// ===============================
// Categories
// ===============================
function renderCategories() {

    categorySelect.innerHTML =
        `<option value="">Select Category</option>`;

    categories.forEach(cat => {

        const option = document.createElement("option");

        option.value = cat;
        option.textContent = cat;

        categorySelect.appendChild(option);

    });

}

// ===============================
// Firebase Transactions
// ===============================
function loadUserTransactions(uid) {

    currentUserUid = uid;

    const transactionRef =
        ref(db, "users/" + uid + "/transactions");

    onValue(transactionRef, (snapshot) => {

        transactions = [];

        snapshot.forEach((child) => {

            transactions.push({

                firebaseKey: child.key,
                ...child.val()

            });

        });

        updateUI();

    });

}

function saveTransaction(transaction) {

    const transactionRef =
        ref(db, "users/" + currentUserUid + "/transactions");

    const newRef = push(transactionRef);

    set(newRef, transaction);

}

// ===============================
// Update UI
// ===============================
function updateUI() {

    let total = 0;
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {

        if (t.type === "income") {
            income += Number(t.amount);
            total += Number(t.amount);
        } else {
            expense += Number(t.amount);
            total -= Number(t.amount);
        }

    });

    balanceEl.textContent = `₹${total.toFixed(2)}`;
    incomeEl.textContent = `₹${income.toFixed(2)}`;
    expenseEl.textContent = `₹${expense.toFixed(2)}`;

    transactionList.innerHTML = "";

    const sortedTransactions = [...transactions].sort(
        (a, b) => b.timestamp - a.timestamp
    );

    sortedTransactions.forEach((t) => {

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
                ${t.type === "income" ? "+" : "-"}₹${Number(t.amount).toFixed(2)}
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
        alert("Please enter valid details.");
        return;
    }

    if (type === "expense" && category === "") {
        alert("Please select a category.");
        return;
    }

    const transaction = {

        id: generateId(),

        type: type,

        amount: amount,

        category: type === "expense" ? category : "",

        date: date,

        timestamp: Date.now()

    };

    saveTransaction(transaction);

    transactionForm.reset();

    modal.style.display = "none";

});
