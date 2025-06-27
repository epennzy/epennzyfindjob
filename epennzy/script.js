// Configuration
const CONFIG = {
  SHEET_URL: "https://api.sheetbest.com/sheets/f046c6f6-2a09-44f9-8195-23d42d4038aa",
  CACHE_TTL: 15 * 60 * 1000, // 15 minutes
  DEFAULT_SORT: "asc"
};

// State Management
let state = {
  jobs: [],
  filteredJobs: [],
  sortOrder: CONFIG.DEFAULT_SORT,
  theme: localStorage.getItem("theme") || 
         (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
};

// DOM Elements
const DOM = {
  jobList: document.getElementById("jobList"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortBtn: document.getElementById("sortBtn"),
  themeToggle: document.getElementById("themeToggle"),
  modal: document.getElementById("modal"),
  backToTop: document.getElementById("backToTop"),
  noResults: document.getElementById("noResults")
};

// Initialize App
async function init() {
  setupEventListeners();
  applyTheme();
  await loadJobs();
  renderJobList();
}

// Event Listeners
function setupEventListeners() {
  // Search and Filter
  DOM.searchInput.addEventListener("input", debounce(filterJobs, 300));
  DOM.categoryFilter.addEventListener("change", filterJobs);
  
  // Buttons
  DOM.sortBtn.addEventListener("click", toggleSort);
  DOM.themeToggle.addEventListener("click", toggleTheme);
  document.querySelector(".modal-close").addEventListener("click", closeModal);
  
  // Back to Top
  DOM.backToTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  
  // Window Events
  window.addEventListener("scroll", toggleBackToTop);
  window.addEventListener("keydown", handleKeyboardShortcuts);
}

// Data Loading
async function loadJobs() {
  try {
    const cachedData = getCachedData();
    if (cachedData) {
      state.jobs = cachedData;
      return;
    }
    
    const response = await fetch(CONFIG.SHEET_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    state.jobs = data.filter(job => job.status?.toLowerCase() === "on");
    cacheData(state.jobs);
  } catch (error) {
    console.error("Failed to load jobs:", error);
    showError("Gagal memuat data. Silakan coba lagi nanti.");
  }
}

// Rendering
function renderJobList(jobs = state.jobs) {
  if (!jobs.length) {
    DOM.noResults.style.display = "block";
    DOM.jobList.innerHTML = "";
    return;
  }
  
  DOM.noResults.style.display = "none";
  DOM.jobList.innerHTML = jobs.map(job => `
    <div class="job-card" data-category="${job.category?.toLowerCase()}" data-pay="${parseInt(job.pay) || 0}">
      <h2>${job.title || "No Title"}
        ${job.verified?.toLowerCase() === "yes" ? '<span class="verified">Verified</span>' : ''}
      </h2>
      <p><strong>Bayaran:</strong> Rp${formatCurrency(job.pay || 0)}</p>
      <p><em>Syarat:</em> ${job.syarat || "Tidak ada syarat khusus"}</p>
      <p class="description">${job.description || "Tidak ada deskripsi"}</p>
      <div class="job-actions">
        <button class="btn-primary" data-job='${JSON.stringify(job)}'>Detail</button>
        <a href="${job.link || "#"}" target="_blank" class="btn-primary">Apply</a>
      </div>
    </div>
  `).join("");
  
  // Add event listeners to detail buttons
  document.querySelectorAll("[data-job]").forEach(btn => {
    btn.addEventListener("click", () => {
      const jobData = JSON.parse(btn.getAttribute("data-job"));
      openModal(jobData);
    });
  });
}

// Helper Functions
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function formatCurrency(amount) {
  return parseInt(amount).toLocaleString("id-ID");
}

// Run the app
document.addEventListener("DOMContentLoaded", init);