import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
interface MiddlewareProps {
    children: React.ReactNode;
}

const Middleware = ({ children }: MiddlewareProps) => {
    const location = useLocation();
    const isAuthenticated = () => {
        return !!localStorage.getItem('isAuthenticated')
    }

    return isAuthenticated() ? <>{children}</> : <Navigate to={`/login?RedirectTo=${location.pathname}`} />;
};

export default Middleware;
