import React from 'react';
import { Navigate } from 'react-router-dom';

// Root index component that serves as the entry point for the application routing
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
