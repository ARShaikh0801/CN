import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Star, 
  CheckCircle, 
  ShieldCheck,
  Building2,
  ExternalLink,
  Info,
  Navigation,
  Award
} from 'lucide-react';

const HospitalDetail = ({ hospital, onBack }) => {
  const [showModal, setShowModal] = useState(false);
  const [isDisclaimerChecked, setIsDisclaimerChecked] = useState(false);

  if (!hospital) return null;

  const acceptedSchemes = hospital.acceptedSchemes || [];
  const hasPMJAY = acceptedSchemes.some(s => s.schemeName === "Ayushman Bharat PM-JAY");
  const hasMA = acceptedSchemes.some(s => s.schemeName === "Mukhyamantri Amrutum Yojana");

  const openOfficialPortal = (url) => {
    if (isDisclaimerChecked) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setShowModal(false);
      setIsDisclaimerChecked(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Results</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500 text-sm">Hospital Details</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hospital Info */}
        <div className="bg-white border border-slate-200 shadow-sm mb-10">
          <div className="p-8 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {hospital.name}
                  </h1>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="px-3 py-1 bg-slate-100 text-sm rounded">
                      {hospital.hospital_type || "Medical Facility"}
                    </span>
                    {hospital.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-slate-900">{hospital.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Location</p>
                  <p className="font-medium text-slate-900">
                    {hospital.address}, {hospital.city} {hospital.pincode}
                  </p>
                </div>
              </div>

              {hospital.contact && (
                <div className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Contact</p>
                    <p className="font-medium text-slate-900">{hospital.contact}</p>
                  </div>
                </div>
              )}
            </div>

            {hospital.map_url && (
              <a
                href={hospital.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400  text-white rounded-lg hover:bg-slate-800"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Specialities */}
            <section className="bg-white border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-slate-600" />
                <h2 className="text-2xl font-bold text-slate-900">Medical Specialties</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {hospital.specialities?.length ? (
                  hospital.specialities.map((spec, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded border">
                      {spec}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">General medical services available</p>
                )}
              </div>
            </section>

            {/* Schemes */}
            <section className="bg-white border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-slate-600" />
                <h2 className="text-2xl font-bold text-slate-900">Government Schemes</h2>
              </div>

              <div className="space-y-4">
                {acceptedSchemes.length ? (
                  acceptedSchemes.map((scheme, idx) => {
                    const isMajor =
                      scheme.schemeName === "Ayushman Bharat PM-JAY" ||
                      scheme.schemeName === "Mukhyamantri Amrutum Yojana";

                    return (
                      <div
                        key={idx}
                        className={`p-5 border-l-4 ${
                          isMajor ? 'bg-blue-50 border-blue-600' : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between">
                          <h3 className="font-bold text-slate-900">
                            {scheme.schemeName}
                          </h3>
                          <CheckCircle className={isMajor ? 'text-blue-600' : 'text-slate-400'} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500">No schemes available</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white border p-6 shadow-sm  top-24">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400  text-white py-3 rounded-lg flex justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Verify Scheme Eligibility
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-5 rounded">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-1" />
                <p className="text-sm text-amber-800">
                  Always verify scheme eligibility directly with the hospital or official portals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

 {/* Verification Modal */}
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
      
      {/* Modal Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-900">
          Verify Eligibility
        </h3>
        <button
          onClick={() => setShowModal(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6">
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 flex gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            For accurate results, eligibility verification is handled directly by the official government portals.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {hasPMJAY && (
            <button
              onClick={() => openOfficialPortal('https://pmjay.gov.in/search')}
              disabled={!isDisclaimerChecked}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/50 group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs">
                  PM
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">
                    Check on PMJAY Portal
                  </div>
                  <div className="text-xs text-slate-500">
                    mera.pmjay.gov.in
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {hasMA && (
            <button
              onClick={() => openOfficialPortal('https://ma.gujarat.gov.in/')}
              disabled={!isDisclaimerChecked}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                  MA
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">
                    Check on MA Portal
                  </div>
                  <div className="text-xs text-slate-500">
                    maa.gujarat.gov.in
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {!hasPMJAY && !hasMA && (
            <div className="text-center py-4 text-slate-500 text-sm">
              No direct government portal integrations available for this hospital's schemes.
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
          <input
            type="checkbox"
            id="disclaimer"
            checked={isDisclaimerChecked}
            onChange={(e) => setIsDisclaimerChecked(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label
            htmlFor="disclaimer"
            className="text-sm text-slate-600 cursor-pointer select-none"
          >
            I understand I am leaving CareNavigator and going to an official government website.
          </label>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default HospitalDetail;
