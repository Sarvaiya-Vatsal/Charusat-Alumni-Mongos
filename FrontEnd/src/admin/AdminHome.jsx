import React, { useState, useEffect } from 'react';
import { FaUsers, FaBriefcase } from "react-icons/fa";
import { IoCalendar } from "react-icons/io5";
import { RiSuitcaseFill } from "react-icons/ri";
import { MdForum } from "react-icons/md";
import axios from "axios";
import { baseUrl } from '../utils/globalurl';
import { ToastContainer, toast } from 'react-toastify';

const InfoCard = ({ title, count, Icon, className, isLoading }) => (
  <div className="col-xxl-4 col-xl-6">
    <div className={`card info-card ${className}`}>
      <div className="card-body">
        <h5 className="card-title" dangerouslySetInnerHTML={{ __html: title }}></h5>
        <div className="d-flex align-items-center justify-content-center justify-content-sm-start">
          <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
            <Icon />
          </div>
          <div className="ps-3">
            {isLoading ? (
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <h6>{count}</h6>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminHome = () => {
  const [counts, setCounts] = useState({
    alumni: 0,
    forums: 0,
    jobs: 0,
    upevents: 0,
    events: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCounts = () => {
    setIsLoading(true);
    axios.get(`${baseUrl}auth/counts`)
      .then((res) => {
        console.log("Counts data:", res.data);
        setCounts(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching counts:", err);
        toast.error('Failed to fetch dashboard data');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ToastContainer position="top-center" />
      <section className="section dashboard cutommargin p-3">
        <div className="row">
          <div className="col-lg-10 m-2">
            <div className="row">
              <InfoCard 
                title={`Alumni <span>| Total</span>`} 
                count={counts.alumni} 
                Icon={FaUsers} 
                className="customers-card" 
                isLoading={isLoading} 
              />
              <InfoCard 
                title="Forum Topics <span>| Total</span>" 
                count={counts.forums} 
                Icon={MdForum} 
                className="sales-card" 
                isLoading={isLoading} 
              />
              <InfoCard 
                title="Posted Jobs <span>| Now</span>" 
                count={counts.jobs} 
                Icon={FaBriefcase} 
                className="revenue-card" 
                isLoading={isLoading} 
              />
              <InfoCard 
                title="Upcoming Events <span>| Total</span>" 
                count={counts.upevents} 
                Icon={IoCalendar} 
                className="purple-card" 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminHome;
