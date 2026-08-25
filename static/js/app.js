// CampusFix AI Frontend Application Logic

let currentAnalysis = null;
let currentImageBase64 = null;
let allIssues = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPresets();
    fetchStats();
    fetchIssues();
    setupDropzone();
});

// Switch between Report and Dashboard views
function switchTab(tab) {
    const viewReport = document.getElementById('view-report');
    const viewDashboard = document.getElementById('view-dashboard');
    const navReport = document.getElementById('nav-report');
    const navDashboard = document.getElementById('nav-dashboard');

    if (tab === 'report') {
        viewReport.classList.remove('hidden');
        viewDashboard.classList.add('hidden');
        navReport.classList.add('active');
        navDashboard.classList.remove('active');
    } else {
        viewReport.classList.add('hidden');
        viewDashboard.classList.remove('hidden');
        navReport.classList.remove('active');
        navDashboard.classList.add('active');
        fetchStats();
        fetchIssues();
    }
    lucide.createIcons();
}

// Load 1-click test presets
async function loadPresets() {
    try {
        const res = await fetch('/api/presets');
        const presets = await res.json();
        const container = document.getElementById('preset-container');
        container.innerHTML = '';

        presets.forEach((p, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition-all group flex flex-col justify-between';
            btn.onclick = () => applyPreset(p);
            
            btn.innerHTML = `
                <div class="flex items-center space-x-1.5 mb-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span class="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">${p.name}</span>
                </div>
                <span class="text-[10px] text-slate-400 line-clamp-1">${p.location}</span>
            `;
            container.appendChild(btn);
        });
    } catch (e) {
        console.error("Could not load presets", e);
    }
}

function applyPreset(preset) {
    document.getElementById('issue-text').value = preset.text;
    document.getElementById('issue-location').value = preset.location;
    showToast(`Loaded preset: "${preset.name}"`, "info");
    
    // Auto-trigger analysis for seamless testing
    setTimeout(() => {
        handleAnalyze(new Event('submit'));
    }, 200);
}

function setLocation(loc) {
    document.getElementById('issue-location').value = loc;
}

function clearForm() {
    document.getElementById('issue-form').reset();
    removeImage();
    resetToNewReport();
    showToast("Form cleared", "info");
}

function resetToNewReport() {
    document.getElementById('ai-placeholder-card').classList.remove('hidden');
    document.getElementById('ai-loading-card').classList.add('hidden');
    document.getElementById('ai-result-card').classList.add('hidden');
    currentAnalysis = null;
    lucide.createIcons();
}

// Drag & Drop / Image Selection
function setupDropzone() {
    const dropzone = document.getElementById('dropzone');
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.add('border-emerald-500', 'bg-emerald-950/20');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-emerald-500', 'bg-emerald-950/20');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast("Please upload a valid image file", "error");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageBase64 = e.target.result;
        document.getElementById('image-preview').src = currentImageBase64;
        document.getElementById('dropzone-empty').classList.add('hidden');
        document.getElementById('dropzone-preview').classList.remove('hidden');
        showToast("Photo attached successfully", "success");
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    currentImageBase64 = null;
    document.getElementById('file-input').value = '';
    document.getElementById('image-preview').src = '';
    document.getElementById('dropzone-preview').classList.add('hidden');
    document.getElementById('dropzone-empty').classList.remove('hidden');
}

// Voice Dictation / Speech Recognition
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const voiceBtn = document.getElementById('voice-btn');
    const voiceLabel = document.getElementById('voice-label');

    if (!SpeechRecognition) {
        // Fallback simulation for browsers without Web Speech API
        simulateVoiceDictation();
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    voiceBtn.classList.add('bg-rose-500/20', 'text-rose-400', 'border-rose-500/40');
    voiceLabel.innerText = "Listening...";

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const textarea = document.getElementById('issue-text');
        textarea.value = (textarea.value ? textarea.value + " " : "") + transcript;
        showToast("Voice transcribed successfully!", "success");
    };

    recognition.onerror = () => {
        showToast("Microphone access ended or unavailable", "info");
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('bg-rose-500/20', 'text-rose-400', 'border-rose-500/40');
        voiceLabel.innerText = "Voice Dictation";
    };

    recognition.start();
}

function simulateVoiceDictation() {
    const samplePhrases = [
        "The water filter near room 302 is leaking and making a loud buzzing sound.",
        "AC is completely off in computer lab 4 and room temperature is very hot.",
        "Broken window pane in east hallway second floor."
    ];
    const picked = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
    const textarea = document.getElementById('issue-text');
    textarea.value = picked;
    showToast("Simulated voice input loaded", "info");
}

// GPS Location detector
function detectGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const locInput = document.getElementById('issue-location');
                locInput.value = `Geo-tag: Campus GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}) - Near Engineering Quad`;
                showToast("Campus coordinates detected", "success");
            },
            () => {
                document.getElementById('issue-location').value = "Main Academic Complex, Ground Floor";
                showToast("Defaulted to Academic Complex", "info");
            }
        );
    } else {
        document.getElementById('issue-location').value = "Main Academic Complex";
    }
}

// Main AI Analysis Handler
async function handleAnalyze(e) {
    if (e) e.preventDefault();

    const description = document.getElementById('issue-text').value.trim();
    if (!description && !currentImageBase64) {
        showToast("Please enter a description or upload a photo", "error");
        return;
    }

    // UI state transitions
    document.getElementById('ai-placeholder-card').classList.add('hidden');
    document.getElementById('ai-result-card').classList.add('hidden');
    document.getElementById('ai-loading-card').classList.remove('hidden');
    lucide.createIcons();

    // Step text animations
    const steps = [
        "Extracting incident parameters & context...",
        "Evaluating safety hazard risk & SLA...",
        "Determining responsible campus department...",
        "Formulating actionable maintenance directives..."
    ];
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
        stepIdx = (stepIdx + 1) % steps.length;
        const el = document.getElementById('loading-step-text');
        if (el) el.innerText = steps[stepIdx];
    }, 350);

    const savedKey = localStorage.getItem('campusfix_gemini_key') || '';

    try {
        const startTime = Date.now();
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Gemini-Key': savedKey
            },
            body: JSON.stringify({
                description: description,
                image: currentImageBase64
            })
        });

        const data = await res.json();
        const elapsed = Date.now() - startTime;
        // Keep smooth brief animation if response was instant
        if (elapsed < 600) {
            await new Promise(r => setTimeout(r, 600 - elapsed));
        }

        clearInterval(stepInterval);

        if (data.success && data.analysis) {
            currentAnalysis = data.analysis;
            renderResultCard(data.analysis);
        } else {
            throw new Error(data.error || "Analysis failed");
        }
    } catch (err) {
        clearInterval(stepInterval);
        console.error(err);
        showToast("Analysis error. Please try again.", "error");
        document.getElementById('ai-loading-card').classList.add('hidden');
        document.getElementById('ai-placeholder-card').classList.remove('hidden');
    }
}

// Render Result Card
function renderResultCard(a) {
    document.getElementById('ai-loading-card').classList.add('hidden');
    const card = document.getElementById('ai-result-card');
    card.classList.remove('hidden');

    // Title & Confidence
    document.getElementById('res-title').innerText = a.title || "Campus Incident";
    document.getElementById('res-confidence').innerText = `${a.confidence || 95}%`;

    // Category Badge
    const catBadge = document.getElementById('res-badge-category');
    catBadge.innerText = a.category;
    const safeCatClass = 'badge-' + (a.category || 'General-Maintenance').replace(/[\s&]+/g, '-');
    catBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${safeCatClass} border`;

    // Priority Badge
    const priBadge = document.getElementById('res-badge-priority');
    priBadge.innerText = `Priority: ${a.priority}`;
    priBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider priority-${a.priority}`;

    // Target Dept & SLA
    document.getElementById('res-department').innerText = a.department;
    document.getElementById('res-sla').innerText = a.estimated_sla || "24 hours";

    // Hazard & Action
    document.getElementById('res-hazard').innerText = a.hazard_level || "Standard Priority";
    document.getElementById('res-action').innerText = a.suggested_action;

    lucide.createIcons();
}

// Dispatch / Save Issue to Backend
async function confirmAndDispatchIssue() {
    if (!currentAnalysis) return;

    const dispatchBtn = document.getElementById('dispatch-btn');
    const originalText = dispatchBtn.innerHTML;
    dispatchBtn.disabled = true;
    dispatchBtn.innerHTML = `<span>Dispatching...</span>`;

    const description = document.getElementById('issue-text').value.trim();
    const location = document.getElementById('issue-location').value.trim() || 'Campus Grounds';

    const payload = {
        title: currentAnalysis.title,
        original_text: description,
        category: currentAnalysis.category,
        priority: currentAnalysis.priority,
        department: currentAnalysis.department,
        suggested_action: currentAnalysis.suggested_action,
        location: location,
        estimated_sla: currentAnalysis.estimated_sla,
        hazard_level: currentAnalysis.hazard_level,
        confidence: currentAnalysis.confidence,
        image: currentImageBase64
    };

    try {
        const res = await fetch('/api/issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
            // Trigger Confetti Celebration!
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            showToast(result.message || "Ticket successfully logged & dispatched!", "success");

            // Reset form
            document.getElementById('issue-form').reset();
            removeImage();
            
            // Switch to live dashboard to view the newly created ticket
            setTimeout(() => {
                switchTab('dashboard');
            }, 900);
        } else {
            showToast("Failed to dispatch ticket", "error");
        }
    } catch (err) {
        console.error(err);
        showToast("Network error submitting ticket", "error");
    } finally {
        dispatchBtn.disabled = false;
        dispatchBtn.innerHTML = originalText;
    }
}

// Dashboard Functions
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('stat-total').innerText = data.total || 0;
        document.getElementById('stat-open').innerText = data.open || 0;
        document.getElementById('stat-in-progress').innerText = data.in_progress || 0;
        document.getElementById('stat-resolved').innerText = data.resolved || 0;
        document.getElementById('stat-critical').innerText = data.critical || 0;
        document.getElementById('ticket-badge-count').innerText = data.total || 0;
    } catch (e) {
        console.error(e);
    }
}

async function fetchIssues() {
    try {
        const category = document.getElementById('filter-category').value;
        const priority = document.getElementById('filter-priority').value;
        const status = document.getElementById('filter-status').value;
        const search = document.getElementById('filter-search').value;

        const params = new URLSearchParams();
        if (category && category !== 'All') params.append('category', category);
        if (priority && priority !== 'All') params.append('priority', priority);
        if (status && status !== 'All') params.append('status', status);
        if (search) params.append('search', search);

        const res = await fetch(`/api/issues?${params.toString()}`);
        const data = await res.json();
        allIssues = data.issues || [];
        renderIssuesList(allIssues);
    } catch (e) {
        console.error("Failed to fetch issues", e);
    }
}

function filterIssues() {
    fetchIssues();
}

function refreshDashboard() {
    fetchStats();
    fetchIssues();
    showToast("Dashboard refreshed", "info");
}

function renderIssuesList(issues) {
    const list = document.getElementById('issues-list');
    list.innerHTML = '';

    if (issues.length === 0) {
        list.innerHTML = `
            <div class="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
                <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-400"></i>
                <p class="text-sm font-semibold text-slate-300">No reported incidents match the selected filters.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    issues.forEach(item => {
        const safeCat = 'badge-' + (item.category || 'General-Maintenance').replace(/[\s&]+/g, '-');
        const safeStatus = 'status-' + (item.status || 'Open').replace(/[\s]+/g, '-');
        
        const card = document.createElement('div');
        card.className = 'p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md';

        card.innerHTML = `
            <div class="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">${item.id}</span>
                    <span class="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${safeCat} border">${item.category}</span>
                    <span class="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full priority-${item.priority}">${item.priority}</span>
                    <span class="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${safeStatus}">${item.status}</span>
                </div>
                <div class="flex items-center space-x-2 text-xs text-slate-400 shrink-0">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-400"></i>
                    <span class="font-medium text-slate-300">${item.location}</span>
                </div>
            </div>

            <h3 class="text-base font-bold text-white mb-1.5">${item.title}</h3>
            <p class="text-xs text-slate-400 mb-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 font-mono">
                "${item.original_text || 'No original text provided'}"
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                <div>
                    <span class="text-slate-400 font-semibold block">Assigned Dept:</span>
                    <span class="text-emerald-400 font-medium">${item.department}</span>
                </div>
                <div>
                    <span class="text-slate-400 font-semibold block">Action Directive:</span>
                    <span class="text-slate-200">${item.suggested_action}</span>
                </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div class="flex items-center space-x-2 text-slate-400">
                    <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-400"></i>
                    <span>SLA: <strong class="text-slate-200">${item.estimated_sla || '24 hrs'}</strong></span>
                </div>

                <div class="flex items-center space-x-2">
                    <button onclick="upvoteIssue('${item.id}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 transition-colors">
                        <i data-lucide="thumbs-up" class="w-3 h-3 text-emerald-400"></i>
                        <span>${item.upvotes || 1}</span>
                    </button>

                    ${item.status !== 'In Progress' && item.status !== 'Resolved' ? `
                        <button onclick="updateStatus('${item.id}', 'In Progress')" class="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-semibold transition-colors">
                            Mark In Progress
                        </button>
                    ` : ''}

                    ${item.status !== 'Resolved' ? `
                        <button onclick="updateStatus('${item.id}', 'Resolved')" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold transition-colors">
                            Mark Resolved
                        </button>
                    ` : `
                        <span class="text-emerald-400 font-bold flex items-center gap-1">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i> Resolved
                        </span>
                    `}
                </div>
            </div>
        `;
        list.appendChild(card);
    });

    lucide.createIcons();
}

async function updateStatus(id, newStatus) {
    try {
        const res = await fetch(`/api/issues/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Status updated to ${newStatus}`, "success");
            fetchStats();
            fetchIssues();
        }
    } catch (e) {
        showToast("Failed to update status", "error");
    }
}

async function upvoteIssue(id) {
    try {
        const res = await fetch(`/api/issues/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ upvotes: 1 })
        });
        const data = await res.json();
        if (data.success) {
            fetchIssues();
            showToast("Upvoted issue priority!", "success");
        }
    } catch (e) {
        console.error(e);
    }
}

async function resetDemoData() {
    if (confirm("Reset all issues to default hackathon demo dataset?")) {
        await fetch('/api/reset', { method: 'POST' });
        showToast("Demo data reset", "info");
        refreshDashboard();
    }
}

// Settings modal
function openSettingsModal() {
    document.getElementById('custom-api-key').value = localStorage.getItem('campusfix_gemini_key') || '';
    document.getElementById('settings-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function saveApiKey() {
    const key = document.getElementById('custom-api-key').value.trim();
    if (key) {
        localStorage.setItem('campusfix_gemini_key', key);
        showToast("Gemini API Key saved!", "success");
    } else {
        localStorage.removeItem('campusfix_gemini_key');
        showToast("Using Autonomous Smart NLP Engine", "info");
    }
    closeSettingsModal();
}

// Toast Notifications helper
function showToast(message, type = "info") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    let bg = "bg-slate-900 border-slate-700 text-white";
    let icon = "info";
    if (type === "success") {
        bg = "bg-emerald-950/90 border-emerald-500/50 text-emerald-300";
        icon = "check-circle";
    } else if (type === "error") {
        bg = "bg-rose-950/90 border-rose-500/50 text-rose-300";
        icon = "alert-circle";
    }

    toast.className = `pointer-events-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl border ${bg} shadow-2xl backdrop-blur-md text-xs font-semibold animate-fade-in transition-all duration-300`;
    toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    lucide.createIcons();

// Export Data History as JSON or CSV
function exportData(format = 'json') {
    if (!allIssues || allIssues.length === 0) {
        showToast("No incident data available to export", "info");
        return;
    }

    if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allIssues, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `campusfix_incident_history_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Exported history as JSON file", "success");
    } else if (format === 'csv') {
        const headers = ["ID", "Title", "Category", "Priority", "Status", "Department", "Location", "SLA", "Hazard_Level", "Timestamp", "Action_Directive"];
        const rows = allIssues.map(i => [
            `"${i.id || ''}"`,
            `"${(i.title || '').replace(/"/g, '""')}"`,
            `"${i.category || ''}"`,
            `"${i.priority || ''}"`,
            `"${i.status || ''}"`,
            `"${i.department || ''}"`,
            `"${(i.location || '').replace(/"/g, '""')}"`,
            `"${i.estimated_sla || ''}"`,
            `"${(i.hazard_level || '').replace(/"/g, '""')}"`,
            `"${i.timestamp || ''}"`,
            `"${(i.suggested_action || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `campusfix_incident_history_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast("Exported history as CSV spreadsheet", "success");
    }
}

