import React,{ useState } from 'react'
import { Link ,useNavigate} from 'react-router-dom'
import { useDispatch,useSelector } from 'react-redux';
import { signinStart,signinFailure,signinSuccess } from '../redux/user/userSlice.js';
import OAuth from '../components/OAuth.jsx';

export default function SignIn() {
  const {loading,error} = useSelector((state) => state.user); //get loading and error from user slice
  const [formData,setFromData]= useState({}) //track the data of form changes
  const navigate = useNavigate(); // initialize useNavigate
    const dispatch = useDispatch();

  const handleChange = (e) => {
    setFromData({
      ...formData,
      [e.target.id] : e.target.value //whatever is changing set it to the form data value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // in react we want to prevent it to refresh the page
    try {
      dispatch(signinStart());
      const res = await fetch("backend/auth/signin", 
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if(data.success === false){
      dispatch(signinFailure(data.message));
      return;
    }
    //if signup is successful
    dispatch(signinSuccess(data));
    navigate("/"); // Navigate to the sign-in page after successful sign-up
    console.log(data);
    } catch (error) {
      dispatch(signinFailure(error.message));
    }
    
  };

  console.log(formData);
  return (
    <div className='p-3 max-w-lg mx-auto'>  {/*mx is for center alignment horizontal*/}
      <h1 className="text-3xl text-center font-semibold
      my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input className='border p-3 rounded-lg ' 
        type="email" placeholder='Email' id='email' onChange={handleChange}/>
        <input className='border p-3 rounded-lg ' 
        type="password" placeholder='Password' id='password' onChange={handleChange}/>
        <button  disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer'>{loading ? "Loading..." : "Sign In"}</button>
      <OAuth></OAuth>
      </form>
      <div className='flex gap-2 mt-5'>
        <p> Dont have an account?</p>
        <Link to={"/sign-up"}></Link>
        <span className='text-blue-700'>Sign Up</span>
      </div>
      {error && <p className='text-red-600 mt-5'>{error}</p>} {/*if there is an error show it*/}
    </div>
  )
}
