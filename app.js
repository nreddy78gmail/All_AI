/**
 * WealthFlow — Net Worth Calculator & Financial Health Tracker
 * Fully responsive client-side application with persistence, charts & reporting.
 */

// --- Currency Configs ---
const CURRENCIES = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  CAD: { symbol: '$', locale: 'en-CA' },
  AUD: { symbol: '$', locale: 'en-AU' },
  INR: { symbol: '₹', locale: 'en-IN' },
  JPY: { symbol: '¥', locale: 'ja-JP' }
};

// --- Category Options ---
const ASSET_CATEGORIES = [
  'Cash & Liquid',
  'Investments',
  'Retirement',
  'Real Estate',
  'Vehicles & Valuables'
];

const LIABILITY_CATEGORIES = [
  'Mortgages',
  'Auto Loans',
  'Student Loans',
  'Credit Cards',
  'Other Debt'
];

// Color mapping for asset charts
const CATEGORY_COLORS = {
  'Cash & Liquid': '#06b6d4',        // cyan-500
  'Investments': '#3b82f6',          // blue-500
  'Retirement': '#8b5cf6',          // violet-500
  'Real Estate': '#10b981',         // emerald-500
  'Vehicles & Valuables': '#f59e0b', // amber-500
  'Mortgages': '#ef4444',            // red-500
  'Auto Loans': '#f97316',           // orange-500
  'Student Loans': '#ec4899',        // pink-500
  'Credit Cards': '#e11d48',         // rose-600
  'Other Debt': '#64748b'            // slate-500
};

// --- Initial Sample Data ---
const SAMPLE_DATA = {
  currency: 'USD',
  assets: [
    { id: 'a1', name: 'Emergency Fund (High-Yield Savings)', category: 'Cash & Liquid', value: 25000 },
    { id: 'a2', name: 'Checking Account', category: 'Cash & Liquid', value: 6500 },
    { id: 'a3', name: 'Index Funds & Equities (VTI/VXUS)', category: 'Investments', value: 72000 },
    { id: 'a4', name: 'Roth IRA & 401(k)', category: 'Retirement', value: 135000 },
    { id: 'a5', name: 'Primary Residence (Market Value)', category: 'Real Estate', value: 450000 },
    { id: 'a6', name: 'Family Vehicle', category: 'Vehicles & Valuables', value: 22000 }
  ],
  liabilities: [
    { id: 'l1', name: 'Primary Home Mortgage', category: 'Mortgages', value: 310000 },
    { id: 'l2', name: 'Vehicle Financing Loan', category: 'Auto Loans', value: 11500 },
    { id: 'l3', name: 'Federal Student Loan', category: 'Student Loans', value: 18000 },
    { id: 'l4', name: 'Monthly Credit Card Balance', category: 'Credit Cards', value: 2400 }
  ],
  snapshots: []
};

// --- Application State ---
let state = {
  currency: 'USD',
  assets: [],
  liabilities: [],
  snapshots: [],
  activeAssetFilter: 'all',
  activeLiabilityFilter: 'all',
  darkMode: false
};

// --- Chart Instances ---
let assetsChartInstance = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
  loadState();
  setupEventListeners();
  renderApp();
});

// --- Local Storage Management ---
function saveState() {
  localStorage.setItem('wealthflow_state', JSON.stringify({
    currency: state.currency,
    assets: state.assets,
    liabilities: state.liabilities,
    snapshots: state.snapshots
  }));
}

function loadState() {
  const saved = localStorage.getItem('wealthflow_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.currency = parsed.currency || 'USD';
      state.assets = parsed.assets || [];
      state.liabilities = parsed.liabilities || [];
      state.snapshots = parsed.snapshots || [];
    } catch (e) {
      console.error('Failed to parse saved state, loading default sample', e);
      loadSampleData(false);
    }
  } else {
    // First time load: provide sample data for immediate satisfaction
    loadSampleData(false);
  }
}

function loadSampleData(shouldRender = true) {
  state.currency = SAMPLE_DATA.currency;
  state.assets = JSON.parse(JSON.stringify(SAMPLE_DATA.assets));
  state.liabilities = JSON.parse(JSON.stringify(SAMPLE_DATA.liabilities));
  state.snapshots = [
    { id: 's1', date: '3 months ago', netWorth: 345000, totalAssets: 680000, totalLiabilities: 335000 },
    { id: 's2', date: '1 month ago', netWorth: 362000, totalAssets: 698000, totalLiabilities: 336000 }
  ];
  saveState();
  if (shouldRender) {
    renderApp();
    triggerConfetti();
  }
}

// --- Theme Management ---
function loadSavedTheme() {
  const isDark = localStorage.getItem('wealthflow_theme') === 'dark' ||
    (!('wealthflow_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  state.darkMode = isDark;
  applyTheme();
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('wealthflow_theme', state.darkMode ? 'dark' : 'light');
  applyTheme();
  renderCharts();
}

function applyTheme() {
  const html = document.documentElement;
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  if (state.darkMode) {
    html.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    html.classList.remove('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

// --- Formatting Helpers ---
function formatCurrency(amount) {
  const conf = CURRENCIES[state.currency] || CURRENCIES.USD;
  return new Intl.NumberFormat(conf.locale, {
    style: 'currency',
    currency: state.currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function getCurrencySymbol() {
  return (CURRENCIES[state.currency] || CURRENCIES.USD).symbol;
}

// --- Calculations ---
function calculateTotals() {
  const totalAssets = state.assets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const totalLiabilities = state.liabilities.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtRatio = totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : '0';

  const liquidCash = state.assets
    .filter(a => a.category === 'Cash & Liquid')
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  return { totalAssets, totalLiabilities, netWorth, debtRatio, liquidCash };
}

// Compute milestone target dynamically
function computeMilestone(netWorth) {
  const milestones = [
    10000, 25000, 50000, 100000, 250000, 500000, 750000,
    1000000, 2000000, 5000000, 10000000
  ];
  if (netWorth <= 0) {
    return { target: 10000, percentage: 0 };
  }
  const nextTarget = milestones.find(m => m > netWorth) || (Math.ceil(netWorth / 1000000) * 1000000 + 1000000);
  const percentage = Math.min(100, Math.max(0, Math.round((netWorth / nextTarget) * 100)));
  return { target: nextTarget, percentage };
}

// --- Rendering ---
function renderApp() {
  const { totalAssets, totalLiabilities, netWorth, debtRatio, liquidCash } = calculateTotals();

  // Currency select & symbols
  document.getElementById('currencySelector').value = state.currency;
  document.querySelectorAll('.currencySymbolDisplay').forEach(el => {
    el.textContent = getCurrencySymbol();
  });

  // KPI displays
  const nwDisplay = document.getElementById('netWorthDisplay');
  nwDisplay.textContent = formatCurrency(netWorth);
  if (netWorth < 0) {
    nwDisplay.classList.add('text-rose-300');
  } else {
    nwDisplay.classList.remove('text-rose-300');
  }

  const healthBadge = document.getElementById('healthBadge');
  if (netWorth > 0) {
    healthBadge.textContent = 'Solvent & Positive';
    healthBadge.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-emerald-100';
  } else if (netWorth === 0) {
    healthBadge.textContent = 'Balanced';
    healthBadge.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-slate-100';
  } else {
    healthBadge.textContent = 'Deficit / In Debt';
    healthBadge.className = 'text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/80 backdrop-blur-sm text-white';
  }

  // Milestone
  const milestone = computeMilestone(netWorth);
  document.getElementById('milestoneTargetText').textContent = formatCurrency(milestone.target);
  document.getElementById('milestonePercent').textContent = `${milestone.percentage}%`;
  document.getElementById('milestoneProgressBar').style.width = `${milestone.percentage}%`;

  // Assets Card
  document.getElementById('totalAssetsDisplay').textContent = formatCurrency(totalAssets);
  document.getElementById('assetCountBadge').textContent = `${state.assets.length} item${state.assets.length === 1 ? '' : 's'}`;
  document.getElementById('tabAssetsPill').textContent = formatCurrency(totalAssets);

  // Top Asset Category
  const catSums = {};
  state.assets.forEach(a => {
    catSums[a.category] = (catSums[a.category] || 0) + (Number(a.value) || 0);
  });
  let topCat = '—';
  let maxCatVal = 0;
  for (const [cat, val] of Object.entries(catSums)) {
    if (val > maxCatVal) {
      maxCatVal = val;
      topCat = cat;
    }
  }
  document.getElementById('topAssetCategory').textContent = topCat;

  // Liabilities Card
  document.getElementById('totalLiabilitiesDisplay').textContent = formatCurrency(totalLiabilities);
  document.getElementById('liabilityCountBadge').textContent = `${state.liabilities.length} item${state.liabilities.length === 1 ? '' : 's'}`;
  document.getElementById('tabLiabilitiesPill').textContent = formatCurrency(totalLiabilities);
  document.getElementById('debtRatioDisplay').textContent = `${debtRatio}%`;

  // Health Metrics
  document.getElementById('liquidCashDisplay').textContent = formatCurrency(liquidCash);
  document.getElementById('debtLeverageDisplay').textContent = `${debtRatio}%`;

  const totalBalance = totalAssets + totalLiabilities;
  const assetSharePct = totalBalance > 0 ? Math.round((totalAssets / totalBalance) * 100) : 100;
  const liabSharePct = 100 - assetSharePct;

  document.getElementById('assetRatioText').textContent = `${assetSharePct}% Assets / ${liabSharePct}% Liabilities`;
  document.getElementById('assetsBarRatio').style.width = `${assetSharePct}%`;
  document.getElementById('liabilitiesBarRatio').style.width = `${liabSharePct}%`;

  // Dynamic Financial Advice
  updateFinancialTip(netWorth, totalAssets, totalLiabilities, liquidCash);

  // Render Lists
  renderAssetList();
  renderLiabilityList();

  // Render Charts & Snapshots
  renderCharts();
  renderSnapshots();

  // Update Print Section
  updatePrintSection(totalAssets, totalLiabilities, netWorth);
}

function updateFinancialTip(netWorth, totalAssets, totalLiabilities, liquidCash) {
  const tipEl = document.getElementById('financialTipText');
  if (totalAssets === 0 && totalLiabilities === 0) {
    tipEl.textContent = 'Add your cash accounts, investments, and debts above to instantly visualize your net worth.';
  } else if (netWorth < 0) {
    tipEl.textContent = 'Your liabilities exceed your assets. Focus on paying down high-interest revolving credit cards and personal loans to move into positive territory.';
  } else if (liquidCash < 10000 && totalAssets > 50000) {
    tipEl.textContent = 'You have healthy asset growth, but maintaining 3-6 months of liquid emergency savings in cash provides essential risk protection.';
  } else if (totalLiabilities === 0 && totalAssets > 0) {
    tipEl.textContent = 'Outstanding! You are 100% debt-free. Maximize index fund and retirement contributions to compound your wealth.';
  } else {
    tipEl.textContent = 'Your net worth is the single truest measure of your personal financial fitness. Track it monthly to build long-term momentum.';
  }
}

// --- Render Items Lists ---
function renderAssetList() {
  const container = document.getElementById('assetsList');
  container.innerHTML = '';

  const filtered = state.assets.filter(item => {
    return state.activeAssetFilter === 'all' || item.category === state.activeAssetFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <p class="text-sm text-slate-400">No assets in this category.</p>
        <button onclick="openModal('asset')" class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          + Add an Asset
        </button>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition animate-fade-in';
    const catColor = CATEGORY_COLORS[item.category] || '#10b981';

    card.innerHTML = `
      <div class="flex items-center space-x-3 truncate">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${catColor}"></span>
        <div class="truncate">
          <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(item.name)}</p>
          <span class="text-[11px] text-slate-400 font-medium">${escapeHtml(item.category)}</span>
        </div>
      </div>
      <div class="flex items-center space-x-3 ml-4 flex-shrink-0">
        <span class="text-sm font-bold text-slate-900 dark:text-white">${formatCurrency(item.value)}</span>
        <div class="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
          <button title="Edit" onclick="editItem('asset', '${item.id}')" class="p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
          <button title="Delete" onclick="deleteItem('asset', '${item.id}')" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderLiabilityList() {
  const container = document.getElementById('liabilitiesList');
  container.innerHTML = '';

  const filtered = state.liabilities.filter(item => {
    return state.activeLiabilityFilter === 'all' || item.category === state.activeLiabilityFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <p class="text-sm text-slate-400">No liabilities in this category.</p>
        <button onclick="openModal('liability')" class="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">
          + Add a Liability
        </button>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition animate-fade-in';
    const catColor = CATEGORY_COLORS[item.category] || '#ef4444';

    card.innerHTML = `
      <div class="flex items-center space-x-3 truncate">
        <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${catColor}"></span>
        <div class="truncate">
          <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(item.name)}</p>
          <span class="text-[11px] text-slate-400 font-medium">${escapeHtml(item.category)}</span>
        </div>
      </div>
      <div class="flex items-center space-x-3 ml-4 flex-shrink-0">
        <span class="text-sm font-bold text-rose-600 dark:text-rose-400">${formatCurrency(item.value)}</span>
        <div class="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
          <button title="Edit" onclick="editItem('liability', '${item.id}')" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
          <button title="Delete" onclick="deleteItem('liability', '${item.id}')" class="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- Render Chart.js ---
function renderCharts() {
  const canvas = document.getElementById('assetsChart');
  const placeholder = document.getElementById('chartPlaceholder');

  // Sum by categories
  const categories = {};
  state.assets.forEach(a => {
    categories[a.category] = (categories[a.category] || 0) + (Number(a.value) || 0);
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (data.length === 0 || data.every(v => v === 0)) {
    canvas.classList.add('hidden');
    placeholder.classList.remove('hidden');
    if (assetsChartInstance) {
      assetsChartInstance.destroy();
      assetsChartInstance = null;
    }
    return;
  }

  canvas.classList.remove('hidden');
  placeholder.classList.add('hidden');

  const backgroundColors = labels.map(cat => CATEGORY_COLORS[cat] || '#10b981');

  if (assetsChartInstance) {
    assetsChartInstance.data.labels = labels;
    assetsChartInstance.data.datasets[0].data = data;
    assetsChartInstance.data.datasets[0].backgroundColor = backgroundColors;
    assetsChartInstance.options.plugins.legend.labels.color = state.darkMode ? '#cbd5e1' : '#475569';
    assetsChartInstance.update();
  } else {
    assetsChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: state.darkMode ? '#0f172a' : '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14,
              font: { size: 11, family: 'Plus Jakarta Sans', weight: '500' },
              color: state.darkMode ? '#cbd5e1' : '#475569'
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = Math.round((value / total) * 100);
                return ` ${formatCurrency(value)} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }
}

// --- Snapshots ---
function renderSnapshots() {
  const container = document.getElementById('snapshotList');
  container.innerHTML = '';

  if (state.snapshots.length === 0) {
    container.innerHTML = `<p class="text-slate-400 py-3 text-center">No snapshots saved yet. Click "+ Snapshot" to log your current net worth.</p>`;
    return;
  }

  // Display newest first
  state.snapshots.slice().reverse().forEach((snap, idx) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800';
    row.innerHTML = `
      <div>
        <p class="font-bold text-slate-800 dark:text-slate-100">${formatCurrency(snap.netWorth)}</p>
        <span class="text-[10px] text-slate-400">${escapeHtml(snap.date)}</span>
      </div>
      <button title="Delete snapshot" onclick="deleteSnapshot('${snap.id}')" class="text-slate-400 hover:text-rose-500 p-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    container.appendChild(row);
  });
}

function saveSnapshot() {
  const { totalAssets, totalLiabilities, netWorth } = calculateTotals();
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  state.snapshots.push({
    id: 'snap_' + Date.now(),
    date: dateStr,
    netWorth,
    totalAssets,
    totalLiabilities
  });

  saveState();
  renderSnapshots();
  triggerConfetti();
}

function deleteSnapshot(id) {
  state.snapshots = state.snapshots.filter(s => s.id !== id);
  saveState();
  renderSnapshots();
}

// --- Modal Add / Edit Item Management ---
function openModal(type, itemId = null) {
  const modal = document.getElementById('itemModal');
  const title = document.getElementById('modalTitle');
  const typeInput = document.getElementById('itemType');
  const editIdInput = document.getElementById('editItemId');
  const catSelect = document.getElementById('itemCategory');
  const nameInput = document.getElementById('itemName');
  const valInput = document.getElementById('itemValue');
  const saveBtn = document.getElementById('saveItemBtn');

  typeInput.value = type;
  editIdInput.value = itemId || '';

  // Populate categories
  catSelect.innerHTML = '';
  const cats = type === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES;
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });

  if (itemId) {
    const list = type === 'asset' ? state.assets : state.liabilities;
    const item = list.find(i => i.id === itemId);
    if (item) {
      title.textContent = `Edit ${type === 'asset' ? 'Asset' : 'Liability'}`;
      catSelect.value = item.category;
      nameInput.value = item.name;
      valInput.value = item.value;
      saveBtn.textContent = 'Update Item';
    }
  } else {
    title.textContent = `Add New ${type === 'asset' ? 'Asset' : 'Liability'}`;
    nameInput.value = '';
    valInput.value = '';
    saveBtn.textContent = 'Save Item';
  }

  modal.classList.remove('hidden');
  nameInput.focus();
}

function closeModal() {
  const modal = document.getElementById('itemModal');
  modal.classList.add('hidden');
}

function handleItemFormSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('itemType').value;
  const editId = document.getElementById('editItemId').value;
  const category = document.getElementById('itemCategory').value;
  const name = document.getElementById('itemName').value.trim();
  const value = parseFloat(document.getElementById('itemValue').value) || 0;

  if (!name) return;

  const list = type === 'asset' ? state.assets : state.liabilities;

  if (editId) {
    const item = list.find(i => i.id === editId);
    if (item) {
      item.category = category;
      item.name = name;
      item.value = value;
    }
  } else {
    const newItem = {
      id: (type === 'asset' ? 'a_' : 'l_') + Date.now(),
      name,
      category,
      value
    };
    list.push(newItem);
  }

  saveState();
  closeModal();
  renderApp();
}

function editItem(type, id) {
  openModal(type, id);
}

function deleteItem(type, id) {
  if (type === 'asset') {
    state.assets = state.assets.filter(i => i.id !== id);
  } else {
    state.liabilities = state.liabilities.filter(i => i.id !== id);
  }
  saveState();
  renderApp();
}

// --- CSV Export ---
function exportCsv() {
  const { totalAssets, totalLiabilities, netWorth } = calculateTotals();
  const lines = [
    ['WealthFlow Net Worth Statement'],
    [`Export Date`, new Date().toISOString()],
    [`Currency`, state.currency],
    [],
    ['Section', 'Category', 'Item Name', 'Value'],
    ...state.assets.map(a => ['Asset', `"${a.category}"`, `"${a.name}"`, a.value]),
    ...state.liabilities.map(l => ['Liability', `"${l.category}"`, `"${l.name}"`, l.value]),
    [],
    ['Total Assets', '', '', totalAssets],
    ['Total Liabilities', '', '', totalLiabilities],
    ['Total Net Worth', '', '', netWorth]
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `networth_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- Print Statement Generation ---
function updatePrintSection(totalAssets, totalLiabilities, netWorth) {
  document.getElementById('printDate').textContent = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('printTotalAssets').textContent = formatCurrency(totalAssets);
  document.getElementById('printTotalLiabilities').textContent = formatCurrency(totalLiabilities);
  document.getElementById('printNetWorth').textContent = formatCurrency(netWorth);

  const assetsTbody = document.querySelector('#printAssetsTable tbody');
  assetsTbody.innerHTML = state.assets.map(a => `
    <tr class="border-b">
      <td class="py-1">${escapeHtml(a.name)}</td>
      <td class="py-1 text-slate-500">${escapeHtml(a.category)}</td>
      <td class="py-1 text-right font-medium">${formatCurrency(a.value)}</td>
    </tr>
  `).join('');

  const liabTbody = document.querySelector('#printLiabilitiesTable tbody');
  liabTbody.innerHTML = state.liabilities.map(l => `
    <tr class="border-b">
      <td class="py-1">${escapeHtml(l.name)}</td>
      <td class="py-1 text-slate-500">${escapeHtml(l.category)}</td>
      <td class="py-1 text-right font-medium">${formatCurrency(l.value)}</td>
    </tr>
  `).join('');
}

// --- Confetti Celebration ---
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  }
}

// --- Helper Functions ---
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  // Currency select
  document.getElementById('currencySelector').addEventListener('change', (e) => {
    state.currency = e.target.value;
    saveState();
    renderApp();
  });

  // Load sample data
  document.getElementById('loadSampleBtn').addEventListener('click', () => {
    if (confirm('Load sample data? This will replace your current numbers with realistic defaults.')) {
      loadSampleData(true);
    }
  });

  // Reset all
  document.getElementById('resetAllBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all assets and liabilities to zero?')) {
      state.assets = [];
      state.liabilities = [];
      saveState();
      renderApp();
    }
  });

  // Export CSV
  document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);

  // Print Report
  document.getElementById('printReportBtn').addEventListener('click', () => {
    window.print();
  });

  // Confetti icon
  document.getElementById('confettiTrigger').addEventListener('click', triggerConfetti);

  // Tab switching (Assets vs Liabilities)
  const tabAssetsBtn = document.getElementById('tabAssetsBtn');
  const tabLiabilitiesBtn = document.getElementById('tabLiabilitiesBtn');
  const assetsPanel = document.getElementById('assetsPanel');
  const liabilitiesPanel = document.getElementById('liabilitiesPanel');

  tabAssetsBtn.addEventListener('click', () => {
    tabAssetsBtn.className = 'flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition bg-emerald-600 text-white shadow-sm flex items-center justify-center gap-2';
    tabLiabilitiesBtn.className = 'flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2';
    assetsPanel.classList.remove('hidden');
    liabilitiesPanel.classList.add('hidden');
  });

  tabLiabilitiesBtn.addEventListener('click', () => {
    tabLiabilitiesBtn.className = 'flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition bg-rose-600 text-white shadow-sm flex items-center justify-center gap-2';
    tabAssetsBtn.className = 'flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2';
    liabilitiesPanel.classList.remove('hidden');
    assetsPanel.classList.add('hidden');
  });

  // Modal open buttons
  document.getElementById('openAddAssetModalBtn').addEventListener('click', () => openModal('asset'));
  document.getElementById('openAddLiabilityModalBtn').addEventListener('click', () => openModal('liability'));

  // Modal close buttons
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
  document.getElementById('itemModal').addEventListener('click', (e) => {
    if (e.target.id === 'itemModal') closeModal();
  });

  // Modal form submit
  document.getElementById('itemForm').addEventListener('submit', handleItemFormSubmit);

  // Snapshot button
  document.getElementById('saveSnapshotBtn').addEventListener('click', saveSnapshot);

  // Category filter clicks for Assets
  document.querySelectorAll('#assetCategoryFilters .cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#assetCategoryFilters .cat-filter-btn').forEach(b => {
        b.className = 'cat-filter-btn px-3 py-1 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      });
      btn.className = 'cat-filter-btn px-3 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      state.activeAssetFilter = btn.getAttribute('data-cat');
      renderAssetList();
    });
  });

  // Category filter clicks for Liabilities
  document.querySelectorAll('#liabilityCategoryFilters .cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#liabilityCategoryFilters .cat-filter-btn').forEach(b => {
        b.className = 'cat-filter-btn px-3 py-1 rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      });
      btn.className = 'cat-filter-btn px-3 py-1 rounded-full font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      state.activeLiabilityFilter = btn.getAttribute('data-cat');
      renderLiabilityList();
    });
  });
}
