import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { baseUrl } from '../../utils/globalurl';

const ManageEvents = () => {
    const [eventData, setEventData] = useState({
        id: '',
        title: "",
        schedule: "",
        description: "",
        user_id: localStorage.getItem("user_id") || ""
    });
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        setEventData(prev => ({ 
            ...prev, 
            user_id: localStorage.getItem("user_id") || "" 
        }));

        if (location.state && location.state.status === "edit" && location.state.data) {
            const { id, title, schedule, content } = location.state.data;
            let formattedSchedule = schedule;
            if (schedule && typeof schedule === 'string') {
                formattedSchedule = schedule.replace('Z', '');
                const date = new Date(schedule);
                formattedSchedule = date.toISOString().slice(0, 16);
            }
            
            setEventData({
                id,
                title: title || "",
                schedule: formattedSchedule || "",
                description: content || "",
                user_id: localStorage.getItem("user_id") || ""
            });
            console.log("Edit mode - loading data:", { id, title, schedule, content });
        }
    }, [location.state]);

    const handleChange = (description) => {
        setEventData(prevState => ({
            ...prevState,
            description
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!eventData.title || !eventData.schedule || !eventData.description) {
            toast.error("Please fill all required fields: Title, Schedule, and Description");
            return;
        }

        if (!eventData.user_id) {
            toast.error("User ID is missing. Please log in again.");
            return;
        }
        
        setLoading(true);
        
        try {
            let response;
            console.log("Submitting event data:", eventData);
            
            if (eventData.id) {
                console.log("Updating event:", eventData);
                response = await axios.put(`${baseUrl}auth/events`, eventData);
            } else {
                console.log("Creating new event:", eventData);
                response = await axios.post(`${baseUrl}auth/events`, eventData);
            }
            
            console.log("API response:", response.data);
            
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                toast.success(response.data.message || "Event saved successfully");
                
                setEventData({
                    id: '',
                    title: "",
                    schedule: "",
                    description: "",
                    user_id: localStorage.getItem("user_id") || ""
                });
                
                setTimeout(() => {
                    navigate("/dashboard/events");
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving event:', error);
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Error saving event. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/dashboard/events");
    };

    return (
        <>
            <div className="container-fluid">
                <ToastContainer position="top-center" />
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header">
                            <h4>{eventData.id ? 'Edit Event' : 'Add New Event'}</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <input type="hidden" name="id" value={eventData.id} />
                                <input type="hidden" name="user_id" value={eventData.user_id} />
                                <div className="form-group row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="title" className="control-label">Event Title <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="title"
                                            name="title" 
                                            value={eventData.title} 
                                            required 
                                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="schedule" className="control-label">Schedule <span className="text-danger">*</span></label>
                                        <input 
                                            type='datetime-local' 
                                            className="form-control" 
                                            id="schedule"
                                            name="schedule" 
                                            value={eventData.schedule} 
                                            required 
                                            onChange={(e) => setEventData({ ...eventData, schedule: e.target.value })} 
                                        />
                                    </div>
                                </div>
                                <div className="form-group row mb-3">
                                    <div className="col-md-10">
                                        <label htmlFor="description" className="control-label">Description <span className="text-danger">*</span></label>
                                        <ReactQuill
                                            value={eventData.description}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group row mt-4">
                                    <div className="col-md-6">
                                        <button 
                                            className="btn btn-primary me-2" 
                                            type='submit' 
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    <span className="ms-2">Processing...</span>
                                                </>
                                            ) : eventData.id ? 'Update' : 'Save'}
                                        </button>
                                        <button 
                                            className="btn btn-outline-danger" 
                                            type="button" 
                                            onClick={handleBack}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManageEvents;