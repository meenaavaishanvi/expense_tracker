import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const expenseTableBody = document.getElementById("expenseTableBody");
  const monthlyTableBody = document.getElementById("monthlyTableBody");
  const expensePieChartEl = document.getElementById("expensePieChart");
  const noPieDataMsg = document.getElementById("noPieData");
  const monthlyBarChartEl = document.getElementById("monthlyBarChart");

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Load transactions from localStorage or fallback dummy data
    let transactions = JSON.parse(localStorage.getItem(`transactions_${user.uid}`)) || [];

    if (transactions.length === 0) {
      transactions = [
        { type: "expense", category: "Groceries", amount: 1500, date: "2026-01-10" },
        { type: "expense", category: "Transport", amount: 800, date: "2026-01-12" },
        { type: "income", amount: 5000, date: "2026-01-05" },
        { type: "expense", category: "Utilities", amount: 1200, date: "2026-01-20" },
      ];
    }

    // Expense Breakdown
    const categories = [
      "Housing",
      "Utilities",
      "Transportation",
      "Groceries",
      "Entertainment",
      "Health",
      "Education",
      "Debt Payments",
      "Others",
    ];

    const categoryTotals = {};
    categories.forEach((cat) => (categoryTotals[cat] = 0));

    transactions.forEach((t) => {
      if (t.type === "expense") {
        const cat = t.category && t.category.trim() !== "" && categories.includes(t.category) ? t.category : "Others";
        categoryTotals[cat] += Number(t.amount);
      }
    });

    // Filter non-zero categories
    const filteredCategories = Object.entries(categoryTotals).filter(([_, val]) => val > 0);

    // Fill Expense Table
    expenseTableBody.innerHTML = "";
    filteredCategories.forEach(([cat, total]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${cat}</td><td>₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>`;
      expenseTableBody.appendChild(tr);
    });

    // Pie Chart
    if (filteredCategories.length === 0) {
      expensePieChartEl.style.display = "none";
      noPieDataMsg.style.display = "block";
    } else {
      noPieDataMsg.style.display = "none";
      expensePieChartEl.style.display = "block";
      new Chart(expensePieChartEl.getContext("2d"), {
        type: "pie",
        data: {
          labels: filteredCategories.map(([cat]) => cat),
          datasets: [
            {
              data: filteredCategories.map(([_, val]) => val),
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
                "#C9CBCF",
                "#FF7F50",
                "#8BC34A",
              ],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // Monthly Overview
    const monthLabels = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthlyData = {};
    monthLabels.forEach((_, i) => (monthlyData[i] = { income: 0, expense: 0 }));

    transactions.forEach((t) => {
      if (!t.date) return;
      const month = new Date(t.date).getMonth();
      if (t.type === "income") monthlyData[month].income += Number(t.amount);
      else if (t.type === "expense") monthlyData[month].expense += Number(t.amount);
    });

    // Fill Monthly Table
    monthlyTableBody.innerHTML = "";
    monthLabels.forEach((month, i) => {
      const income = monthlyData[i].income;
      const expense = monthlyData[i].expense;
      const balance = income - expense;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${month}</td>
        <td>₹${income.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td>₹${expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td>₹${balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      `;
      monthlyTableBody.appendChild(tr);
    });

    // Monthly Bar Chart
    new Chart(monthlyBarChartEl.getContext("2d"), {
      type: "bar",
      data: {
        labels: monthLabels,
        datasets: [
          { label: "Income", data: monthLabels.map((_, i) => monthlyData[i].income), backgroundColor: "#27ae60" },
          { label: "Expense", data: monthLabels.map((_, i) => monthlyData[i].expense), backgroundColor: "#c0392b" },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => `₹${v}` } },
        },
      },
    });
  });
});
