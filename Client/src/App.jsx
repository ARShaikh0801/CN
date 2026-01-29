import { useState } from 'react';
import { Heart, MapPin, Stethoscope, Hospital, TrendingUp, Search, ChevronRight, Star } from 'lucide-react';
import { analyzeSymptoms, findHospitals } from './api/api';
import HospitalDetail from './components/HospitalDetail';

function App() {
  const [symptoms, setSymptoms] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [step, setStep] = useState('hero');
  const [analysis, setAnalysis] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    
    setError(null);
    setLoading(true);
    setHospitals([]);
    setAnalysis(null);

    try {
      // 1. Analyze Symptoms
      const analysisData = await analyzeSymptoms(symptoms, city);
      setAnalysis(analysisData.analysis);

      // 2. Derive Search Params
      const speciality = analysisData.analysis?.speciality || "General Physician";
      const disease = analysisData.analysis?.possible_diseases?.[0]?.name || "General";

      // 3. Find Hospitals
      const hospitalsData = await findHospitals({ speciality, city, disease });
      setHospitals(hospitalsData.hospitals);
      
      setStep('results');
    } catch (err) {
      console.error(err);
      setError("Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
    setStep('detail');
  };

  const handleBackToResults = () => {
    setSelectedHospital(null);
    setStep('results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-slate-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                CareNavigator
              </h1>
            </div>
          </div>
        </div>
      </header>

      {step === 'hero' && (
        <>
          {/* Hero Section */}
          <section className="relative min-h-[85vh] md:min-h-screen flex items-center overflow-hidden py-8 md:py-0">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Gradient orbs */}
              <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center relative">
                {/* Animated icon composition for mobile */}
                <div className="md:hidden w-full flex justify-center mb-6 relative z-10">
                  <div className="relative w-64 h-64">
                    {/* Central pulse circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse">
                      <Heart className="w-16 h-16 text-white animate-pulse" />
                    </div>
                    
                    {/* Orbiting icons */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '0s'}}>
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Stethoscope className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '1s'}}>
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Hospital className="w-8 h-8 text-cyan-600" />
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '1.5s'}}>
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Search className="w-8 h-8 text-cyan-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center md:text-left space-y-4 md:space-y-6 z-10 relative">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    AI-Powered Healthcare Assistant
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                    Find the Right Care, Right When You Need It
                  </p>
                  <p className="text-base sm:text-lg text-slate-500">
                    Describe your symptoms and get instant recommendations for nearby specialists, hospitals, and estimated treatment costs.
                  </p>
                </div>
                
                {/* Animated icon composition for desktop */}
                <div className="hidden md:flex justify-center items-center relative">
                  <div className="relative w-96 h-96">
                    {/* Central pulse circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse">
                      <Heart className="w-24 h-24 text-white animate-pulse" />
                    </div>
                    
                    {/* Orbiting icons - larger for desktop */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '0s'}}>
                      <div className="bg-white rounded-full p-4 shadow-xl">
                        <Stethoscope className="w-12 h-12 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '1s'}}>
                      <div className="bg-white rounded-full p-4 shadow-xl">
                        <Hospital className="w-12 h-12 text-cyan-600" />
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '0.5s'}}>
                      <div className="bg-white rounded-full p-4 shadow-xl">
                        <TrendingUp className="w-12 h-12 text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 animate-bounce" style={{animationDuration: '3s', animationDelay: '1.5s'}}>
                      <div className="bg-white rounded-full p-4 shadow-xl">
                        <Search className="w-12 h-12 text-cyan-500" />
                      </div>
                    </div>
                    
                    {/* Diagonal icons */}
                    <div className="absolute top-1/4 left-1/4 animate-bounce" style={{animationDuration: '3s', animationDelay: '0.75s'}}>
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <MapPin className="w-10 h-10 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-1/4 right-1/4 animate-bounce" style={{animationDuration: '3s', animationDelay: '1.25s'}}>
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Star className="w-10 h-10 text-cyan-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12">

          {/* Main Input Card */}
          <div className="max-w-xl mx-auto mb-12 md:mb-20 relative">
            {/* Decorative gradient ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-2xl md:rounded-3xl blur opacity-20 md:opacity-0"></div>
            
            <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-200/30 border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-6 md:px-8 py-5 md:py-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Start Your Health Journey</h3>
                <p className="text-sm md:text-base text-blue-50">Tell us what you're experiencing</p>
              </div>
              <div className="p-6 md:p-8 space-y-5 md:space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    ⚠️ {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Describe Your Symptoms
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="E.g., I have had a severe high fever for 3 days with joint pain and nausea..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-slate-700 placeholder-slate-400 text-sm md:text-base"
                    rows="4"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Your Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-700 text-sm md:text-base"
                      placeholder="Enter your city"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!symptoms.trim() || loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-3.5 rounded-lg hover:from-blue-600 hover:to-cyan-500 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 hover:shadow-lg flex items-center justify-center gap-2 group text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Analyze & Find Hospitals
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16 md:mt-24 mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8 md:mb-12">How It Works</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg shadow-blue-500/30">
                  <Stethoscope className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2">Input Symptoms</h4>
                <p className="text-xs md:text-sm text-slate-600">Describe what you're feeling in plain English</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-lg border border-cyan-100 hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg shadow-cyan-500/30">
                  <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2">AI Analysis</h4>
                <p className="text-xs md:text-sm text-slate-600">Our AI identifies potential causes and specialist types.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl md:rounded-2xl p-6 md:p-8 text-center shadow-lg border border-blue-100 hover:shadow-xl transition-shadow sm:col-span-2 md:col-span-1">
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg shadow-blue-400/30">
                  <Hospital className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2">Get Recommendations</h4>
                <p className="text-xs md:text-sm text-slate-600">See nearby specialists and estimated costs</p>
              </div>
            </div>
          </div>
        </main>
        </>
      )}

      {step === 'results' && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => setStep('hero')}
            className="mb-6 text-blue-600 font-medium flex items-center gap-2 hover:gap-3 transition-all"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            New Search
          </button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Recommended Hospitals & Doctors</h3>
              
              {hospitals && hospitals.length > 0 ? (
                hospitals.map((hospital, i) => (
                  <div key={hospital._id || i} className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-900 mb-1">{hospital.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {hospital.address}
                          </div>
                          {hospital.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {hospital.rating}
                            </div>
                          )}
                        </div>
                      </div>
                      {hospital.cost_text && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">{hospital.cost_text}</div>
                          <div className="text-xs text-slate-500">Est. treatment</div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {hospital.hospital_type || 'General Hospital'}
                      </span>
                      {analysis?.speciality && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {analysis.speciality}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => handleHospitalClick(hospital)}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all text-center"
                      >
                        View Details
                      </button>
                      {hospital.map_url ? (
                        <a
                          href={hospital.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all text-center flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Directions
                        </a>
                      ) : (
                        <button disabled className="flex-1 bg-slate-100 text-slate-400 font-semibold py-3 rounded-lg cursor-not-allowed">
                          Map Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
                  No hospitals found for this search.
                </div>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 sticky top-24">
                <h4 className="font-bold text-slate-900 mb-4">Your Search</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Symptoms</p>
                    <p className="text-slate-700">{symptoms}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Location</p>
                    <p className="text-slate-700">{city}</p>
                  </div>
                  {analysis && (
                    <>
                      <div className="pt-3 border-t">
                        <p className="text-slate-500 mb-1">Recommended Specialist</p>
                        <p className="text-lg font-bold text-blue-600">{analysis.speciality}</p>
                      </div>
                      {analysis.urgency && (
                        <div>
                          <p className="text-slate-500 mb-1">Urgency Level</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            analysis.urgency.toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                            analysis.urgency.toLowerCase() === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {analysis.urgency.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {analysis.possible_diseases && analysis.possible_diseases.length > 0 && (
                        <div>
                          <p className="text-slate-500 mb-2">Possible Conditions</p>
                          <div className="space-y-1">
                            {analysis.possible_diseases.map((disease, idx) => (
                              <div key={idx} className="flex justify-between text-xs">
                                <span className="text-slate-700">{disease.name}</span>
                                <span className="text-slate-500">{(disease.probability * 100).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {step === 'detail' && (
        <HospitalDetail 
          hospital={selectedHospital} 
          onBack={handleBackToResults} 
        />
      )}

      {/* Footer */}
      <footer className="bg-blue-100/50 text-slate-700 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">
            <strong>Disclaimer:</strong> AI-generated results for informational purposes only. 
            Always consult medical professionals for emergencies.
          </p>
          <p className="text-xs mt-2 text-slate-500">Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App;