import React from 'react';
import Navbar from '../components/Navbar';
import BusinessList from '../components/BusinessList';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4">
        <BusinessList />
      </main>
    </div>
  );
};

export default Home;