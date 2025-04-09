import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaPlus } from "react-icons/fa";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import defaultavatar from "../assets/uploads/defaultavatar.jpg"
import { baseUrl } from '../utils/globalurl';

const AdminAlumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchAlumni = () => {
    setIsLoading(true);
    // Correct endpoint - should be alumni_list not alumni
    axios.get(`${baseUrl}auth/alumni_list`)
      .then((res) => {
        console.log("Alumni data:", res.data);
        if (Array.isArray(res.data)) {
          setAlumni(res.data);
        } else if (res.data.message) {
          // If server returns a message instead of data
          toast.info(res.data.message);
          setAlumni([]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching alumni:", err);
        toast.error("Failed to load alumni data");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const handleDeleteAlumni = (id) => {
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this alumnus? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(id);
    axios.delete(`${baseUrl}auth/alumnus/${id}`)
      .then((res) => {
        toast.success(res.data.message);
        // Refresh the list instead of filtering client-side
        fetchAlumni();
      })
      .catch((err) => {
        console.error("Error deleting alumnus:", err);
        toast.error(err.response?.data?.error || "Failed to delete alumnus");
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
            <div className="col-md-12">
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-sm-8">
              <div className="card">
                <div className="card-header">
                  <b>List of Alumni {!isLoading && `(${alumni.length})`}</b>
                  <span className="float-right">
                    <Link to="/dashboard/alumni/manage" className="btn btn-primary btn-block btn-sm float-right">
                      <FaPlus /> New Alumni
                    </Link>
                  </span>
                </div>
                <div className="card-body">
                  {isLoading ? (
                    <div className="text-center my-3">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading alumni data...</p>
                    </div>
                  ) : alumni.length === 0 ? (
                    <div className="alert alert-info">No Alumni Available</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-responsive-sm table-condensed table-bordered table-hover">
                        <thead>
                          <tr>
                            <th className="text-center">#</th>
                            <th className="">Avatar</th>
                            <th className="">Name</th>
                            <th className="">Course Graduated</th>
                            <th className="">Status</th>
                            <th className="text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alumni.map((a, index) => (
                            <tr key={a._id || index}>
                              <td className="text-center">{index + 1}</td>
                              <td className="text-center">
                                <div className="avatar">
                                  {a.avatar ? (
                                    <img src={`${baseUrl}${a.avatar}`} className="gimg" alt="avatar" />
                                  ) : (
                                    <img src={defaultavatar} className="gimg" alt="avatar" />
                                  )}
                                </div>
                              </td>
                              <td className="">
                                <p><b>{a.name}</b></p>
                              </td>
                              <td className="">
                                <p><b>{a.course || "Not specified"}</b></p>
                              </td>
                              <td className="text-center">
                                {a.status === 1 && <span className="badge bg-success">Verified</span>}
                                {a.status === 0 && <span className="badge bg-secondary">Not Verified</span>}
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center">
                                  <button
                                    onClick={() => navigate("/dashboard/alumni/view", { state: { status: "view", data: a } })}
                                    className="btn btn-sm btn-outline-primary view_alumni"
                                    type="button"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAlumni(a._id)}
                                    className="btn btn-sm btn-outline-danger delete_alumni ms-1"
                                    type="button"
                                    disabled={isDeleting === a._id}
                                  >
                                    {isDeleting === a._id ? (
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

export default AdminAlumni;