import React, { useEffect, useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../utils/globalurl';

const Signup = () => {
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        userType: "",
        course_id: "",
    });
    const [courses, setCourses] = useState([]);
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (values.password !== values.confirm_password) {
            setPasswordError("Passwords do not match");
            return;
        }
        setPasswordError("");

        // Add admin registration option
        const endpoint = values.userType === "admin" 
            ? `${baseUrl}auth/admin/register`
            : `${baseUrl}auth/signup`;

        axios.post(endpoint, values)
            .then((res) => {
                if (res.data.email) {
                    setError("Email is already used");
                } else if (res.data.signupStatus || res.data.registerStatus) {
                    navigate("/login", { state: { action: 'navtologin' } });
                    toast.success("Account created successfully");
                }
            })
            .catch((err) => {
                console.log(err);
                setError("An error occurred during signup");
            });
    };

    useEffect(() => {
        axios.get(`${baseUrl}auth/courses`)
            .then((res) => {
                setCourses(res.data);
            })
            .catch(err => console.log(err))
    }, [])

    return (
        <>
            <ToastContainer position="top-center" hideProgressBar />
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Create Account</h3>
                            <hr className="divider my-4" />
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mt-3 pt-2">
                <div className="col-lg-12">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row justify-content-center">
                                <div className="container col-lg-6 col-md-8 col-sm-10">
                                    <form onSubmit={handleSubmit} id="create_account">
                                        <div className="form-group">
                                            <label htmlFor="name" className="control-label">Name</label>
                                            <input onChange={handleChange} value={values.name} type="text" className="form-control" id="name" name="name" required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email" className="control-label">Email</label>
                                            <input onChange={handleChange} value={values.email} type="email" className="form-control" id="email" name="email" required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password" className="control-label">Password</label>
                                            <input onChange={handleChange} value={values.password} type="password" className="form-control" name="password" required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirm_password" className="control-label">Confirm Password</label>
                                            <input onChange={handleChange} value={values.confirm_password} type="password" className="form-control" name="confirm_password" required />
                                            {passwordError && <div className="text-danger">{passwordError}</div>}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="userType" className="control-label">User Type</label>
                                            <select onChange={handleChange} value={values.userType} className="custom-select" id="userType" name="userType" required>
                                                <option value="">Select Account Type</option>
                                                <option value="alumnus">Alumni</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </div>
                                        {values.userType === "alumnus" &&
                                            <div className="form-group">
                                                <label htmlFor="course_id" className="control-label">Course</label>
                                                <select onChange={handleChange} value={values.course_id} className="form-control select2" name="course_id" required>
                                                    <option value="">Select Course</option>
                                                    {courses.map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        }
                                        <hr className="divider" />
                                        <div className="row justify-content-center">
                                            <div className="col-md-6 text-center">
                                                <button type="submit" className="btn btn-info btn-block">Create Account</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </>
    )
}

export default Signup
