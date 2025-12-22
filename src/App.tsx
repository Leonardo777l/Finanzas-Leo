import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Income } from './pages/Income';
import { Portfolio } from './pages/Portfolio';
import { CashFlow } from './pages/CashFlow';
import { Goals } from './pages/Goals';
import { Subscriptions } from './pages/Subscriptions';
import { CalendarView } from './pages/CalendarView';
import { Distribution } from './pages/Distribution';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { useFinanceStore } from './store/financeStore';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { Loader2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();
  const { setUserId } = useFinanceStore();

  console.log("App Render - User:", user, "Loading:", loading);

  useFirestoreSync();

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    } else {
      setUserId(null);
    }
  }, [user, setUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'income' && <Income />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'portfolio' && <Portfolio />}
      {activeTab === 'cashflow' && <CashFlow />}
      {activeTab === 'goals' && <Goals />}
      {activeTab === 'subscriptions' && <Subscriptions />}
      {activeTab === 'distribution' && <Distribution />}
    </Layout>
  );
}

export default App;
