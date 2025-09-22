import { set } from 'mongoose';
import React,{ useState } from 'react'
import { Link ,useNavigate} from 'react-router-dom'


export default function SignUp() {
  const [error,setError] = useState(null);
  const [loading,setLoading] = useState(false);
  const [formData,setFromData]= useState({}) //track the data of form changes
  const navigate = useNavigate(); // initialize useNavigate

  const handleChange = (e) => {
    setFromData({
      ...formData,
      [e.target.id] : e.target.value //whatever is changing set it to the form data value
    });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault(); // in react we want to prevent it to refresh the page
    try {
      const res = await fetch("backend/auth/signup", 
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if(data.success === false){
      setError(data.message);
      setLoading(false);
      return;
    }
    //if signup is successful
    setLoading(false);
    setError(null);
    navigate("/sign-in"); // Navigate to the sign-in page after successful sign-up
    console.log(data);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
    
  };

  console.log(formData);
  return (
    <div className='p-3 max-w-lg mx-auto'>  {/*mx is for center alignment horizontal*/}
      <h1 className="text-3xl text-center font-semibold
      my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input className='border p-3 rounded-lg ' 
        type="text" placeholder='Username' id='username' onChange={handleChange}/>
        <input className='border p-3 rounded-lg ' 
        type="email" placeholder='Email' id='email' onChange={handleChange}/>
        <input className='border p-3 rounded-lg ' 
        type="password" placeholder='Password' id='password' onChange={handleChange}/>
        <button  disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer'>{loading ? "Loading..." : "Sign Up"}</button>
      </form>
      <div className='flex gap-2 mt-5'>
        <p> Have an account?</p>
        <Link to={"/sign-in"}></Link>
        <span className='text-blue-700'>Sign In</span>
      </div>
      {error && <p className='text-red-600 mt-5'>{error}</p>} {/*if there is an error show it*/}
    </div>
  )
}
