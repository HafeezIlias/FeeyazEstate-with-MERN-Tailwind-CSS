import React from 'react'
import { useSelector } from 'react-redux'

export default function Profile() {
  const {currentUser} = useSelector((state) => state.user);
  return (
    <div className=' bg-white p-3 max-w-lg mx-auto mt-5 rounded-xl shadow-lg'>
      <h1 className='text-3xl font-semibold text-center my-2'>Profile</h1>
      <form className= 'flex flex-col gap-4'> {/*gap control the space between the elements*/}
        <img className=" shadow-2xl w-24 h-24 rounded-full object-cover cursor-pointer self-center mt-2" src={currentUser.avatar} alt="profile" />
        <input className="shadow-xl p-3 rounded-xl"type="text" placeholder='username' id='username' />
        <input className="shadow-xl p-3 rounded-xl"type="email" placeholder='email' />
        <input className="shadow-xl p-3 rounded-xl"type="password" placeholder='password' />
        <button className='bg-slate-600 text-white p-3 rounded-xl uppercase hover:opacity-95 disabled:opacity-80'>Update</button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-600 cursor-pointer'> Delete Account</span>
        <span className='text-red-600 cursor-pointer'> Sign Out</span>
      </div>
    </div>
  )
}
