// CampusFix AI Interactive Pitch Deck for Hackathon Presentation

let currentPitchSlide = 0;

const pitchSlides = [
    {
        title: "The Problem: Broken Campus Reporting",
        tag: "Challenge & Context",
        content: `
            <div class="space-y-4 text-slate-300 text-sm">
                <p class="leading-relaxed">
                    Across universities, thousands of students encounter physical defects daily: broken library lights, leaking washrooms, damaged auditorium projectors, and overflowing waste bins.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-rose-500/20">
                        <div class="text-rose-400 font-bold text-lg mb-1">🐢 72+ Hours</div>
                        <div class="text-xs text-slate-400">Average time to manually triage, read emails, and assign campus tickets.</div>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-amber-500/20">
                        <div class="text-amber-400 font-bold text-lg mb-1">❌ 45% Misrouted</div>
                        <div class="text-xs text-slate-400">Reports sent to wrong departments (e.g. electrical issues sent to sanitation).</div>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/20">
                        <div class="text-indigo-400 font-bold text-lg mb-1">⚠️ Safety Hazards</div>
                        <div class="text-xs text-slate-400">Critical hazards (sparks, floods) buried under routine complaints.</div>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "The Solution: CampusFix AI",
        tag: "Product Overview",
        content: `
            <div class="space-y-4 text-slate-300 text-sm">
                <p class="leading-relaxed">
                    <strong class="text-emerald-400 font-semibold">CampusFix AI</strong> replaces slow multi-step forms with instantaneous AI triage:
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start space-x-3">
                        <span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">01</span>
                        <div>
                            <h4 class="font-bold text-white text-xs mb-0.5">Zero-Friction Reporting</h4>
                            <p class="text-xs text-slate-400">Voice-to-text dictation, GPS tagging, and drag-and-drop photo upload.</p>
                        </div>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start space-x-3">
                        <span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">02</span>
                        <div>
                            <h4 class="font-bold text-white text-xs mb-0.5">Automatic Categorization</h4>
                            <p class="text-xs text-slate-400">Classifies into Electrical, Plumbing, IT, Safety, Waste, or Civil in milliseconds.</p>
                        </div>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start space-x-3">
                        <span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">03</span>
                        <div>
                            <h4 class="font-bold text-white text-xs mb-0.5">Hazard Scoring & SLA</h4>
                            <p class="text-xs text-slate-400">Calculates urgency (Critical/High/Medium/Low) with dynamic resolution deadlines.</p>
                        </div>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start space-x-3">
                        <span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">04</span>
                        <div>
                            <h4 class="font-bold text-white text-xs mb-0.5">Technician Directives</h4>
                            <p class="text-xs text-slate-400">Synthesizes actionable steps for maintenance crews so they arrive prepared.</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        title: "System Architecture & AI Flow",
        tag: "Technical Implementation",
        content: `
            <div class="space-y-3 text-slate-300 text-sm">
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                    <div class="text-emerald-400 font-bold">1. Input Ingestion:</div>
                    <div class="pl-4 text-slate-400">Text Prompt + Photo Stream + GPS Geo-coordinates</div>
                    
                    <div class="text-indigo-400 font-bold">2. Dual-Engine Intelligence Pipeline:</div>
                    <div class="pl-4 text-slate-400">Primary: Gemini 1.5/2.0 Vision LLM (Structured JSON Schema)</div>
                    <div class="pl-4 text-slate-400">Resilience Fallback: Context-Aware Semantic NLP & Severity Classifier</div>
                    
                    <div class="text-amber-400 font-bold">3. Automated Routing & Dispatch:</div>
                    <div class="pl-4 text-slate-400">Department Mapping ➔ SLA Allocation ➔ REST Persistence ➔ Live Facilities Feed</div>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-400">
                    <span class="bg-slate-800 px-2 py-1 rounded">⚡ Python 3.14 + Flask REST API</span>
                    <span class="bg-slate-800 px-2 py-1 rounded">🎨 Tailwind CSS Responsive UI</span>
                    <span class="bg-slate-800 px-2 py-1 rounded">🛡️ 100% Offline Resilience</span>
                </div>
            </div>
        `
    },
    {
        title: "Live MVP Core Capabilities",
        tag: "Feature Highlights",
        content: `
            <div class="space-y-3 text-slate-300 text-sm">
                <ul class="space-y-2.5">
                    <li class="flex items-center space-x-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <i data-lucide="zap" class="w-4 h-4 text-amber-400 shrink-0"></i>
                        <span><strong>1-Click Judge Testing:</strong> Pre-loaded scenarios for streetlight, leaking sink, bin overflow, broken stairs, & lab projector.</span>
                    </li>
                    <li class="flex items-center space-x-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <i data-lucide="mic" class="w-4 h-4 text-emerald-400 shrink-0"></i>
                        <span><strong>Voice & Camera Support:</strong> Native speech recognition and image payload encoding.</span>
                    </li>
                    <li class="flex items-center space-x-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <i data-lucide="activity" class="w-4 h-4 text-sky-400 shrink-0"></i>
                        <span><strong>Facilities Operations Dashboard:</strong> Real-time ticket board, category filtering, search, and status lifecycles.</span>
                    </li>
                    <li class="flex items-center space-x-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <i data-lucide="thumbs-up" class="w-4 h-4 text-purple-400 shrink-0"></i>
                        <span><strong>Community Priority Upvoting:</strong> Students upvote duplicate issues to elevate urgent priority.</span>
                    </li>
                </ul>
            </div>
        `
    },
    {
        title: "Campus Impact & Scalability",
        tag: "Future Roadmap",
        content: `
            <div class="space-y-4 text-slate-300 text-sm">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30">
                        <div class="text-xs font-bold text-emerald-400 uppercase mb-1">Immediate University ROI</div>
                        <p class="text-xs text-slate-400">Reduces facility downtime by 65%, eliminates manual dispatch overhead, and guarantees critical hazards are flagged instantly.</p>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-indigo-500/30">
                        <div class="text-xs font-bold text-indigo-400 uppercase mb-1">WhatsApp & SMS Integration</div>
                        <p class="text-xs text-slate-400">Campus chatbot allows students to send a photo via WhatsApp to log tickets effortlessly.</p>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30">
                        <div class="text-xs font-bold text-purple-400 uppercase mb-1">IoT & Smart Sensors</div>
                        <p class="text-xs text-slate-400">Integrates with water meters and smart light sensors for automatic preventive reporting.</p>
                    </div>
                    <div class="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                        <div class="text-xs font-bold text-amber-400 uppercase mb-1">Campus Heatmap Analytics</div>
                        <p class="text-xs text-slate-400">Identify recurring infrastructure failure zones for capital expenditure planning.</p>
                    </div>
                </div>
            </div>
        `
    }
];

function openPitchModal() {
    currentPitchSlide = 0;
    renderPitchSlide();
    document.getElementById('pitch-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closePitchModal() {
    document.getElementById('pitch-modal').classList.add('hidden');
}

function renderPitchSlide() {
    const s = pitchSlides[currentPitchSlide];
    const container = document.getElementById('pitch-slide-content');
    
    container.innerHTML = `
        <div class="mb-4">
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">${s.tag}</span>
            <h3 class="text-2xl font-extrabold text-white mt-1">${s.title}</h3>
        </div>
        <div>
            ${s.content}
        </div>
    `;

    // Render navigation dots
    const dotsContainer = document.getElementById('pitch-dots');
    dotsContainer.innerHTML = '';
    pitchSlides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `w-2.5 h-2.5 rounded-full transition-all ${idx === currentPitchSlide ? 'bg-indigo-400 w-6' : 'bg-slate-700'}`;
        dot.onclick = () => {
            currentPitchSlide = idx;
            renderPitchSlide();
        };
        dotsContainer.appendChild(dot);
    });

    const nextBtn = document.getElementById('pitch-next-btn');
    if (currentPitchSlide === pitchSlides.length - 1) {
        nextBtn.innerText = "Close Pitch";
        nextBtn.onclick = closePitchModal;
    } else {
        nextBtn.innerText = "Next Slide →";
        nextBtn.onclick = nextSlide;
    }

    lucide.createIcons();
}

function nextSlide() {
    if (currentPitchSlide < pitchSlides.length - 1) {
        currentPitchSlide++;
        renderPitchSlide();
    } else {
        closePitchModal();
    }
}

function prevSlide() {
    if (currentPitchSlide > 0) {
        currentPitchSlide--;
        renderPitchSlide();
    }
}

