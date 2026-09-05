import { API_BASE_URL } from '../config/api';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react'
import auth from '../firebase/firebase.config';
import axios from 'axios';


// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const AuthProvider = ({children}) => {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  
  const registerWithEmailPassword = (email,pass) => {
    return createUserWithEmailAndPassword(auth,email,pass)
  }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      
    })
    return () => {
      unsubscribe()
    }
    
  },[])

  // getting role of the user
  useEffect(() => {
    if(!user) return;
    axios.get(`${API_BASE_URL}/users/role/${user.email}`)
    .then(res => {
      setRole(res.data.role)
    })
  },[user])

  const authData = {
    registerWithEmailPassword,
    user,
    setUser,
    loading
  }

  return <AuthContext value={authData}>
    {children}
  </AuthContext>
}

export default AuthProvider
