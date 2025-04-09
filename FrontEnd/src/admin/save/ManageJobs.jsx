import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { baseUrl } from '../../utils/globalurl';
// import { useAuth } from '../../AuthContext';

const ManageJobs = ({ setHandleAdd }) => {
  // const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const uid = localStorage.getItem("user_id");

  const [formData, setFormData] = useState({
    id: '',
    company: '',
    job_title: '',
    location: '',
    description: '',
    user_id: uid,
  });
  const [loading, setLoading] = useState(false);
  const toastId = useRef(null);

  useEffect(() => {
    if (location.state && location.state.status === 'edit' && location.state.data) {
      // Format data correctly from our API response
      const data = location.state.data;
      setFormData({
        id: data._id || '',
        company: data.company || '',
        job_title: data.title || '', // API returns 'title', form uses 'job_title'
        location: data.location || '',
        description: data.description || '',
        user_id: uid,
      });
      console.log("Edit mode - loading data:", data);
    }
  }, [location.state, uid]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
    if (location.pathname.startsWith("/dashboard")) {
      navigate("/dashboard/jobs");
    } else {
      console.log("back btn")
      if (setHandleAdd) setHandleAdd(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.company || !formData.job_title || !formData.description) {
      toast.error("Please fill all required fields: Company, Job Title, and Description");
      return;
    }

    setLoading(true);
    if (!toastId.current) {
      toastId.current = toast('Processing your request...', {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }

    try {
      let response;
      
      if (formData.id) {
        // Update existing job
        console.log("Updating job:", formData);
        response = await axios.put(`${baseUrl}auth/managejob`, formData);
      } else {
        // Create new job
        console.log("Creating new job:", formData);
        response = await axios.post(`${baseUrl}auth/managejob`, formData);
      }
      
      console.log("API response:", response.data);
      
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success(response.data.message);
        // Reset form after successful submission
        setFormData({
          id: "",
          company: "",
          job_title: "",
          location: "",
          description: "",
          user_id: uid,
        });
        
        // Redirect after short delay to allow toast to be seen
        setTimeout(() => {
          handleBack();
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
    }
  };

  const handleChangeDesc = (description) => {
    setFormData(prevState => ({
      ...prevState,
      description
    }));
  };

  return (
    <>
      <ToastContainer position="top-center" />
      {/* {loading && <ToastContainer
position="top-center"
autoClose={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss={false}
draggable
/> }  */}
      <div className="container-fluid">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={formData.id} className="form-control" />
          <div className="row form-group mb-3">
            <div className="col-md-8">
              <label className="control-label">Company<span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="company" 
                className="form-control" 
                value={formData.company} 
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          <div className="row form-group mb-3">
            <div className="col-md-8">
              <label className="control-label">Job Title<span className="text-danger">*</span></label>
              <input 
                type="text" 
                name="job_title" 
                className="form-control" 
                value={formData.job_title} 
                onChange={handleChange} 
                required
              />
            </div>
          </div>
          <div className="row form-group mb-3">
            <div className="col-md-8">
              <label className="control-label">Location</label>
              <input 
                type="text" 
                name="location" 
                className="form-control" 
                value={formData.location} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="row form-group mb-3">
            <div className="col-md-8">
              <label className="control-label">Description<span className="text-danger">*</span></label>
              <ReactQuill
                value={formData.description}
                onChange={handleChangeDesc}
                required
              />
            </div>
          </div>
          <div className='col-md-8 mt-3'>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="ms-2">Processing...</span>
                </>
              ) : formData.id ? 'Update' : 'Submit'}
            </button>
            <button type="button" className="btn btn-outline-danger float-end" onClick={handleBack}>Back</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ManageJobs;
