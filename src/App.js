import React from 'react';
import DemoPage from './DemoPage';

const App = () => {
  console.log('App component rendering');
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ color: 'blue', fontSize: '24px', textAlign: 'center', margin: '10px 0' }}>
        Debug: App is rendering
      </div>
      <DemoPage />
    </div>
  );
};

export default App;