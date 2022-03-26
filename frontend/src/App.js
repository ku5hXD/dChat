import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoutes";
import { AuthProvider } from './contexts/AuthContext'


function App() {

  return (
    <Router>
      <div>
        <AuthProvider>
          <Routes>
            <Route exact path="/" element={<PrivateRoute />}></Route>
            <Route exact path="/login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );

}

export default App;
