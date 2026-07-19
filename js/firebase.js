// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    set,
    get,
    push,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";



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
const db = getDatabase(app);

export {
    auth,
    db,
    ref,
    set,
    get,
    push,
    update,
    remove,
    onValue
};
