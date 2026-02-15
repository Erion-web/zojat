
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [details, setDetails] = useState<string>('');
  const [envCheck, setEnvCheck] = useState<any>({});

  useEffect(() => {
    const checkConnection = async () => {
      // 1. Check Environment Variables
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      setEnvCheck({
        VITE_SUPABASE_URL: url ? 'Defined (starts with ' + url.substring(0, 8) + '...)' : 'MISSING',
        VITE_SUPABASE_ANON_KEY: key ? 'Defined (starts with ' + key.substring(0, 5) + '...)' : 'MISSING'
      });

      if (!url || !key) {
        setStatus('FAILED: Missing Environment Variables');
        return;
      }

      try {
        // 2. Try a simple query
        // EXPECTED TEST QUERY: supabase.from('menus').select('*').limit(1)
        const { data, error } = await supabase.from('menus').select('*').limit(1);
        
        if (error) {
          console.error('Supabase Connection Failed:', error);
          setStatus('FAILED: Database Query Error');
          setDetails(JSON.stringify(error, null, 2));
        } else {
          console.log('Supabase Connection Success:', data);
          setStatus('SUCCESS: Connected to Supabase');
          setDetails(`Query successful. Rows found: ${data.length}\nData: ${JSON.stringify(data, null, 2)}`);
        }
      } catch (err: any) {
        console.error('Supabase Unexpected Error:', err);
        setStatus('FAILED: Unexpected Error');
        setDetails(err.message);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Diagnostic</h1>
      
      <div className={`p-4 rounded-lg mb-6 ${status.startsWith('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <p className="font-bold">{status}</p>
      </div>

      <h2 className="text-lg font-bold mb-2">Environment Variables</h2>
      <pre className="bg-slate-100 p-4 rounded mb-6 text-sm overflow-auto">
        {JSON.stringify(envCheck, null, 2)}
      </pre>

      <h2 className="text-lg font-bold mb-2">Error Details</h2>
      <pre className="bg-slate-900 text-white p-4 rounded text-xs overflow-auto font-mono min-h-[100px]">
        {details || 'No errors logged.'}
      </pre>
      
      <div className="mt-6 text-sm text-slate-500">
        <p>If Env Vars are missing, check your <code>.env.local</code> file.</p>
        <p>If Query Fails, check your Supabase Project URL/Key and ensure RLS policies allow access.</p>
      </div>
    </div>
  );
};

export default ConnectionTest;
