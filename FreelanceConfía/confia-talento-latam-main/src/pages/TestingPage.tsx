import React from 'react';
import FeatureTestSuite from '@/components/testing/FeatureTestSuite';

const TestingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <FeatureTestSuite />
    </div>
  );
};

export default TestingPage;