import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyDKhpPVaQvAiQsQWJov2UrUOU4ujv0bCNY",
  authDomain: "expense-tracker-32d65.firebaseapp.com",
   databaseURL: "https://expense-tracker-32d65-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "expense-tracker-32d65",
  storageBucket: "expense-tracker-32d65.firebasestorage.app",
  messagingSenderId: "135202334246",
  appId: "1:135202334246:web:e4d58dddf1e8f67f7b68e7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const nameDisplay = document.getElementById('nameDisplay');
const emailDisplay = document.getElementById('emailDisplay');

const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');

const nameInput = document.getElementById('name');
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');

const logoutBtn = document.getElementById('logoutBtn');

let currentUser = null;

// Check user logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    nameDisplay.textContent = user.displayName || "User";
    emailDisplay.textContent = user.email;

    nameInput.value = user.displayName || "";
  } else {
    window.location.href = "login.html";
  }
});

// Update profile name
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await updateProfile(auth.currentUser, { displayName: nameInput.value });
    alert("Profile updated successfully!");
    nameDisplay.textContent = nameInput.value;
  } catch (error) {
    alert(error.message);
  }
});

// Change password
passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword.value);

  try {
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword.value);
    alert("Password changed successfully!");
    currentPassword.value = "";
    newPassword.value = "";
  } catch (error) {
    alert(error.message);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
