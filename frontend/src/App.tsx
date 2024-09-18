import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Middleware from './Middleware';
import Employees from './pages/Employees';
import NavBar from './components/NavBar';
import EmployeeForm from './pages/EmployeeForm';

const App = () => {
  return (
    <Router>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Middleware><Dashboard /></Middleware>} />
        <Route path="/employees" element={<Middleware><Employees /></Middleware>} />
        <Route path="/addemployees" element={<Middleware><EmployeeForm /></Middleware>} />
        <Route path="/employee/:id" element={<Middleware><EmployeeForm /></Middleware>} />

        <Route path="*" element={<NotFound/>} />
      </Routes>
    </Router>
  );
};

export default App;
