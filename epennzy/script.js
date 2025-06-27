// Config
const CONFIG = {
  API_URL: "https://api.sheetbest.com/sheets/f046c6f6-2a09-44f9-8195-23d42d4038aa"
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

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadJobs();
  setupEventListeners();
});

// Functions
async function loadJobs() {
  try {
    DOM.jobList.innerHTML = '<div class="loader"></div>';
    const res = await fetch(CONFIG.API_URL);
    const data = await res.json();
    jobs = data.filter(job => job.status?.toLowerCase() === 'on');
    renderJobs();
  } catch (err) {
    DOM.jobList.innerHTML = '<p class="error">Gagal memuat data</p>';
  }
}

function renderJobs(jobsToRender = jobs) {
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
  localStorage.setItem('theme', 
    document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

function sortJobs() {
  sortAsc = !sortAsc;
  jobs.sort((a, b) => sortAsc 
    ? (a.pay - b.pay) 
    : (b.pay - a.pay));
  renderJobs();
  DOM.sortBtn.textContent = sortAsc ? 'Urutkan Tertinggi' : 'Urutkan Terendah';
}

function filterJobs() {
  const searchTerm = DOM.searchInput.value.toLowerCase();
  const category = DOM.categoryFilter.value;
  
  const filtered = jobs.filter(job => 
    (job.title?.toLowerCase().includes(searchTerm) &&
    (category === 'all' || job.category === category)
  );
  
  renderJobs(filtered);
}
