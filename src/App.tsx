//import { useState } from 'react'
import Stats from './User_Stats/Stats'
import Questionaire from './User_Info/Questionaire'
import User_Info from './User_Info/User_Info'
import './App.css'

function App() {

  return (
    <>
      <div className='User_Info'>
        <Questionaire />
        <User_Info />
      </div>
      <div className='User_Stats'>
        <Stats />
      </div>
    </>
  )
}

export default App
