import axios from 'axios';
import React, { useEffect, useState } from 'react';
import logo from "../assets/uploads/logo.png"
import { baseUrl } from '../utils/globalurl';
import { FaGraduationCap, FaUsers, FaHandshake, FaCalendarAlt, FaBriefcase, FaComments } from 'react-icons/fa';

const About = () => {
  const [system, setSystem] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${baseUrl}auth/settings`)
      .then((res) => {
        setSystem(res.data);
        setLoading(false);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <header className="masthead">
        <div className="container">
          <div className="row mt-5 h-100 align-items-center justify-content-center text-center">
            <div className="col-lg-10 align-self-end mb-4" style={{ background: "#0000002e", borderRadius: "10px", padding: "20px" }}>
              <h2 className="text-uppercase text-white font-weight-bold">About Us</h2>
              <hr className="divider my-4" />
              <p className="text-white-75 text-light mb-5">Charusat University Alumni Network</p>
            </div>
          </div>
        </div>
      </header>

      <section className="page-section bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="text-dark mt-0">Our Mission</h2>
              <hr className="divider my-4" />
              <p className="text-muted mb-5">
                The Charusat University Alumni Management System is designed to foster lasting connections between graduates and their alma mater. 
                Our mission is to create a vibrant community where alumni can network, share experiences, and contribute to the university's continued success.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <h2 className="text-center text-dark mb-5">What We Offer</h2>
          <div className="row">
            <div className="col-lg-4 col-md-6 text-center mb-4">
              <div className="mt-5">
                <div className="mb-4">
                  <FaGraduationCap className="text-primary" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h4 mb-2">Alumni Directory</h3>
                <p className="text-muted mb-0">
                  Connect with fellow graduates through our comprehensive alumni directory. 
                  Find classmates, mentors, and potential collaborators.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 text-center mb-4">
              <div className="mt-5">
                <div className="mb-4">
                  <FaBriefcase className="text-primary" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h4 mb-2">Career Opportunities</h3>
                <p className="text-muted mb-0">
                  Access job postings from alumni and partners. Share your own opportunities 
                  and help fellow graduates advance their careers.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 text-center mb-4">
              <div className="mt-5">
                <div className="mb-4">
                  <FaCalendarAlt className="text-primary" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h4 mb-2">Events & Reunions</h3>
                <p className="text-muted mb-0">
                  Stay informed about upcoming alumni events, reunions, and networking opportunities. 
                  Participate in workshops and professional development sessions.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 text-center mb-4">
              <div className="mt-5">
                <div className="mb-4">
                  <FaComments className="text-primary" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h4 mb-2">Discussion Forums</h3>
                <p className="text-muted mb-0">
                  Engage in meaningful discussions with fellow alumni on various topics. 
                  Share insights, ask questions, and contribute to the community.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 text-center mb-4">
              <div className="mt-5">
                <div className="mb-4">
                  <FaHandshake className="text-primary" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h4 mb-2">Mentorship Program</h3>
                <p className="text-muted mb-0">
                  Connect with experienced alumni who can provide guidance and mentorship. 
                  Or offer your expertise to help current students and recent graduates.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 text-center mb-4">
              <div className="mt-5">
                <div className="mb-4">
                  <FaUsers className="text-primary" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h4 mb-2">Alumni Benefits</h3>
                <p className="text-muted mb-0">
                  Enjoy exclusive benefits including library access, campus facilities, 
                  and discounts on continuing education programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="text-dark mt-0">Our Impact</h2>
              <hr className="divider my-4" />
              <p className="text-muted mb-5">
                Since its inception, the Charusat University Alumni Network has connected thousands of graduates worldwide. 
                Our alumni have gone on to make significant contributions in various fields, from technology and healthcare to business and education. 
                Through this platform, we continue to strengthen the bond between our university and its graduates, creating a legacy of excellence and collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {system.length > 0 && (
        <section className="page-section">
          <div className="container">
            <h2 className='text-center'>{system[0].name}</h2>
            <br />
            <p dangerouslySetInnerHTML={{ __html: system[0].about_content }}></p>
          </div>
        </section>
      )}

      <section className="page-section bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="text-dark mt-0">Get Involved</h2>
              <hr className="divider my-4" />
              <p className="text-muted mb-5">
                We invite all Charusat University alumni to join our network and become active members of our community. 
                Whether you're a recent graduate or have been out of school for years, there's a place for you here. 
                Update your profile, connect with old friends, and discover new opportunities to engage with your alma mater.
              </p>
              <a className="btn btn-primary btn-xl" href="/register">Join Our Network</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About;
