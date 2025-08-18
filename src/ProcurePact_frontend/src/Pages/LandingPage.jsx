import React from 'react'
import HeroPage from '../Components/HeroPage'
import LandingProblem from '../Components/LandingProblem'
import LandingSolution from '../Components/LandingSolution'
import LandingFeatures from '../Components/LandingFeatures'
import SocialProof from '../Components/SocialProof'
import FinalCTA from '../Components/FinalCTA'
import Footer from '../Components/LandingFooter'
import '../styles/LandingPageStyles.css'
import LandingPageNavbar from '../Components/LandingPageNavbar'

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