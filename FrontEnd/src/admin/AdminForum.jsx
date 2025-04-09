import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus } from "react-icons/fa";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const AdminForum = () => {
  const [forum, setForum] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchForums = () => {
    setIsLoading(true);
    // Use the correct endpoint for forum listing
    axios.get(`${baseUrl}auth/forums`)
      .then((res) => {
        console.log("Forum data:", res.data);
        if (Array.isArray(res.data)) {
          setForum(res.data);
        } else if (res.data.message) {
          toast.info(res.data.message);
          setForum([]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching forum data:", err);
        toast.error("Failed to load forum data");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchForums();
  }, []);

  // Function to truncate description for display
  const CutDesc = (text, length = 100) => {
    if (text?.length > length) {
      return text.substring(0, length) + '...';
    }
    return text;
  };

  const delForum = (id) => {
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this forum? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(id);
    // Use the correct endpoint for deleting a forum
    axios.delete(`${baseUrl}auth/forum/${id}`)
      .then((res) => {
        toast.success(res.data.message || "Forum deleted successfully");
        // Refresh the list instead of filtering client-side
        fetchForums();
      })
      .catch((err) => {
        console.error("Error deleting forum:", err);
        toast.error(err.response?.data?.error || "Failed to delete forum");
      })
      .finally(() => {
        setIsDeleting(null);
      });
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="container-fluid">
        <div className="col-lg-12">
          <div className="row mb-4 mt-4">
            <div className="col-md-12"></div>
          </div>
          <div className="row">
            <div className="col-md-12 col-sm-8">
              <div className="card">
                <div className="card-header">
                  <b>List of Forum Topics {!isLoading && `(${forum.length})`}</b>
                  <span className="float-right">
                    <Link to="/dashboard/forum/manage" className="btn btn-primary btn-block btn-sm float-right">
                      <FaPlus /> New Entry
                    </Link>
                  </span>
                </div>
                <div className="card-body">
                  {isLoading ? (
                    <div className="text-center my-3">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading forum data...</p>
                    </div>
                  ) : forum.length === 0 ? (
                    <div className="alert alert-info">No Forum Topics Available</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-responsive-sm table-condensed table-bordered table-hover">
                        <thead>
                          <tr>
                            <th className="text-center">#</th>
                            <th>Topic</th>
                            <th>Description</th>
                            <th>Created By</th>
                            <th>Comments</th>
                            <th className="text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {forum.map((f, index) => (
                            <tr key={f.id || f._id || index}>
                              <td className="text-center">{index + 1}</td>
                              <td><b>{f.title}</b></td>
                              <td>{CutDesc(f.description)}</td>
                              <td>{f.created_by || f.createdBy?.name || "Unknown"}</td>
                              <td className="text-center">
                                {f.comments_count || f.comments?.length || 0}
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center">
                                  <button
                                    onClick={() => navigate("/dashboard/forum/view", { state: { data: f } })}
                                    className="btn btn-sm btn-outline-primary"
                                    type="button"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => navigate("/dashboard/forum/manage", { state: { status: "edit", data: f } })}
                                    className="btn btn-sm btn-outline-success ms-1"
                                    type="button"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => delForum(f.id || f._id)}
                                    className="btn btn-sm btn-outline-danger ms-1"
                                    type="button"
                                    disabled={isDeleting === (f.id || f._id)}
                                  >
                                    {isDeleting === (f.id || f._id) ? (
                                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                      "Delete"
                                    )}
                                  </button>
                                </div>
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
      </div>
    </>
  );
};

export default AdminForum;