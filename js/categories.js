// js/categories.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const categoryInput = document.getElementById('categoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryList = document.getElementById('categoryList');

let categories = [];
let currentUserUid = null;

// Save categories
function saveCategories() {
  if (!currentUserUid) return;
  localStorage.setItem(`categories_${currentUserUid}`, JSON.stringify(categories));
}

// Render category list
function renderCategories() {
  categoryList.innerHTML = '';
  categories.forEach((cat, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${cat}</span> <button onclick="deleteCategory(${index})">Delete</button>`;
    categoryList.appendChild(li);
  });

  // Update Home page dropdown if exists
  const homeSelect = document.getElementById("category");
  if (homeSelect) {
    homeSelect.innerHTML = `<option value="">Select Category</option>`;
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      homeSelect.appendChild(option);
    });
  }
}

// Add category
addCategoryBtn.addEventListener('click', () => {
  const value = categoryInput.value.trim();
  if (!value) return alert('Category name cannot be empty');
  if (categories.includes(value)) return alert('Category already exists');

  categories.push(value);
  saveCategories();
  renderCategories();
  categoryInput.value = '';
});

// Delete category
window.deleteCategory = function(index) {
  if (!confirm('Delete this category?')) return;
  categories.splice(index, 1);
  saveCategories();
  renderCategories();
}

// Load user categories
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUserUid = user.uid;
  categories = JSON.parse(localStorage.getItem(`categories_${currentUserUid}`)) || [
    "Housing","Utilities","Transportation","Groceries","Entertainment","Health","Education","Others"
  ];
  renderCategories();
});
