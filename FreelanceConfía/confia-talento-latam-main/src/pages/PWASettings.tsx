import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PWASettings from '@/components/pwa/PWASettings';

const PWASettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <PWASettings />
      </main>
      <Footer />
    </div>
  );
};

export default PWASettingsPage;