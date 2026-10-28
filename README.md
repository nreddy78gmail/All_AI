# WealthFlow — Net Worth Calculator & Financial Health Tracker

A modern, responsive, and private web application to calculate and visualize your personal net worth.

## ✨ Features

- **Live Net Worth Calculation**: Instantly calculates `Total Assets - Total Liabilities` in real-time.
- **Categorized Assets & Liabilities**:
  - **Assets**: Cash & Liquid, Investments, Retirement accounts (401k/IRA), Real Estate, Vehicles & Valuables.
  - **Liabilities**: Mortgages, Auto loans, Student loans, Credit cards, and Personal/Other debt.
- **Visual Analytics**:
  - Interactive Doughnut chart for asset allocation (powered by Chart.js).
  - Balance sheet breakdown bar & debt-to-asset leverage ratios.
- **Milestone Progress**: Visual progress tracker toward the next major wealth milestone (e.g., $100k, $500k, $1M).
- **Time Snapshots**: Save and monitor net worth snapshots over time.
- **Multi-Currency Support**: Switch seamlessly between USD ($), EUR (€), GBP (£), CAD ($), AUD ($), INR (₹), and JPY (¥).
- **Export & Print**:
  - Export full balance sheet to CSV.
  - Print or Save as formatted PDF statement with clean print styling.
- **100% Client-Side & Private**: All data is stored locally in your browser's `localStorage` — no data leaves your machine.
- **Dark Mode / Light Mode**: Beautiful modern UI built with Tailwind CSS.

## 🚀 How to Run

You don't need any build tools or packages installed.

### Option 1: Direct in Browser
Simply double-click or open `index.html` in your favorite web browser (Chrome, Safari, Firefox, Edge):
```bash
open index.html
```

### Option 2: Using Python's Built-in Server
If you'd like to run it over a local HTTP server:
```bash
cd /Users/nreddy_78/.gemini/antigravity/scratch/networth-calculator
python3 -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080) in your browser.

## 🛠️ File Structure

- `index.html`: Clean HTML5 markup with Tailwind CDN, Chart.js, and modal forms.
- `styles.css`: Custom typography, smooth fade animations, and print stylesheets.
- `app.js`: State management, currency conversion, Chart.js rendering, CSV export, and `localStorage` persistence.
