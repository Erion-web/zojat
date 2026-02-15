
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center overflow-hidden">
        <div className="md:w-1/2 z-10">
          <h1 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight mb-6">
            Instant Digital Menus for <span className="text-orange-500">Modern Businesses.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-md">
            No printing, no apps, no friction. Create a beautiful, temporary digital menu in under 2 minutes. Perfect for seasonal pop-ups, cafes, and restaurants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/admin/new')}
              className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transform hover:-translate-y-1 transition-all shadow-lg shadow-orange-200"
            >
              Get Started Free
            </button>
            <button className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all">
              See Demo
            </button>
          </div>
          <div className="mt-8 flex items-center space-x-4 text-sm text-slate-400">
            <span className="flex items-center"><i className="fa-solid fa-check text-green-500 mr-2"></i> No Credit Card</span>
            <span className="flex items-center"><i className="fa-solid fa-check text-green-500 mr-2"></i> QR Code Included</span>
          </div>
        </div>
        <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
          <div className="w-64 h-[500px] bg-slate-800 rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden transform rotate-2">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl z-20"></div>
            <img 
              src="https://picsum.photos/id/42/400/800" 
              alt="App UI Demo" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
              <div className="text-white">
                <p className="text-xs uppercase tracking-widest text-orange-400 font-bold">Cafe Roma</p>
                <h3 className="text-xl font-serif">Italian Espresso</h3>
                <p className="text-sm opacity-80">Freshly brewed artisan coffee.</p>
                <div className="mt-4 py-2 border-t border-white/20 flex justify-between">
                  <span>Espresso</span>
                  <span className="font-bold">€2.50</span>
                </div>
              </div>
            </div>
          </div>
          {/* Floating Accents */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        </div>
      </section>

      {/* Problems/Solutions */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <i className="fa-solid fa-bolt text-orange-500 text-2xl"></i>
            </div>
            <h3 className="font-bold mb-2">Instant Updates</h3>
            <p className="text-sm text-slate-600">Change prices or items in seconds. No reprinting required.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <i className="fa-solid fa-mobile-screen-button text-blue-500 text-2xl"></i>
            </div>
            <h3 className="font-bold mb-2">App-Free Access</h3>
            <p className="text-sm text-slate-600">Customers scan a QR and view instantly. No downloads needed.</p>
          </div>
          <div>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <i className="fa-solid fa-clock text-green-500 text-2xl"></i>
            </div>
            <h3 className="font-bold mb-2">Temporary Links</h3>
            <p className="text-sm text-slate-600">Perfect for seasonal menus or daily specials. Control expiration.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
