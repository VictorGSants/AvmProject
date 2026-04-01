export function getStartOfWeek() {
    
    const segunda = new Date();
    const dia = segunda.getDay();
    
    const offset = dia === 0 ? 6 : dia - 1

    segunda.setDate(segunda.getDate() - offset)
   
    segunda.setHours(0,0,0,0)

    return segunda;

}
export function getEndOfWeek(){
    
    const segunda = getStartOfWeek();
    const domingo = new Date(segunda);
    domingo.setDate(domingo.getDate() + 6)

   
    domingo.setHours(23,59,59,999)
    
    
    
    return domingo
}
