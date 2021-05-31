import React from 'react';
import Router from 'router/Router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/css/main.css';
import {BrowserRouter} from 'react-router-dom';
import UUIDProvider from 'providers/UUIDProvider';
import Preloader from 'components/Preloader/Preloader';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <UUIDProvider>
          <Preloader>
            <Router />
          </Preloader>
        </UUIDProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
