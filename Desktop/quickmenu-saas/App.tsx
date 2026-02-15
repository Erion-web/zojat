import React, { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import MenuEditor from './components/MenuEditor';
import MenuView from './components/MenuView';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const NotFound: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-5xl mb-6">
      <i className="fa-solid fa-map-signs"></i>
    </div>
    <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">Page Not Found</h1>
    <p className="text-slate-500 mb-8 max-w-sm">The link you followed might be broken, or the page may have been removed.</p>
    <Link to="/" className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">
      Return to Home
    </Link>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  return user ? <>{children}</> : null;
};

import ConnectionTest from './components/ConnectionTest';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
       <Route path="/login" element={<LoginPage />} />
       <Route path="/" element={<LandingPage />} />
       <Route path="/test-connection" element={<ConnectionTest />} />
       
       {/* Protected Admin Routes */}
       <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
       <Route path="/admin/new" element={<ProtectedRoute><MenuEditor /></ProtectedRoute>} />
       <Route path="/admin/edit/:id" element={<ProtectedRoute><MenuEditor /></ProtectedRoute>} />
       
       {/* Public Menu Access - MenuView handles fetching internally now */}
       <Route path="/menu/:slug" element={<MenuView />} />
       <Route path="/:slug" element={<MenuView />} />
       
       <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Check connection on app startup without blocking UI
    const checkConn = async () => {
       try {
         const { supabase } = await import('./services/supabaseClient');
         console.log('Verifying Supabase connection...');
         const { data, error } = await supabase.from('menus').select('*').limit(1);
         if (error) {
            console.error('Supabase Connection Failed:', error);
         } else {
            console.log('Supabase Connection Success:', data);
         }
       } catch (err) {
         console.error('Supabase Unexpected Error:', err);
       }
    };
    checkConn();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-orange-500 text-white p-1.5 rounded-lg">
                <i className="fa-solid fa-utensils"></i>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">QuickMenu</span>
            </Link>
            <nav className="flex space-x-4">
              <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
                <i className="fa-solid fa-toolbox mr-1"></i> Admin
              </Link>
            </nav>
          </header>

          <main className="flex-grow">
            <AppRoutes />
          </main>

          <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center">
            <p className="text-sm">© 2024 QuickMenu SaaS. Built for speed.</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};


export default App;