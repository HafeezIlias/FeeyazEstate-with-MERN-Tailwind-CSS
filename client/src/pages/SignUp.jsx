import React from 'react'
import { Link } from 'react-router-dom'
export default function SignUp() {
  return (
    <div className='p-3 max-w-lg mx-auto'>  {/*mx is for center alignment horizontal*/}
      <h1 className="text-3xl text-center font-semibold
      my-7">Sign Up</h1>
      <form className='flex flex-col gap-4'>
        <input className='border p-3 rounded-lg ' 
        type="text" placeholder='Username' id='username'/>
        <input className='border p-3 rounded-lg ' 
        type="email" placeholder='Email' id='email'/>
        <input className='border p-3 rounded-lg ' 
        type="password" placeholder='Password' id='password'/>
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer'>Sign Up</button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p> Have an account?</p>
        <Link to={"/sign-in"}></Link>
        <span className='text-blue-700'>Sign In</span>
      </div>
    </div>
  )
}
