import React, { useRef, useEffect, useState } from 'react'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useSelector ,useDispatch} from 'react-redux'
import { app } from '../firebase.js';
import { updateUserSuccess, updateUserStart, updateUserFailure } from '../redux/user/userSlice.js';
import { set } from 'mongoose';
export default function Profile() {
  const dispatch = useDispatch();
  const fileRef=useRef(null);
  const {currentUser,loading,error} = useSelector((state) => state.user);
  const [file,setFile] = useState(undefined); // file is like a const that holds the state, to update the state we need to use the setFile
  const [filePercent, setFilePercent] = useState(0); //initialize file upload progress to 0
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({}); // to hold the form data
  const [updateSuccess, setUpdateSuccess] = useState(false);
  //firebase storage
  //allow read
  //allow write: if request.resource.data.size < 2*1024*1024 && request.resource.data.contentType.matches('image/.*');

  useEffect(() => {
    if(file) {
      handleFileUpload(file);
    }
  },[file]);
  const handleFileUpload = async(file) => {
    //upload file to firebase storage
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name; //to make the file name unique
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', //on is an event listener that have three callback functions
    (snapshot) => {//this is next function after the upload starts
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFilePercent(Math.round(progress)); //update file upload progress
    },//calculate progress percentage upload 
    (error) => { //this is error function
      setFileUploadError(true);
    },
    () => { //this is complete function
      getDownloadURL(uploadTask.snapshot.ref)
      .then((downloadURL) => { //if successfully uploaded get the download file
        setFormData({...formData,avatar:downloadURL}) // fromdata previous state + new avatar url
        console.log('File available at', downloadURL);
        //update the user avatar in the redux store
        dispatch(updateUserSuccess({
      ...currentUser,
      avatar: downloadURL // includes the new avatar URL 
    }));
      });
    }
    );
}

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value}); //spread operator to copy the previous state and update the new state by the id of the input field
  }

  const handleSubmit = async(e) => {
    e.preventDefault(); //to prevent the default behavior of the form
    //send the form data to the backend to update the user profile
    try {
      dispatch(updateUserStart());
      const res = await fetch(`backend/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });
      const data = await res.json();
      if(data.success === false) {
        return dispatch(updateUserFailure(data.message));
      }
      dispatch(updateUserSuccess(data)); //update the user in the redux store
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  }
  return (
    <div className=' bg-white p-3 max-w-lg mx-auto mt-5 rounded-xl shadow-lg'>
      <h1 className='text-3xl font-semibold text-center my-2'>Profile</h1>
      <form className= 'flex flex-col gap-4' onSubmit={handleSubmit}> {/*gap control the space between the elements*/}
        <input onChange={(e) => setFile(e.target.files[0])} type="file"  ref={fileRef} hidden accept='image/*'/> {/* upload funcionality*/}
        <img onClick={() => fileRef.current.click()} className=" shadow-2xl w-24 h-24 rounded-full object-cover cursor-pointer self-center mt-2" src={currentUser.avatar} alt="profile" /> {/* src={formData.avatar || currentUser.avatar}if formData.avatar exist use it otherwise use currentUser.avatar..formData is newly added later sign in it will use the currentUser.avatar*/}
        <p className='text-sm self-center'>{fileUploadError ? (<span className='text-red-600'>Error uploading file(less than 2mb)</span>) : filePercent > 0 && filePercent < 100 ? (<span className='text-slate-600'>Uploading {filePercent}%</span>) : filePercent === 100 ? (<span className='text-green-500'>Upload Complete</span>) : ""}</p>
        <input className="shadow-xl p-3 rounded-xl"type="text" placeholder='username' id='username' defaultValue={currentUser.username}onChange={handleChange}/>
        <input className="shadow-xl p-3 rounded-xl"type="email" placeholder='email' defaultValue={currentUser.email}onChange={handleChange}/>
        <input className="shadow-xl p-3 rounded-xl"type="password" placeholder='password' />
        <button className='bg-slate-600 text-white p-3 rounded-xl uppercase hover:opacity-95 disabled:opacity-80 ' disabled={loading} >{loading? "Loading ...": "Update"}</button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-600 cursor-pointer'> Delete Account</span>
        <span className='text-red-600 cursor-pointer'> Sign Out</span>
      </div>
      <p className='text-red-600 mt-5'>{error ? error : ""}</p>
      <p className='text-green-600 mt-5'>{updateSuccess ? "Updated Successfully" : ""}</p>
    </div>
  )
}
