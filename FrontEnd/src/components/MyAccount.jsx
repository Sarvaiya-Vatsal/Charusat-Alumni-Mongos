import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const MyAccount = () => {
    const [acc, setAcc] = useState({
        name: '',
        connected_to: "",
        course_id: "",
        email: "",
        gender: "",
        password: "",
        batch: "",
    });
    const [file, setFile] = useState(null);
    const [courses, setCourses] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const alumnus_id = localStorage.getItem("alumnus_id");
                if (!alumnus_id) {
                    toast.error("No alumnus ID found. Please log in again.");
                    return;
                }

                console.log("Fetching alumnus details with ID:", alumnus_id);
                try {
                    const alumnusDetailsRes = await axios.get(`${baseUrl}auth/alumnusdetails?id=${alumnus_id}`);
                    console.log("Alumnus details response:", alumnusDetailsRes.data);
                    
                    if (alumnusDetailsRes.data && alumnusDetailsRes.data.length > 0) {
                        setAcc(alumnusDetailsRes.data[0]);
                    } else {
                        toast.error("No alumnus data found");
                    }
                } catch (alumnusError) {
                    console.error("Error fetching alumnus details:", alumnusError);
                    toast.error("Failed to load alumnus data: " + (alumnusError.response?.data?.error || alumnusError.message));
                }

                try {
                    const coursesRes = await axios.get(`${baseUrl}auth/courses`);
                    console.log("Courses response:", coursesRes.data);
                    
                    if (coursesRes.data && coursesRes.data.length > 0) {
                        setCourses(coursesRes.data);
                    } else {
                        console.error("No courses found in response:", coursesRes.data);
                        toast.warning("No courses available. Please contact an administrator.");
                    }
                } catch (coursesError) {
                    console.error("Error fetching courses:", coursesError);
                    toast.error("Failed to load courses: " + (coursesError.response?.data?.error || coursesError.message));
                }
            } catch (error) {
                console.error('Error in fetchData:', error);
                toast.error("An unexpected error occurred. Please try again later.");
            }
        };
        fetchData();
    }, []);


    const handleChange = (e) => {
        setAcc({ ...acc, [e.target.name]: e.target.value });
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const alumnus_id = localStorage.getItem("alumnus_id");
        const user_id = localStorage.getItem("user_id");
        
        if (!alumnus_id || !user_id) {
            toast.error("Missing user credentials. Please log in again.");
            return;
        }
        
        try {
            // Get password from input field
            const pswrd = document.getElementById("pswrd").value;
            
            // Create form data
            const formData = new FormData();
            
            // Only append file if one was selected
            if (file) {
                formData.append('image', file);
            }
            
            // Add all form fields
            formData.append('name', acc.name || '');
            formData.append('connected_to', acc.connected_to || '');
            formData.append('course_id', acc.course_id || '');
            formData.append('email', acc.email || '');
            formData.append('gender', acc.gender || '');
            formData.append('password', pswrd || '');
            formData.append('batch', acc.batch || '');
            formData.append('alumnus_id', alumnus_id);
            formData.append('user_id', user_id);
            
            console.log("Submitting form with data:", {
                name: acc.name,
                email: acc.email,
                gender: acc.gender,
                course_id: acc.course_id,
                batch: acc.batch,
                connected_to: acc.connected_to,
                hasPassword: pswrd ? true : false,
                hasFile: file ? true : false,
                alumnus_id,
                user_id
            });

            const response = await axios.put(`${baseUrl}auth/upaccount`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Response:", response.data);
            toast.success(response.data.message);
            
            // Don't reset the form on success - it's confusing to the user
            setFile(null);
        } catch (error) {
            console.error('Error updating account:', error);
            const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred';
            toast.error('Error updating account: ' + errorMessage);
        }
    };

    return (
        <>
            <ToastContainer position="top-center" />
            <header className="masthead">
                <div className="container-fluid h-100">
                    <div className="row h-100 align-items-center justify-content-center text-center">
                        <div className="col-lg-8 align-self-end mb-4 page-title">
                            <h3 className="text-white">Manage Account</h3>
                            <FaStar className='text-white ' />
                            <hr className="divider my-4" />
                        </div>
                    </div>
                </div>
            </header>
            <section className="page-section  bg-dark  text-white mb-0" id="about">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <form onSubmit={handleSubmit} className="form-horizontal">
                                <div className="form-group row">
                                    <label htmlFor="" className="col-sm-2 col-form-label">Name</label>
                                    <div className="col-sm-10">
                                        <input onChange={handleChange} type="text" className="form-control" name="name" placeholder="Enter your name" required value={acc.name} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="" className="col-sm-2 col-form-label">Gender</label>
                                    <div className="col-sm-4">
                                        <select onChange={handleChange} className="form-control" name="gender" required value={acc.gender}>
                                            <option disabled value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <label htmlFor="" className="col-sm-2 col-form-label">Batch</label>
                                    <div className="col-sm-4">
                                        <input onChange={handleChange} type="text" className="form-control" name="batch" id="batch" required value={acc.batch} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="" className="col-sm-2 col-form-label">Course Graduated</label>
                                    <div className="col-sm-10">
                                        <select onChange={handleChange} className="form-control select2" name="course_id" required value={acc.course_id}>
                                            <option disabled value="">Select course</option>
                                            {courses.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="" className="col-sm-2 col-form-label">Currently Connected To</label>
                                    <div className="col-sm-10">
                                        <textarea onChange={handleChange} name="connected_to" className="form-control" rows="3" placeholder="Enter your current connection" value={acc.connected_to}></textarea>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="avatar" className="col-sm-2 col-form-label">Image</label>
                                    <div className="col-sm-10">
                                        <input onChange={handleFileChange} type="file" className="form-control-file" name="avatar" />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="" className="col-sm-2 col-form-label">Email</label>
                                    <div className="col-sm-10">
                                        <input onChange={handleChange} type="email" className="form-control" name="email" placeholder="Enter your email" required value={acc.email} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="" className="col-sm-2 col-form-label">Password</label>
                                    <div className="col-sm-10">
                                        <input onChange={handleChange} id='pswrd' type="password" className="form-control" name="password" placeholder="Enter your password" />
                                        <small className="form-text text-info fst-italic">Leave this blank if you dont want to change your password</small>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col-sm-12 text-center">
                                        <button type='submit' className="btn btn-secondary">Update Account</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default MyAccount;
