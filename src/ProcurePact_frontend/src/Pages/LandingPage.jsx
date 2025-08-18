import React from 'react'
import HeroPage from '../Components/HeroPage'
import LandingProblem from '../Components/Landing/LandingProblem'
import LandingSolution from '../Components/Landing/LandingSolution'
import LandingFeatures from '../Components/Landing/LandingFeatures'
import SocialProof from '../Components/SocialProof'
import FinalCTA from '../Components/FinalCTA'
import Footer from '../Components/Landing/LandingFooter'
import '../styles/LandingPageStyles.css'
import LandingPageNavbar from '../Components/Landing/LandingPageNavbar'

const LandingPage = () => {
  return (
    <div className='landingPage-container'>
      <div className="myNavbar">
        <LandingPageNavbar />
      </div>
      <div className="content">
        <HeroPage />
        <LandingProblem />
        <LandingSolution />
        <LandingFeatures />
        <SocialProof />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}

export default LandingPage