import Header from '../components/Header';
import mapaHospital from '../images/mapaHospital.jpeg';


export default function(){
    return(
        
        
        <div className="w-full min-h-screen justify-center bg-gray-100 p-4">    
        <Header/> <br />
        
        <img src={mapaHospital} alt="mapaDoHospital"
        className="w-full max-w-4xl rounded-lg shadow-lg object-contain center" />
        </div>
    )
}