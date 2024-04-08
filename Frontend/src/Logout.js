import { useNavigate } from "react-router-dom";


function Logout({logout, updateUser}){

    const navigate = useNavigate();

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    updateUser({});
    logout();
    navigate("/");
}

export default Logout;