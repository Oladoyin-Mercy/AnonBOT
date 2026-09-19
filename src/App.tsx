import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './views/LandingPage';
import { CreateRoomView } from './views/CreateRoomView';
import { FeedbackSubmissionView } from './views/FeedbackSubmissionView';
import { CreatorDashboardView } from './views/CreatorDashboardView';
import { RoomResultsView } from './views/RoomResultsView';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeRoomId, setActiveRoomId] = useState<string>('presentation-7x2k');

  // Handle URL hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) {
        setCurrentView('landing');
        return;
      }

      if (hash.startsWith('room=')) {
        const id = hash.replace('room=', '');
        setActiveRoomId(id);
        setCurrentView('submit');
      } else if (hash.startsWith('results=')) {
        const id = hash.replace('results=', '');
        setActiveRoomId(id);
        setCurrentView('room-results');
      } else if (hash === 'create') {
        setCurrentView('create');
      } else if (hash === 'dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string, params?: { roomId?: string }) => {
    if (params?.roomId) {
      setActiveRoomId(params.roomId);
    }

    if (view === 'submit') {
      window.location.hash = `room=${params?.roomId || activeRoomId}`;
    } else if (view === 'room-results') {
      window.location.hash = `results=${params?.roomId || activeRoomId}`;
    } else if (view === 'create') {
      window.location.hash = 'create';
    } else if (view === 'dashboard') {
      window.location.hash = 'dashboard';
    } else {
      window.location.hash = '';
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-primary">
      <Navbar currentView={currentView} onNavigate={navigateTo} />

      <main className="flex-1">
        {currentView === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {currentView === 'create' && <CreateRoomView onNavigate={navigateTo} />}
        {currentView === 'submit' && (
          <FeedbackSubmissionView roomId={activeRoomId} onNavigate={navigateTo} />
        )}
        {currentView === 'dashboard' && <CreatorDashboardView onNavigate={navigateTo} />}
        {currentView === 'room-results' && (
          <RoomResultsView roomId={activeRoomId} onNavigate={navigateTo} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
