'use strict';

/**
 * Pre-configured legal contract presets for instant 1-click evaluation.
 */
const CONTRACT_PRESETS = {
    lease: `COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement ("Lease") is entered into on January 15, 2024, by and between Apex Real Estate Holdings LLC ("Landlord"), located at 500 Madison Avenue, New York, NY, and Horizon Health Analytics Inc. ("Tenant").

1. PREMISES: Landlord hereby leases to Tenant the commercial property located at Suite 800, 100 Broadway, New York, NY 10005 ("Premises").

2. TERM: The term of this Lease shall be for twenty-four (24) months, commencing on March 1, 2024 ("Effective Date") and expiring on February 28, 2026.

3. RENT & PAYMENT TERMS: Tenant agrees to pay Landlord a base monthly rent of $4,500.00 payable in advance on the first day of each calendar month. Tenant shall deposit a security deposit of $9,000.00 upon execution.

4. GOVERNING LAW: This Lease Agreement shall be governed by and construed in accordance with the laws of the State of New York.

5. TERMINATION: Either party may terminate this agreement upon sixty (60) days prior written notice in the event of an uncured material default.`,

    license: `ENTERPRISE SOFTWARE LICENSE AGREEMENT

This Software License Agreement ("Agreement") is made between CloudScale Systems Inc. ("Licensor"), a Delaware corporation, and BioTech Solutions Ltd. ("Licensee").

1. GRANT OF LICENSE: Licensor grants Licensee a non-exclusive, non-transferable enterprise license to utilize the CloudScale Intelligence Platform.

2. FEES & PAYMENT: Licensee agrees to pay an annual subscription fee of $48,000.00 within thirty (30) days of receipt of invoice. Late payments accrue interest at 1.5% per month.

3. TERM: This Agreement is effective starting February 1, 2024 and shall continue for an initial period of twelve (12) months.

4. GOVERNING LAW: This Agreement shall be governed by, and enforced under, the laws of the State of California, without regard to conflict of laws principles.

5. CONFIDENTIALITY: Each party agrees to protect the proprietary source code and technical data of the other party with strict confidentiality.`,

    nda: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("NDA") is entered into as of April 10, 2024, between Quantum Cybernetics Corp. and Aurora Robotics Inc. (each a "Party" and collectively the "Parties").

1. PURPOSE: The Parties desire to explore a strategic partnership regarding autonomous robotics and sensor telemetry.

2. CONFIDENTIAL INFORMATION: Includes all technical blueprints, algorithms, source code, financial projections, and proprietary business discussions disclosed.

3. OBLIGATIONS: The receiving party agrees to hold all Confidential Information in strictest confidence for a period of three (3) years from the effective date.

4. GOVERNING LAW: This NDA shall be governed by the laws of the State of Delaware, and the parties submit to jurisdiction in Wilmington, Delaware.

5. REMEDIES: The parties acknowledge that unauthorized disclosure causes irreparable harm warranting immediate injunctive relief without proof of actual damages.`,

    employment: `EXECUTIVE EMPLOYMENT AGREEMENT

This Employment Agreement is entered into on May 2, 2024, by and between NeuralCore Technologies Inc. ("Employer") and Dr. Sarah Jenkins ("Employee").

1. POSITION: Employee shall serve as Principal AI Research Scientist reporting directly to the Chief Technology Officer.

2. COMPENSATION & SALARY: Employer agrees to pay Employee an annual base salary of $195,000.00, payable bi-weekly in accordance with standard payroll practices.

3. START DATE: The employment shall officially commence on June 1, 2024 ("Start Date").

4. GOVERNING LAW & JURISDICTION: This Agreement shall be governed by and interpreted under the laws of the State of Washington.

5. BENEFITS: Employee is entitled to comprehensive health benefits, 401(k) matching up to 5%, and an annual incentive bonus of up to $35,000.00.`
};

class LexiconStudioApp {
    constructor() {
        this.cacheDOMElements();
        this.currentResults = null;
        this.initEventListeners();
        console.log("Lexicon AI Studio Initialized.");
    }

    cacheDOMElements() {
        // Tabs
        this.tabUploadBtn = document.getElementById('tabUploadBtn');
        this.tabTextBtn = document.getElementById('tabTextBtn');
        this.uploadPane = document.getElementById('uploadPane');
        this.textPane = document.getElementById('textPane');
        this.presetChips = document.querySelectorAll('.preset-chip');

        // Drop zone
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('file-input');
        this.browseTrigger = document.getElementById('browseTrigger');

        // Text editor
        this.contractTextarea = document.getElementById('contractTextarea');
        this.editorWordCount = document.getElementById('editorWordCount');
        this.clearTextBtn = document.getElementById('clearTextBtn');
        this.analyzeTextBtn = document.getElementById('analyzeTextBtn');

        // Pipeline progress
        this.pipelineStatusBar = document.getElementById('pipelineStatusBar');
        this.progressBarFill = document.getElementById('progressBarFill');
        this.statusMessage = document.getElementById('statusMessage');
        this.statusPercent = document.getElementById('statusPercent');

        // Dashboard sections
        this.emptyState = document.getElementById('emptyStateSection');
        this.resultsDashboard = document.getElementById('resultsDashboard');

        // Result outputs
        this.resDocName = document.getElementById('resDocName');
        this.resTimestamp = document.getElementById('resTimestamp');
        this.resSummaryText = document.getElementById('resSummaryText');
        this.statWords = document.getElementById('statWords');
        this.resDocType = document.getElementById('resDocType');
        this.resConfidenceVal = document.getElementById('resConfidenceVal');
        this.resConfidenceFill = document.getElementById('resConfidenceFill');
        this.resScoresList = document.getElementById('resScoresList');
        this.resClauseCount = document.getElementById('resClauseCount');
        this.resClausesContainer = document.getElementById('resClausesContainer');
        this.resEntityCount = document.getElementById('resEntityCount');
        this.resEntitiesContainer = document.getElementById('resEntitiesContainer');

        // Action buttons
        this.copySummaryBtn = document.getElementById('copySummaryBtn');
        this.exportJsonBtn = document.getElementById('exportJsonBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.toastContainer = document.getElementById('toastContainer');
    }

    initEventListeners() {
        // Tab switching
        this.tabUploadBtn.addEventListener('click', () => this.switchTab('upload'));
        this.tabTextBtn.addEventListener('click', () => this.switchTab('text'));

        // Preset buttons
        this.presetChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const presetKey = chip.getAttribute('data-preset');
                this.loadPreset(presetKey);
            });
        });

        // Drop zone browse
        this.browseTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });
        this.dropZone.addEventListener('click', () => this.fileInput.click());

        // Drag & drop
        ['dragenter', 'dragover'].forEach(name => {
            this.dropZone.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(name => {
            this.dropZone.addEventListener(name, (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dropZone.classList.remove('drag-over');
            });
        });

        this.dropZone.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) this.handleFile(file);
        });

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFile(file);
        });

        // Textarea counter
        this.contractTextarea.addEventListener('input', () => {
            const text = this.contractTextarea.value.trim();
            const words = text ? text.split(/\s+/).length : 0;
            this.editorWordCount.textContent = `${words} words`;
        });

        // Clear text button
        this.clearTextBtn.addEventListener('click', () => {
            this.contractTextarea.value = '';
            this.editorWordCount.textContent = '0 words';
        });

        // Run text analysis
        this.analyzeTextBtn.addEventListener('click', () => {
            const text = this.contractTextarea.value.trim();
            if (!text) {
                this.showToast('Please paste contract text or select a preset first.', 'error');
                return;
            }
            this.analyzeRawText(text, 'Manual Contract Input');
        });

        // Copy summary
        this.copySummaryBtn.addEventListener('click', () => {
            if (!this.resSummaryText.textContent) return;
            navigator.clipboard.writeText(this.resSummaryText.textContent)
                .then(() => this.showToast('Executive summary copied to clipboard!', 'success'))
                .catch(() => this.showToast('Failed to copy to clipboard', 'error'));
        });

        // Export JSON
        this.exportJsonBtn.addEventListener('click', () => {
            if (!this.currentResults) return;
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentResults, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `legal_analysis_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            this.showToast('Analysis exported as JSON report.', 'success');
        });

        // Reset
        this.resetBtn.addEventListener('click', () => this.resetView());
    }

    switchTab(tab) {
        if (tab === 'upload') {
            this.tabUploadBtn.classList.add('active');
            this.tabTextBtn.classList.remove('active');
            this.uploadPane.classList.add('active');
            this.textPane.classList.remove('active');
        } else {
            this.tabTextBtn.classList.add('active');
            this.tabUploadBtn.classList.remove('active');
            this.textPane.classList.add('active');
            this.uploadPane.classList.remove('active');
        }
    }

    loadPreset(presetKey) {
        const text = CONTRACT_PRESETS[presetKey];
        if (!text) return;
        this.switchTab('text');
        this.contractTextarea.value = text;
        const words = text.split(/\s+/).length;
        this.editorWordCount.textContent = `${words} words`;
        this.showToast(`Loaded ${presetKey.toUpperCase()} preset. Click "Run Analysis Pipeline".`, 'success');
    }

    async handleFile(file) {
        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        const isTxt = file.name.toLowerCase().endsWith('.txt');

        if (!isPdf && !isTxt) {
            this.showToast('Please upload a PDF or TXT legal document.', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showToast('Document exceeds 10MB limit.', 'error');
            return;
        }

        if (isTxt) {
            const text = await file.text();
            this.analyzeRawText(text, file.name);
            return;
        }

        // Upload PDF
        try {
            this.setPipelineProgress(15, `Streaming ${file.name} to in-memory parser...`);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/analyze-pdf', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Upload failed');

            if (data.task_id) {
                await this.pollTaskStatus(data.task_id, file.name);
            }
        } catch (err) {
            console.error(err);
            this.hidePipelineProgress();
            this.showToast(`Analysis failed: ${err.message}`, 'error');
        }
    }

    async analyzeRawText(text, documentName) {
        try {
            this.setPipelineProgress(25, 'Running Legal-BERT & T5 inference on GPU...');
            const startTime = performance.now();

            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const results = await response.json();
            if (!response.ok) throw new Error(results.detail || 'Analysis failed');

            const latency = ((performance.now() - startTime) / 1000).toFixed(2);
            this.setPipelineProgress(100, `Completed in ${latency}s`);

            setTimeout(() => {
                this.hidePipelineProgress();
                this.renderDashboard(results, documentName);
                this.showToast(`Analysis finished in ${latency}s`, 'success');
            }, 300);

        } catch (err) {
            console.error(err);
            this.hidePipelineProgress();
            this.showToast(`Error: ${err.message}`, 'error');
        }
    }

    async pollTaskStatus(taskId, documentName) {
        let attempts = 0;
        const maxAttempts = 60;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`/status/${taskId}`);
                if (!response.ok) throw new Error('Status check failed');

                const status = await response.json();

                if (status.status === 'completed') {
                    this.setPipelineProgress(100, 'Analysis complete!');
                    setTimeout(() => {
                        this.hidePipelineProgress();
                        this.renderDashboard(status.results, documentName);
                        this.showToast('PDF Document successfully audited!', 'success');
                    }, 350);
                    return;
                } else if (status.status === 'error') {
                    throw new Error(status.error || 'Worker error');
                } else {
                    const progress = status.progress || (30 + attempts * 2);
                    const label = status.status === 'extracting_text'
                        ? 'Extracting text from PDF stream...'
                        : 'Executing Transformer neural pipeline...';
                    this.setPipelineProgress(progress, label);
                }

                await new Promise(r => setTimeout(r, 600));
                attempts++;
            } catch (err) {
                this.hidePipelineProgress();
                this.showToast(err.message, 'error');
                return;
            }
        }
        this.hidePipelineProgress();
        this.showToast('Document processing timed out.', 'error');
    }

    setPipelineProgress(percent, message) {
        this.pipelineStatusBar.style.display = 'block';
        this.progressBarFill.style.width = `${percent}%`;
        this.statusPercent.textContent = `${percent}%`;
        this.statusMessage.textContent = message;
    }

    hidePipelineProgress() {
        this.pipelineStatusBar.style.display = 'none';
        this.progressBarFill.style.width = '0%';
    }

    renderDashboard(results, docName) {
        this.currentResults = results;
        this.emptyState.style.display = 'none';
        this.resultsDashboard.style.display = 'flex';

        // Meta
        this.resDocName.textContent = docName || 'Document Analysis';
        this.resTimestamp.textContent = new Date().toLocaleTimeString();

        // 1. Executive Summary
        this.resSummaryText.textContent = results.summary || 'Summary unavailable.';
        const wordCount = results.document_info?.length || (results.summary ? results.summary.split(/\s+/).length : 0);
        this.statWords.textContent = wordCount;

        // 2. Classification
        const docType = results.document_info?.type || 'Unknown';
        const confidence = results.document_info?.confidence || 0;
        this.resDocType.textContent = docType;
        this.resConfidenceVal.textContent = `${Math.round(confidence * 100)}%`;
        this.resConfidenceFill.style.width = `${Math.round(confidence * 100)}%`;

        // Classification Scores List
        if (results.classification_scores) {
            this.resScoresList.innerHTML = Object.entries(results.classification_scores)
                .map(([type, score]) => {
                    const isTop = type.toLowerCase() === docType.toLowerCase();
                    return `
                        <div class="score-row ${isTop ? 'highlight' : ''}">
                            <span>${type.toUpperCase()}</span>
                            <span>${(score * 100).toFixed(0)}%</span>
                        </div>
                    `;
                }).join('');
        }

        // 3. Key Clauses
        const clauses = results.key_clauses || {};
        const clauseKeys = Object.keys(clauses);
        this.resClauseCount.textContent = `${clauseKeys.length} extracted`;

        if (clauseKeys.length === 0) {
            this.resClausesContainer.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem;">No explicit standard clauses identified in this document.</div>`;
        } else {
            this.resClausesContainer.innerHTML = clauseKeys.map(key => {
                const item = clauses[key];
                const text = typeof item === 'object' ? item.text : item;
                const score = typeof item === 'object' && item.confidence ? Math.round(item.confidence * 100) : null;

                return `
                    <div class="clause-item">
                        <div class="clause-top">
                            <span class="clause-name">${this.formatClauseName(key)}</span>
                            ${score ? `<span class="clause-score">${score}% match</span>` : ''}
                        </div>
                        <div class="clause-text">${text || 'Not specified'}</div>
                    </div>
                `;
            }).join('');
        }

        // 4. Legal Entities
        const entities = results.entities || {};
        let totalEntities = 0;
        const entityBlocks = [];

        const categoryPillClass = {
            PERSON: 'pill-person',
            ORG: 'pill-org',
            DATE: 'pill-date',
            MONEY: 'pill-money',
            monetary_amounts: 'pill-money',
            GPE: 'pill-gpe'
        };

        for (const [category, items] of Object.entries(entities)) {
            if (Array.isArray(items) && items.length > 0) {
                // Deduplicate items
                const uniqueItems = [...new Set(items)];
                totalEntities += uniqueItems.length;

                const pillClass = categoryPillClass[category] || '';
                const renderedPills = uniqueItems.slice(0, 15).map(item =>
                    `<span class="entity-pill ${pillClass}">${item}</span>`
                ).join('');

                entityBlocks.push(`
                    <div class="entity-group">
                        <div class="entity-group-header">
                            <span>${category.toUpperCase().replace('_', ' ')}</span>
                            <span>${uniqueItems.length}</span>
                        </div>
                        <div class="entity-pills-wrap">
                            ${renderedPills}
                        </div>
                    </div>
                `);
            }
        }

        this.resEntityCount.textContent = `${totalEntities} detected`;
        this.resEntitiesContainer.innerHTML = entityBlocks.length > 0
            ? entityBlocks.join('')
            : `<div style="color:var(--text-muted); font-size:0.85rem;">No named entities detected.</div>`;

        // Smooth scroll to results
        this.resultsDashboard.scrollIntoView({ behavior: 'smooth' });
    }

    formatClauseName(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    resetView() {
        this.emptyState.style.display = 'block';
        this.resultsDashboard.style.display = 'none';
        this.contractTextarea.value = '';
        this.editorWordCount.textContent = '0 words';
        this.fileInput.value = '';
        this.currentResults = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
        toast.textContent = message;

        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            toast.style.transition = 'all 200ms ease';
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LexiconStudioApp();
});
