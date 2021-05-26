import React from 'react';
import Router from 'router/Router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/css/main.css';
import {BrowserRouter} from 'react-router-dom';
import UUIDProvider from 'providers/UUIDProvider';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <UUIDProvider>
          <Router />
        </UUIDProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
