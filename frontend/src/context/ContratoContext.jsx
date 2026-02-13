import { createContext, useContext } from "react";
import { useParams } from "react-router-dom";

const ContratoContext = createContext();

export default function ContratoProvider( {children} ){
  const {contratoId} = useParams();

  return(
    <ContratoContext.Provider value={{contratoId}}>
      {children}
    </ContratoContext.Provider>
  );
}
export function useContrato(){

  const context = useContext(ContratoContext);

  if (!context){
    throw new Error("Use contrato nao esta no contrato provider")
  }

  return context ;
}