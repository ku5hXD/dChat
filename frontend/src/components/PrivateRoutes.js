import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext'
import { Dashboard } from "./Dashboard";

export default function PrivateRoute() {

    const { isUserAuthenticated } = useAuth()

    return isUserAuthenticated ? <Dashboard /> : <Navigate to="/login" />;

}