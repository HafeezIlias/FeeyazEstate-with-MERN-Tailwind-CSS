import React, { useRef, useEffect, useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useSelector, useDispatch } from "react-redux";
import { app } from "../firebase.js";
import {
  updateUserSuccess,
  updateUserStart,
  updateUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
} from "../redux/user/userSlice.js";
import { set } from "mongoose";
import { Link } from "react-router-dom";
export default function Profile() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined); // file is like a const that holds the state, to update the state we need to use the setFile
  const [filePercent, setFilePercent] = useState(0); //initialize file upload progress to 0
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({}); // to hold the form data
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  //firebase storage
  //allow read
  //allow write: if request.resource.data.size < 2*1024*1024 && request.resource.data.contentType.matches('image/.*');

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("backend/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        return dispatch(signOutUserFailure(data.message));
      }
      dispatch(signOutUserSuccess());
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
      console.log(error);
    }
  };

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);
  const handleFileUpload = async (file) => {
    //upload file to firebase storage
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name; //to make the file name unique
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed", //on is an event listener that have three callback functions
      (snapshot) => {
        //this is next function after the upload starts
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercent(Math.round(progress)); //update file upload progress
      }, //calculate progress percentage upload
      (error) => {
        //this is error function
        setFileUploadError(true);
      },
      () => {
        //this is complete function
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          //if successfully uploaded get the download file
          setFormData({ ...formData, avatar: downloadURL }); // fromdata previous state + new avatar url
          console.log("File available at", downloadURL);
          //update the user avatar in the redux store
          dispatch(
            updateUserSuccess({
              ...currentUser,
              avatar: downloadURL, // includes the new avatar URL
            })
          );
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value }); //spread operator to copy the previous state and update the new state by the id of the input field
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); //to prevent the default behavior of the form
    //send the form data to the backend to update the user profile
    try {
      dispatch(updateUserStart());
      const res = await fetch(`backend/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        return dispatch(updateUserFailure(data.message));
      }
      dispatch(updateUserSuccess(data)); //update the user in the redux store
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`backend/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        return dispatch(deleteUserFailure(data.message));
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleShowListing = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`backend/user/listing/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      const res = await fetch(`backend/listing/delete/${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className=" bg-white p-3 max-w-lg mx-auto mt-5 rounded-xl shadow-lg">
      <h1 className="text-3xl font-semibold text-center my-2">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {" "}
        {/*gap control the space between the elements*/}
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />{" "}
        {/* upload funcionality*/}
        <img
          onClick={() => fileRef.current.click()}
          className=" shadow-2xl w-24 h-24 rounded-full object-cover cursor-pointer self-center mt-2"
          src={currentUser.avatar}
          alt="profile"
        />{" "}
        {/* src={formData.avatar || currentUser.avatar}if formData.avatar exist use it otherwise use currentUser.avatar..formData is newly added later sign in it will use the currentUser.avatar*/}
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-600">
              Error uploading file(less than 2mb)
            </span>
          ) : filePercent > 0 && filePercent < 100 ? (
            <span className="text-slate-600">Uploading {filePercent}%</span>
          ) : filePercent === 100 ? (
            <span className="text-green-500">Upload Complete</span>
          ) : (
            ""
          )}
        </p>
        <input
          className="shadow-xl p-3 rounded-xl"
          type="text"
          placeholder="username"
          id="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          className="shadow-xl p-3 rounded-xl"
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <input
          className="shadow-xl p-3 rounded-xl"
          type="password"
          placeholder="password"
        />
        <button
          className="bg-slate-600 text-white p-3 rounded-xl uppercase hover:opacity-95 disabled:opacity-80 "
          disabled={loading}
        >
          {loading ? "Loading ..." : "Update"}
        </button>
        <Link
          className="bg-green-600 text-white p-3 rounded-xl uppercase hover:opacity-95 disabled:opacity-80 text-center"
          to="/create-listing"
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-600 cursor-pointer"
        >
          {" "}
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-600 cursor-pointer">
          {" "}
          Sign Out
        </span>
      </div>
      <p className="text-red-600 mt-5">{error ? error : ""}</p>
      <p className="text-green-600 mt-5">
        {updateSuccess ? "Updated Successfully" : ""}
      </p>
      <button onClick={handleShowListing} className="text-green-500 w-full">
        Show Listing
      </button>
      <p className="text-red-600 mt-5">
        {showListingsError ? "Error Fetching Listings" : ""}
      </p>
      {userListings && userListings.length > 0 && (
        <div>
          <h1 className="text-center mt-7 text-3xl font-semibold flex-col gap-4">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4 mt-2"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  className="h-16 w-16 object-contain "
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                />
              </Link>
              <Link
                className="flex-1 text-slate-600 font-semibold hover:underline truncate"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-600 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-600 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
