import { Link, useNavigate } from "react-router-dom"
import Button from "./Button"
import axios from "axios";
import { toast } from "react-toastify";

const NavBar = () => {
    const navigate = useNavigate();
    const isAuthenticated = () => {
        return !!localStorage.getItem('isAuthenticated')
    }
    const handelLogout = async () => {
        try {
            await axios.get('http://localhost:3000/logout', { withCredentials: true });
            localStorage.removeItem('isAuthenticated');
            navigate('/login');
        } catch (error) {
            toast.error("Something Went Wrong!")
        }
    }
    return (
        <div className='flex gap-6 justify-center items-center py-2'>
            <Button><Link to="/">Home</Link></Button>
            <Button><Link to="/login">Login</Link></Button>
            <Button><Link to="/dashboard">Dashboard</Link></Button>
            <Button><Link to="/employees">Employees</Link></Button>
            {isAuthenticated() && <Button onClick={handelLogout}>Logout ({localStorage.getItem('name')})</Button>}
        </div>
    )
}

export default NavBar