import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { baseUrl } from '../../utils/globalurl';

const ManageForum = ({ setHandleAdd }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    if (location.state && location.state.status === 'edit' && location.state.data) {
      // Handle both API data structures (id or _id)
      const { id, _id, title, description } = location.state.data;
      setFormData({
        id: id || _id || '',
        title: title || '',
        description: description || '',
      });
      console.log("Edit mode - loading data:", location.state.data);
    }
  }, [location.state]);

  const handleBack = () => {
    if (location.pathname.startsWith("/dashboard")) {
      navigate("/dashboard/forum");
    } else {
      console.log("back btn")
      setHandleAdd(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Forum title is required");
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error("Forum description is required");
      return;
    }
    
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }
    
    setLoading(true);
    
    try {
      if (formData.id) {
        // Perform update operation
        console.log("Updating forum:", formData);
        const response = await axios.put(`${baseUrl}auth/manageforum`, {
          id: formData.id,
          title: formData.title,
          description: formData.description
        });
        
        console.log("Update response:", response.data);
        toast.success(response.data.message || "Forum updated successfully");
        
        setTimeout(() => {
          if (location.pathname.startsWith("/dashboard")) {
            navigate("/dashboard/forum");
          } else {
            setHandleAdd(false);
          }
        }, 2000);
      } else {
        // Perform insert operation
        console.log("Creating new forum:", {
          title: formData.title,
          description: formData.description,
          userId
        });
        
        const response = await axios.post(`${baseUrl}auth/manageforum`, {
          title: formData.title,
          description: formData.description,
          userId: userId.toString()
        });
        
        console.log("Create response:", response.data);
        toast.success(response.data.message || "New forum added successfully");
        
        setFormData({
          id: '',
          title: '',
          description: '',
        });
        
        setTimeout(() => {
          if (location.pathname.startsWith("/dashboard")) {
            navigate("/dashboard/forum");
          } else {
            setHandleAdd(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving forum:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('An error occurred while saving the forum');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (description) => {
    setFormData(prevState => ({
      ...prevState,
      description
    }));
  };

  return (
    <div className="container-fluid">
      <ToastContainer position="top-center" />
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={formData.id} className="form-control" />
        <div className="row form-group">
          <div className="col-md-8">
            <label className="control-label">Title <span className="text-danger">*</span></label>
            <input 
              type="text" 
              name="title" 
              className="form-control" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              required
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-12">
            <label className="control-label">Description <span className="text-danger">*</span></label>
            <ReactQuill
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <button 
            type='submit' 
            className="btn btn-primary me-2"
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
            className="btn btn-danger" 
            type="button" 
            onClick={handleBack}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ManageForum