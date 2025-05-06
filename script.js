let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let editIndex = null;
let lastDisplayedData = expenses;

const form = document.getElementById("expense-form");
const tableBody = document.querySelector("#expense-table tbody");
const totalCount = document.getElementById("total-count");
const totalAmount = document.getElementById("total-amount");
const categorySummary = document.getElementById("category-summary");

const filterBtn = document.getElementById("filter-btn");
const resetBtn = document.getElementById("reset-btn");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const expense = {
    title: form.title.value,
    amount: parseFloat(form.amount.value),
    date: form.date.value,
    category: form.category.value,
  };

  if (editIndex !== null) {
    expenses[editIndex] = expense;
    editIndex = null;
  } else {
    expenses.push(expense);
  }

  form.reset();
  saveAndDisplay();
});

filterBtn.addEventListener("click", () => {
  const start = startDate.value;
  const end = endDate.value;
  if (!start || !end) return;

  const filtered = expenses.filter((e) => e.date >= start && e.date <= end);
  displayExpenses(filtered);
  displaySummary(filtered);
  displayTrends(filtered);
});

resetBtn.addEventListener("click", () => {
  startDate.value = "";
  endDate.value = "";
  displayExpenses();
  displaySummary();
  displayTrends();
});

document.getElementById("download-btn").addEventListener("click", () => {
  downloadCSV(lastDisplayedData);
});

function saveAndDisplay() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  displayExpenses();
  displaySummary();
  displayTrends();
}

function displayExpenses(data = expenses) {
  lastDisplayedData = data;
  tableBody.innerHTML = data
    .map((e) => {
      const i = expenses.indexOf(e);
      return `
        <tr>
          <td>${e.title}</td>
          <td>₹${e.amount}</td>
          <td>${e.date}</td>
          <td>${e.category}</td>
          <td>
            <button onclick="editExpense(${i})">Edit</button>
            <button onclick="deleteExpense(${i})">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function displaySummary(data = expenses) {
  totalCount.textContent = data.length;

  let total = 0;
  const summary = {};

  for (const exp of data) {
    total += exp.amount;
    if (!summary[exp.category]) {
      summary[exp.category] = { count: 0, total: 0 };
    }
    summary[exp.category].count++;
    summary[exp.category].total += exp.amount;
  }

  totalAmount.textContent = total.toFixed(2);

  categorySummary.innerHTML = "";
  for (let category in summary) {
    const item = summary[category];
    categorySummary.innerHTML += `<div>${category}: ${item.count} items, ₹${item.total.toFixed(2)}</div>`;
  }
}

function displayTrends(data = expenses) {
  const trendBox = document.getElementById("trend-summary");
  if (!data.length) {
    trendBox.innerHTML = "No expenses to show";
    return;
  }

  let total = 0;
  let max = 0;
  let maxDay = "";
  const dates = new Set();

  for (let exp of data) {
    total += exp.amount;
    dates.add(exp.date);
    if (exp.amount > max) {
      max = exp.amount;
      maxDay = exp.date;
    }
  }
  const avg = total / dates.size;

  trendBox.innerHTML = `
    <p>Total spend: ${total.toFixed(2)}</p>
    <p>Average per day: ${avg.toFixed(2)}</p>
    <p>Biggest expense: ${max.toFixed(2)} on ${maxDay}</p>
  `;
}

function downloadCSV(data) {
  if (!data.length) return alert("No data");

  let csv = "Title,Amount,Date,Category\n" +
    data.map(d => `"${d.title}","${d.amount}","${d.date}","${d.category}"`).join("\n");

  location.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
}

function deleteExpense(i) {
  expenses.splice(i, 1);
  saveAndDisplay();
}

function editExpense(i) {
  const e = expenses[i];
  form.title.value = e.title;
  form.amount.value = e.amount;
  form.date.value = e.date;
  form.category.value = e.category;
  editIndex = i;
}

saveAndDisplay();