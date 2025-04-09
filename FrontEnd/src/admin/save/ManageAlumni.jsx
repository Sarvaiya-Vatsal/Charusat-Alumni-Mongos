import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../../utils/globalurl';

const ManageAlumni = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    gender: '',
    batch: '',
    course_id: '',
    connected_to: '',
    status: 1
  });

  // Fetch courses for the dropdown
  useEffect(() => {
    axios.get(`${baseUrl}auth/courses`)
      .then(res => {
        console.log("Courses:", res.data);
        setCourses(res.data);
      })
      .catch(err => {
        console.error("Error fetching courses:", err);
        toast.error("Failed to load courses");
      });

    // Load alumni data if in edit mode
    if (location.state && location.state.status === 'edit' && location.state.data) {
      const data = location.state.data;
      setFormData({
        id: data._id || data.id || '',
        name: data.name || '',
        email: data.email || '',
        gender: data.gender || '',
        batch: data.batch || '',
        course_id: data.course_id || '',
        connected_to: data.connected_to || '',
        status: data.status !== undefined ? data.status : 1
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBack = () => {
    navigate('/dashboard/alumnilist');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (formData.id) {
        // Update existing alumni
        response = await axios.put(`${baseUrl}auth/updatealumnus/${formData.id}`, formData);
      } else {
        // Create new alumni
        response = await axios.post(`${baseUrl}auth/createalumnus`, formData);
      }

      console.log("API response:", response.data);
      
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate('/dashboard/alumnilist');
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
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="container-fluid">
        <div className="card">
          <div className="card-header">
            <h4>{formData.id ? 'Edit Alumni' : 'Add New Alumni'}</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="id" value={formData.id} />
              
              <div className="row form-group mb-3">
                <div className="col-md-6">
                  <label className="control-label">Name<span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    className="form-control" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row form-group mb-3">
                <div className="col-md-6">
                  <label className="control-label">Email<span className="text-danger">*</span></label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    value={formData.email} 
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row form-group mb-3">
                <div className="col-md-6">
                  <label className="control-label">Gender</label>
                  <select 
                    name="gender" 
                    className="form-select" 
                    value={formData.gender} 
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="row form-group mb-3">
                <div className="col-md-6">
                  <label className="control-label">Batch/Year Graduated</label>
                  <input 
                    type="text" 
                    name="batch" 
                    className="form-control" 
                    value={formData.batch} 
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="row form-group mb-3">
                <div className="col-md-6">
                  <label className="control-label">Course</label>
                  <select 
                    name="course_id" 
                    className="form-select" 
                    value={formData.course_id} 
                    onChange={handleChange}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row form-group mb-3">
                <div className="col-md-6">
                  <label className="control-label">Currently Connected To</label>
                  <input 
                    type="text" 
                    name="connected_to" 
                    className="form-control" 
                    value={formData.connected_to} 
                    onChange={handleChange}
                    placeholder="Company/Organization/Institution"
                  />
                </div>
              </div>
              
              {formData.id && (
                <div className="row form-group mb-3">
                  <div className="col-md-6">
                    <label className="control-label">Status</label>
                    <select 
                      name="status" 
                      className="form-select" 
                      value={formData.status} 
                      onChange={handleChange}
                    >
                      <option value={1}>Verified</option>
                      <option value={0}>Not Verified</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="row form-group mt-4">
                <div className="col-md-6">
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
                    ) : formData.id ? 'Update' : 'Save'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-danger float-end" 
                    onClick={handleBack}
                  >
                    Back
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageAlumni; 