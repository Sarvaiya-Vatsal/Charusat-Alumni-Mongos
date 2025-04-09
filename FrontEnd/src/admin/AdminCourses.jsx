import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { baseUrl } from '../utils/globalurl';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({
    name: '',
    id: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCourses = () => {
    setIsLoading(true);
    axios.get(`${baseUrl}auth/courses`)
      .then((res) => {
        console.log("Courses data:", res.data);
        setCourses(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        toast.error("Failed to load courses");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}auth/courses/${id}`);
      toast.warning(response.data.message);
      // Refresh the courses list after deletion
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error("Failed to delete course");
    }
  };

  const handleInput = (courseName, courseId) => {
    setCourseForm({
      name: courseName,
      id: courseId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (courseForm.id) {
        // If id exists, it's an update operation
        await axios.put(`${baseUrl}auth/courses`, {
          id: courseForm.id,
          course: courseForm.name // Backend expects 'course' field
        });
        toast.success("Course updated successfully");
      } else {
        // It's a new course
        await axios.post(`${baseUrl}auth/courses`, { 
          course: courseForm.name // Backend expects 'course' field
        });
        toast.success("Course saved successfully");
      }
      
      // Reset the form and refresh the courses list
      setCourseForm({ name: '', id: '' });
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <ToastContainer position="top-center" />
      <div className="col-lg-12">
        <div className="row">
          <div className="col-md-4">
            <form onSubmit={handleSubmit}>
              <div className="card">
                <div className="card-header">
                  Course Form
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="control-label">Course Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="card-footer">
                  <div className="row">
                    <div className="col-md-6">
                      <button
                        type="submit"
                        className="btn btn-sm btn-primary btn-block"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : (courseForm.id ? 'Update' : 'Save')}
                      </button>
                    </div>
                    {courseForm.id && (
                      <div className="col-md-6">
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary btn-block"
                          onClick={() => setCourseForm({ name: '', id: '' })}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <b>Course List</b>
              </div>
              <div className="card-body">
                {isLoading ? (
                  <div className="text-center my-3">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="alert alert-info">No courses found</div>
                ) : (
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th className="text-center">#</th>
                        <th className="text-center">Course</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, index) => (
                        <tr key={course._id || index}>
                          <td className="text-center">{index + 1}</td>
                          <td>{course.name}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-primary me-2"
                              type="button"
                              onClick={() => handleInput(course.name, course._id)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              type="button"
                              onClick={() => handleDelete(course._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
