// Config with fallback
const CONFIG = {
  API_URL: "https://api.sheetbest.com/sheets/f046c6f6-2a09-44f9-8195-23d42d4038aa",
  FALLBACK_DATA: [
    {
      id: 1,
      title: "KYC Officer (Contoh)",
      pay: "4500000",
      category: "bank",
      status: "on"
    }
  ]
};

// State
let jobs = [];
let sortAsc = true;

// DOM Elements
const DOM = {
  jobList: document.getElementById('jobList'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  themeToggle: document.getElementById('themeToggle'),
  sortBtn: document.getElementById('sortBtn')
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  loadTheme();
  await loadJobs();
  setupEventListeners();
}

function loadTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

async function loadJobs() {
  DOM.jobList.innerHTML = '<div class="loader"></div>';
  
  try {
    const response = await fetch(CONFIG.API_URL);
    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    jobs = data.filter(job => job.status?.toLowerCase() === 'on');
  } catch (error) {
    console.error("Using fallback data:", error);
    jobs = CONFIG.FALLBACK_DATA;
  }
  
  renderJobs();
}

function renderJobs(jobsToRender = jobs) {
  if (!jobsToRender.length) {
    DOM.jobList.innerHTML = '<p class="empty">Tidak ada pekerjaan ditemukan</p>';
    return;
  }

  DOM.jobList.innerHTML = jobsToRender.map(job => `
    <div class="job-card" data-pay="${job.pay || 0}">
      <h3>${job.title || 'Untitled'}</h3>
      <p>Bayaran: Rp${formatCurrency(job.pay || 0)}</p>
      <p>Kategori: ${job.category || '-'}</p>
      <button class="btn" data-id="${job.id}">Detail</button>
    </div>
  `).join('');
}

function formatCurrency(amount) {
  return parseInt(amount).toLocaleString('id-ID');
}

function setupEventListeners() {
  DOM.themeToggle.addEventListener('click', toggleTheme);
  DOM.sortBtn.addEventListener('click', sortJobs);
  DOM.searchInput.addEventListener('input', filterJobs);
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
}

function sortJobs() {
  sortAsc = !sortAsc;
  jobs.sort((a, b) => sortAsc ? (a.pay - b.pay) : (b.pay - a.pay));
  renderJobs();
  DOM.sortBtn.textContent = sortAsc ? 'Urutkan Tertinggi' : 'Urutkan Terendah';
}

function filterJobs() {
  const searchTerm = DOM.searchInput.value.toLowerCase();
  const category = DOM.categoryFilter.value;
  
  const filtered = jobs.filter(job => 
    (job.title?.toLowerCase().includes(searchTerm)) &&
    (category === 'all' || job.category === category)
  );
  
  renderJobs(filtered);
}
