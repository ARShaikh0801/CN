document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const heroSection = document.getElementById('hero-section');
    const mainForm = document.getElementById('main-form');
    const resultsSection = document.getElementById('results-section');
    const detailsSection = document.getElementById('details-section');

    const symptomsInput = document.getElementById('symptoms-input');
    const cityInput = document.getElementById('city-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const errorMessage = document.getElementById('error-message');

    const newSearchBtn = document.getElementById('new-search-btn');
    const backToResultsBtn = document.getElementById('back-to-results-btn');
    const hospitalFilter = document.getElementById('hospital-filter');
    const hospitalsList = document.getElementById('hospitals-list');

    // Summary Elements
    const summarySymptoms = document.getElementById('summary-symptoms');
    const summaryLocation = document.getElementById('summary-location');
    const aiAnalysisSummary = document.getElementById('ai-analysis-summary');
    const summarySpeciality = document.getElementById('summary-speciality');
    const summaryUrgency = document.getElementById('summary-urgency');
    const summaryDiseases = document.getElementById('summary-diseases');

    // State
    let currentHospitals = [];
    let currentAnalysis = null;
    let currentSymptoms = "";
    let currentCity = "";

    // Event Listeners
    analyzeBtn.addEventListener('click', handleAnalyze);
    newSearchBtn.addEventListener('click', () => showSection('hero'));
    backToResultsBtn.addEventListener('click', () => showSection('results'));
    hospitalFilter.addEventListener('change', renderHospitals);
    symptomsInput.addEventListener('input', () => {
        analyzeBtn.disabled = !symptomsInput.value.trim();
    });

    // Navigation Logic
    function showSection(section) {
        // Hide all
        heroSection.style.display = 'none';
        mainForm.style.display = 'none';
        resultsSection.style.display = 'none';
        detailsSection.style.display = 'none';

        // Show target
        if (section === 'hero') {
            heroSection.style.display = 'block';
            mainForm.style.display = 'block';
            // Also reset form? Maybe keep values.
            lucide.createIcons();
        } else if (section === 'results') {
            resultsSection.style.display = 'block';
            lucide.createIcons();
        } else if (section === 'details') {
            detailsSection.style.display = 'block';
            lucide.createIcons();
        }

        window.scrollTo(0, 0);
    }

    // API & Logic
    async function handleAnalyze() {
        const symptoms = symptomsInput.value.trim();
        const city = cityInput.value;

        if (!symptoms) return;

        setLoading(true);
        errorMessage.classList.add('hidden');

        try {
            // 1. Analyze
            const analyzeRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms_text: symptoms, location: city })
            });
            const analyzeData = await analyzeRes.json();

            if (analyzeData.error) throw new Error(analyzeData.error);
            currentAnalysis = analyzeData.analysis;
            currentSymptoms = symptoms;
            currentCity = city;

            // 2. Search
            const speciality = currentAnalysis?.speciality || "General Physician";
            const disease = currentAnalysis?.possible_diseases?.[0]?.name || "General";

            const params = new URLSearchParams({
                speciality,
                city,
                disease
            });

            const hospitalsRes = await fetch(`/api/hospitals?${params.toString()}`);
            const hospitalsData = await hospitalsRes.json();

            if (hospitalsData.error) throw new Error(hospitalsData.error);
            currentHospitals = hospitalsData.hospitals;

            // 3. Render
            renderSummary();
            renderHospitals();
            showSection('results');

        } catch (err) {
            console.error(err);
            errorMessage.textContent = "Unable to process request. Please try again.";
            errorMessage.classList.remove('hidden');
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        analyzeBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            btnLoader.classList.add('flex', 'items-center', 'gap-2');
        } else {
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            btnLoader.classList.remove('flex');
        }
    }

    function renderSummary() {
        summarySymptoms.textContent = currentSymptoms;
        summaryLocation.textContent = currentCity;

        if (currentAnalysis) {
            aiAnalysisSummary.classList.remove('hidden');
            summarySpeciality.textContent = currentAnalysis.speciality;

            // Urgency Badge
            const urgency = (currentAnalysis.urgency || "low").toLowerCase();
            summaryUrgency.textContent = urgency.toUpperCase();
            summaryUrgency.className = "inline-block px-3 py-1 rounded-full text-xs font-semibold";
            if (urgency === 'high') summaryUrgency.classList.add('bg-red-100', 'text-red-700');
            else if (urgency === 'medium') summaryUrgency.classList.add('bg-orange-100', 'text-orange-700');
            else summaryUrgency.classList.add('bg-emerald-100', 'text-emerald-700');

            // Diseases
            summaryDiseases.innerHTML = '';
            (currentAnalysis.possible_diseases || []).forEach(d => {
                const div = document.createElement('div');
                div.className = "flex justify-between text-xs";
                div.innerHTML = `
                    <span class="text-slate-700">${d.name}</span>
                    <span class="text-slate-500">${(d.probability * 100).toFixed(0)}%</span>
                `;
                summaryDiseases.appendChild(div);
            });
        }
    }

    function renderHospitals() {
        hospitalsList.innerHTML = '';
        const filter = hospitalFilter.value;

        const filtered = currentHospitals.filter(h => {
            if (filter === 'all') return true;
            return (h.hospital_type || "").toLowerCase() === filter;
        });

        if (filtered.length === 0) {
            hospitalsList.innerHTML = `
                <div class="bg-white rounded-2xl p-8 text-center text-slate-500">
                    No hospitals found.
                </div>
            `;
            return;
        }

        filtered.forEach(h => {
            const card = document.createElement('div');
            card.className = "bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow";

            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h4 class="text-xl font-bold text-slate-900 mb-1">${h.name}</h4>
                        <div class="flex items-center gap-4 text-sm text-slate-600 mb-3">
                            <div class="flex items-center gap-1">
                                <i data-lucide="map-pin" class="w-4 h-4"></i>
                                ${h.address}
                            </div>
                            ${h.rating ? `
                            <div class="flex items-center gap-1">
                                <i data-lucide="star" class="w-4 h-4 text-yellow-400 fill-current"></i>
                                ${h.rating}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ${h.cost_text ? `
                    <div class="text-right">
                        <div class="text-2xl font-bold text-emerald-600">${h.cost_text}</div>
                        <div class="text-xs text-slate-500">Est. treatment</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">${h.hospital_type || 'Hospital'}</span>
                    ${currentAnalysis?.speciality ? `
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">${currentAnalysis.speciality}</span>
                    ` : ''}
                </div>
                
                <div class="mt-4 flex gap-3">
                    <button class="view-details-btn flex-1 bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all text-center">
                        View Details
                    </button>
                    ${h.map_url ? `
                    <a href="${h.map_url}" target="_blank" class="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all text-center flex items-center justify-center gap-2">
                        <i data-lucide="map-pin" class="w-4 h-4"></i>
                        Directions
                    </a>
                    ` : `
                    <button disabled class="flex-1 bg-slate-100 text-slate-400 font-semibold py-3 rounded-lg cursor-not-allowed">Map Unavailable</button>
                    `}
                </div>
            `;

            // Event listener for view details
            card.querySelector('.view-details-btn').addEventListener('click', () => {
                showHospitalDetails(h);
            });

            hospitalsList.appendChild(card);
        });

        lucide.createIcons();
    }

    function showHospitalDetails(hospital) {
        const content = document.getElementById('hospital-detail-content');

        // Replicating detail view structure
        content.innerHTML = `
          <div class="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <!-- Header Banner -->
            <div class="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              
              <div class="relative z-10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium mb-3 border border-white/20">
                      ${hospital.hospital_type}
                    </span>
                    <h2 class="text-3xl md:text-4xl font-bold mb-2">${hospital.name}</h2>
                    <div class="flex items-center gap-2 text-blue-50 text-sm md:text-base">
                      <i data-lucide="map-pin" class="w-4 h-4"></i>
                      ${hospital.address}, ${hospital.city}
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                    <i data-lucide="star" class="w-5 h-5 text-yellow-300 fill-current"></i>
                    <span class="text-2xl font-bold">${hospital.rating}</span>
                    <span class="text-blue-100 text-sm">/ 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-8">
              <div class="grid md:grid-cols-3 gap-8">
                <!-- Main Info -->
                <div class="md:col-span-2 space-y-8">
                  <!-- Stats -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div class="text-blue-600 font-bold text-xl mb-1">24/7</div>
                      <div class="text-xs text-slate-500 uppercase tracking-wide">Emergency</div>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div class="text-cyan-600 font-bold text-xl mb-1">50+</div>
                      <div class="text-xs text-slate-500 uppercase tracking-wide">Doctors</div>
                    </div>
                     <!-- More stats if available, currently hardcoded placeholders based on typical UI -->
                  </div>

                  <!-- About -->
                  <div>
                    <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <i data-lucide="info" class="w-5 h-5 text-blue-500"></i>
                      About Hospital
                    </h3>
                    <p class="text-slate-600 leading-relaxed">
                      ${hospital.name} is a premier healthcare facility providing medical care in ${hospital.city}.
                      Specializing in ${currentAnalysis?.speciality || 'various fields'}, they offer comprehensive services.
                    </p>
                  </div>
                </div>

                <!-- Sidebar Actions -->
                <div class="space-y-6">
                   <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <div class="mb-6">
                        <p class="text-slate-500 text-sm mb-1">Estimated Cost</p>
                        <p class="text-3xl font-bold text-slate-900">${hospital.cost_text}</p>
                        <p class="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <i data-lucide="shield-check" class="w-3 h-3"></i>
                          Includes consultation & treatment
                        </p>
                      </div>

                      <button class="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mb-3">
                        Book Appointment
                      </button>
                      <button class="w-full bg-white text-slate-700 font-semibold py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="phone" class="w-4 h-4"></i>
                        Call Hospital
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        `;

        showSection('details');
    }
});
