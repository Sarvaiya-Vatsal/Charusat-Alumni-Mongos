import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchUsers = () => {
    setIsLoading(true);
    axios.get(`${baseUrl}auth/users`)
      .then((res) => {
        console.log("Users data:", res.data);
        setUsers(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        toast.error("Failed to load users");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId) => {
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(userId);
    
    axios.delete(`${baseUrl}auth/user/${userId}`)
      .then((res) => {
        toast.success(res.data.message);
        // Refresh the user list
        fetchUsers();
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        toast.error(err.response?.data?.error || "Failed to delete user");
      })
      .finally(() => {
        setIsDeleting(null);
      });
  };

  return (
    <div className="container-fluid mt-4">
      <ToastContainer position="top-center" />

      <div className="row">
        <div className="col-lg-12">
          <Link to="/dashboard/users/manage" className="btn btn-primary float-end btn-sm">
            <FaPlus /> New User
          </Link>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-lg-12 padzero">
          <div className="card tablecard">
            <div className="card-header">
              <h5 className="card-title">User Management</h5>
            </div>
            <div className="card-body cardwidth">
              {isLoading ? (
                <div className="text-center my-3">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="alert alert-info">No users found</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th className="text-center">#</th>
                        <th className="text-center">Name</th>
                        <th className="text-center">Email</th>
                        <th className="text-center">Type</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user._id || index}>
                          <td className="text-center">{index + 1}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.type}</td>
                          <td className="text-center">
                            <Link 
                              to="/dashboard/users/manage" 
                              state={{ status: "edit", data: user }} 
                              className="btn btn-primary btn-sm me-2"
                            >
                              <FaEdit /> Edit
                            </Link>
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-danger btn-sm"
                              disabled={isDeleting === user._id}
                            >
                              {isDeleting === user._id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <><FaTrash /> Delete</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
