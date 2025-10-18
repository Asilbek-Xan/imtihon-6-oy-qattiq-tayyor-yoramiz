export function checkAuth(){
    if(localStorage.getItem("token")){
        return true;
    } else {
        return false;
    }
}