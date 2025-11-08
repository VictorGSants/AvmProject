
import { Navigate, useLocation } from 'react-router-dom'; // serve pra dizer qual rota o usuario esta
import { auth } from '../../firebaseConfig';
import {useAuthState} from "react-firebase-hooks/auth"

export default function ProtectedRoutes ({children}){
    const[user, loading] = useAuthState(auth);
    const location = useLocation();
    const tipoUsuario = localStorage.getItem("tipoUsuario");

    if (loading) return <p>Carregando...</p>;

    if (!user) return <Navigate to="/"/>;

    if (location.pathname.startsWith("/gestor") && tipoUsuario !== "gestor"){
        return <Navigate to="/tecnico"/>
    }
    if (location.pathname.startsWith("/tecnico") && tipoUsuario !== "tecnico"){
        return <Navigate to="/gestor"/>
    }
   



    return children;
      
    ;
  }


