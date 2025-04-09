import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../../utils/globalurl';

const ManageUser = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        _id: '',
        name: '',
        email: '',
        password: '',
        type: 'alumnus'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);

    useEffect(() => {
        if (location.state && location.state.status === 'edit') {
            const { data } = location.state;
            setUserData({
                _id: data._id,
                name: data.name,
                email: data.email,
                password: '',
                type: data.type
            });
            setIsNewUser(false);
        } else {
            setIsNewUser(true);
        }
    }, [location.state]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            if (isNewUser) {
                // Creating a new user
                const res = await axios.post(`${baseUrl}auth/admin/register`, userData);
                toast.success("User created successfully");
                setUserData({
                    _id: '',
                    name: '',
                    email: '',
                    password: '',
                    type: 'alumnus'
                });
            } else {
                // Updating an existing user
                const res = await axios.put(`${baseUrl}auth/user/${userData._id}`, userData);
                toast.success(res.data.message);
            }
            
            // Navigate back to users list after a slight delay
            setTimeout(() => {
                navigate("/dashboard/users");
            }, 2000);
        } catch (error) {
            console.error("Error saving user:", error);
            toast.error(error.response?.data?.error || "Failed to save user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <div className="container-fluid">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title">{isNewUser ? 'Create New User' : 'Edit User'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} id="manage-user">
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    id="name" 
                                    className="form-control" 
                                    value={userData.name} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    className="form-control" 
                                    value={userData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    className="form-control" 
                                    value={userData.password}
                                    onChange={handleChange} 
                                    required={isNewUser}
                                />
                                {!isNewUser && (
                                    <small className="form-text text-muted">
                                        Leave this blank if you don't want to change the password.
                                    </small>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="type" className="form-label">User Type</label>
                                <select 
                                    className="form-select" 
                                    name="type" 
                                    id="type"
                                    value={userData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="alumnus">Alumnus</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-between">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save User'
                                    )}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary" 
                                    onClick={() => navigate("/dashboard/users")}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ManageUser