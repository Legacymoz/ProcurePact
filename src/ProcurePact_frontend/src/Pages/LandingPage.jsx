import React from 'react'
import HeroPage from '../Components/HeroPage'
import LandingProblem from '../Components/LandingProblem'
import LandingSolution from '../Components/LandingSolution'
import LandingFeatures from '../Components/LandingFeatures'
import SocialProof from '../Components/SocialProof'
import FinalCTA from '../Components/FinalCTA'
import Footer from '../Components/LandingFooter'

const LandingPage = () => {
  return (
    <div>
        <HeroPage />
        <LandingProblem />
        <LandingSolution />
        <LandingFeatures />
        <SocialProof />
        <FinalCTA />
        <Footer/>
    </div>
  )
}

export default LandingPage