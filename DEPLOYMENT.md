# Lexicon AI — Autonomous Legal Contract Intelligence Studio

A client-side legal document intelligence platform that runs **100% in the browser** with zero backend servers required.

## Live Local Previews
- **Frontend-Only Version (Vercel / GitHub Pages Ready)**: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
- **Full PyTorch/FastAPI Backend Version**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

## 🚀 How to Deploy to Vercel (1-Click, Free)

1. Push this folder to your GitHub repository.
2. Go to **[vercel.com](https://vercel.com)** and click **"Add New Project"**.
3. Select your repository.
4. Click **"Deploy"** (no build command needed).
5. Your website will be live in 10 seconds at `https://your-project.vercel.app`!

---

## 🐙 How to Deploy to GitHub Pages (1-Click, Free)

1. Push this repository to GitHub.
2. In your GitHub repository, click **Settings** ➔ **Pages** (left sidebar).
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** (or **master**) / **(root)**
4. Click **Save**.
5. Your website will be live at `https://<username>.github.io/<repository-name>/`!

---

## ✨ Features
- **In-Browser PDF Parsing**: Uses Mozilla's `PDF.js` via CDN to extract text page-by-page client-side.
- **Contract Classification**: Classifies Agreements, Leases, NDAs, Licenses, and Employment contracts.
- **Entity Extraction (NER)**: Extracts Parties, Organizations, Effective Dates, Financial obligations, and Jurisdictions.
- **Clause Detection**: Extracts Governing Law, Payment Terms, Effective Term, and Termination clauses.
- **Abstractive Executive Summaries**: Formulates clear executive summaries.
- **One-Click Presets**: Pre-loaded agreements for rapid live demonstrations.
- **Exporting**: Instant clipboard copy and JSON report downloads.
