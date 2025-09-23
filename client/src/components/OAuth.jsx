import React from 'react'
import { GoogleAuthProvider ,getAuth, signInWithPopup} from "firebase/auth";
import { app } from '../firebase.js';
import { useDispatch } from 'react-redux';
import { signinSuccess } from '../redux/user/userSlice.js';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogleCllck = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth,provider);

            const res = await fetch("backend/auth/google-signin", 
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: result.user.email,
                username: result.user.displayName,
                photo: result.user.photoURL

              }),
            });
            const data = await res.json();
            dispatch(signinSuccess(data));
            navigate("/home"); //use UseNavigate when inside the function use Navigate inside component
        } catch (error) {
          console.log("Google sign-in failed", error);
        }
      };


  return (
    <button onClick={handleGoogleCllck}type='button' className='bg-blue-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer w-full'>
      Continue with Google
    </button>
  )
}
