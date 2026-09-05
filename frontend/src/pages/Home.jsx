import React from 'react'
import Newsletter from '../components/Newsletter'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import HowItWorks from '../components/HowItWorks'
import CTA from '../components/CTA'

const Home = () => {
  return (
    <div>
        <title>Home</title>
      <Hero></Hero>
      <Categories></Categories>
      <HowItWorks></HowItWorks>
      <CTA></CTA>
      <Newsletter></Newsletter>
    </div>
  )
}

export default Home
