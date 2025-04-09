import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = () => {
    setIsLoading(true);
    axios.get(`${baseUrl}auth/events`)
      .then((res) => {
        console.log("Events data:", res.data);
        if (Array.isArray(res.data)) {
          setEvents(res.data);
        } else if (res.data.message) {
          toast.info(res.data.message);
          setEvents([]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        toast.error("Failed to load events data");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = (id) => {
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(id);
    axios.delete(`${baseUrl}auth/events/${id}`)
      .then((res) => {
        toast.success(res.data.message || "Event deleted successfully");
        // Refresh the list instead of filtering client-side
        fetchEvents();
      })
      .catch((err) => {
        console.error("Error deleting event:", err);
        toast.error(err.response?.data?.error || "Failed to delete event");
      })
      .finally(() => {
        setIsDeleting(null);
      });
  };

  // Function to format the timestamp
  const formatDate = (timestamp) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(timestamp).toLocaleDateString('en-US', options);
  };

  // Function to truncate the content and remove HTML tags
  const cutContent = (content, maxLength) => {
    if (!content) return '';
    
    const strippedContent = content.replace(/<[^>]+>/g, ''); // Remove HTML tags
    if (strippedContent.length > maxLength) {
      return strippedContent.substring(0, maxLength) + '...';
    }
    return strippedContent;
  };

  const handleView = (event) => {
    navigate("/events/view", { state: { action: "view", data: event } });
  };

  return (
    <div className="container-fluid">
      <ToastContainer position="top-center" />
      <div className="col-lg-12">
        <div className="row mb-4 mt-4">
          <div className="col-md-12"></div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <b>List of Events {!isLoading && `(${events.length})`}</b>
                <span className="float-right">
                  <Link to="/dashboard/events/manage" className="btn btn-primary btn-block btn-sm float-right">
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
                    <p className="mt-2">Loading events data...</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="alert alert-info">No Events Available</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-responsive-sm table-condensed table-bordered table-hover">
                      <thead>
                        <tr>
                          <th className="text-center">#</th>
                          <th>Schedule</th>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Participants</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((event, index) => (
                          <tr key={event._id || index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{formatDate(event.schedule)}</td>
                            <td>{event.title}</td>
                            <td>{cutContent(event.content, 50)}</td>
                            <td className="text-center">{event.commits_count || 0}</td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center">
                                <button
                                  onClick={() => handleView(event)}
                                  className="btn btn-sm btn-outline-primary"
                                  type="button"
                                >
                                  View
                                </button>
                                <Link
                                  to="/dashboard/events/manage"
                                  state={{ status: "edit", data: event }}
                                  className="btn btn-sm btn-outline-success ms-1"
                                  type="button"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDeleteEvent(event._id || event.id)}
                                  className="btn btn-sm btn-outline-danger ms-1"
                                  type="button"
                                  disabled={isDeleting === (event._id || event.id)}
                                >
                                  {isDeleting === (event._id || event.id) ? (
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
  );
};

export default AdminEvents;
