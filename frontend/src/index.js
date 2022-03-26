import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MoralisProvider } from "react-moralis";
import './fonts/pixeboy/Pixeboy.ttf';
import './fonts/pixellari/Pixellari.ttf';

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider appId='fGasuAdAzKAwcd1NmQ6MjxMBDpEh8frbuJWpxSVq' serverUrl='https://as7gs0ed52qy.usemoralis.com:2053/server'>
      <App />
    </MoralisProvider>
  </React.StrictMode >,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
