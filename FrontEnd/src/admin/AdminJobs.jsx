import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';
import { Modal } from 'react-bootstrap';
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import ViewJobs from './view/ViewJobs';

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const navigate = useNavigate();

    const fetchJobs = () => {
        setIsLoading(true);
        axios.get(`${baseUrl}auth/job_list`)
            .then((res) => {
                console.log("Jobs data:", res.data);
                if (Array.isArray(res.data)) {
                    setJobs(res.data);
                } else if (res.data.message) {
                    toast.info(res.data.message);
                    setJobs([]);
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching jobs:", err);
                toast.error("Failed to load jobs data");
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const openModal = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedJob(null);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
            return;
        }
        
        setIsDeleting(id);
        axios.delete(`${baseUrl}auth/job/${id}`)
            .then((res) => {
                toast.success(res.data.message || "Job deleted successfully");
                fetchJobs();
            })
            .catch((err) => {
                console.error("Error deleting job:", err);
                toast.error(err.response?.data?.error || "Failed to delete job");
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
                                    <b>List of Jobs {!isLoading && `(${jobs.length})`}</b>
                                    <span className="float-right">
                                        <Link to="/dashboard/jobs/manage" className="btn btn-primary btn-block btn-sm float-right">
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
                                            <p className="mt-2">Loading jobs data...</p>
                                        </div>
                                    ) : jobs.length === 0 ? (
                                        <div className="alert alert-info">No Jobs Available</div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-responsive-sm table-condensed table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center">#</th>
                                                        <th>Company</th>
                                                        <th>Job Title</th>
                                                        <th>Posted By</th>
                                                        <th className="text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {jobs.map((job, index) => (
                                                        <tr key={job._id || index}>
                                                            <td className="text-center">{index + 1}</td>
                                                            <td>{job.company || "Not specified"}</td>
                                                            <td>{job.title}</td>
                                                            <td>{job.postedBy?.name || "Unknown"}</td>
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center">
                                                                    <button
                                                                        onClick={() => openModal(job)}
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        type="button"
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigate("/dashboard/jobs/manage", { state: { status: "edit", data: job } })}
                                                                        className="btn btn-sm btn-outline-success ms-1"
                                                                        type="button"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(job._id)}
                                                                        className="btn btn-sm btn-outline-danger ms-1"
                                                                        type="button"
                                                                        disabled={isDeleting === job._id}
                                                                    >
                                                                        {isDeleting === job._id ? (
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

            <Modal show={showModal} onHide={closeModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedJob?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedJob && (
                        <div>
                            <p><strong>Company:</strong> {selectedJob.company}</p>
                            <p><strong>Location:</strong> {selectedJob.location}</p>
                            <p><strong>Posted By:</strong> {selectedJob.postedBy?.name}</p>
                            <p><strong>Date Posted:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                            <hr />
                            <h5>Job Description</h5>
                            <div className="job-description" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedJob.description}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={closeModal}>
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AdminJobs;
