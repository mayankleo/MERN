import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

type TableDataType = {
  _id: string;
  image: string;
  name: string;
  email: string;
  mobile_no: string;
  designation: string;
  gender: string;
  course: string;
  create_date: Date;
};

const Employees = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<TableDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/users", { withCredentials: true });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Error Fetching Data!");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEdit = (rowId: string) => {
    navigate(`/employee/${rowId}`);
  };

  const handleDelete = async (rowId: string) => {
    try {
      const response = await axios.delete(`http://localhost:3000/user/${rowId}`, { withCredentials: true });
      toast.success(response.data.message);
      setData((prevData) => prevData.filter((row) => row._id !== rowId));
    } catch (error) {
      toast.error("Error deleting user!");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter(
    (row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center gap-9 px-5 my-10">
      <div className="relative w-full flex justify-between items-center">
        <h1 className="text-5xl font-semibold">Employee List</h1>
        <Button>
          <Link to="/addemployees">Add Employees</Link>
        </Button>
      </div>

      <div className="w-full flex justify-center my-4">
        <InputField type="text"
        name="Search"
          placeholder="Search by Name or Email"
          value={searchTerm}
          onChange={handleSearch}/>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-left rounded-md overflow-hidden shadow-[0_0_0_2px]">
          <thead className="bg-black text-white">
            <tr>
              <th>Unique ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Designation</th>
              <th>Gender</th>
              <th>Course</th>
              <th>Create Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className={`${rowIndex % 2 !== 0 ? "bg-gray-100" : ""}`}>
                  <td>{row._id}</td>
                  <td>
                    <img
                      src={`http://localhost:3000/images/${row.image}`}
                      className="h-10"
                      alt={row.name}
                    />
                  </td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.mobile_no}</td>
                  <td>{row.designation}</td>
                  <td>{row.gender}</td>
                  <td>{row.course}</td>
                  <td>{new Date(row.create_date).toLocaleDateString()}</td>
                  <td className="flex gap-2 p-2">
                    <Button onClick={() => handleEdit(row._id)}>Edit</Button>
                    <Button onClick={() => handleDelete(row._id)}>Delete</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-4">
                  No matching employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Employees;
