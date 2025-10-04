import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
// Main component for creating real estate listings
export default function UpdateListing() {
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Track upload status
  const [uploading, setUploading] = useState(false);
  // State for storing selected files before upload
  const [files, setFile] = useState([]);
  // State for storing preview URLs of selected files (before Firebase upload)
  const [previewUrls, setPreviewUrls] = useState([]);
    // Track image upload errors
  const [imageUploadError, setImageUploadError] = useState(false);
  // State for form data including uploaded image URLs from Firebase
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  }); //set the initial state of the form data

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/backend/listing/getListing/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    };

    fetchListing();
  }, []);


  // Function to generate preview URLs from selected files
  // This creates temporary blob URLs that can be displayed immediately
  const generatePreviews = (fileList) => {
    const newPreviewUrls = [];

    // Loop through each selected file
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Create a temporary URL for the file that can be used as an image src
      // URL.createObjectURL creates a blob URL that represents the file data
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrls.push(previewUrl);
    }

    // Update the preview URLs state
    setPreviewUrls(newPreviewUrls);
  };

  // Function to clean up preview URLs to prevent memory leaks
  const cleanupPreviews = () => {
    // Revoke all existing preview URLs to free up memory
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  // Function to remove a specific preview
  const removePreview = (indexToRemove) => {
    // Revoke the URL for the specific preview being removed
    URL.revokeObjectURL(previewUrls[indexToRemove]);

    // Remove from preview URLs
    const newPreviewUrls = previewUrls.filter(
      (_, index) => index !== indexToRemove
    );
    setPreviewUrls(newPreviewUrls);

    // Remove from files array
    const newFiles = Array.from(files).filter(
      (_, index) => index !== indexToRemove
    );
    setFile(newFiles);
  };

  // Handle image upload to Firebase
  const handleImageSubmit = (e) => {
    e.preventDefault();
    // Check if files are selected and total images don't exceed 6
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      // Create upload promises for each file
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      // Upload all files to Firebase Storage
      Promise.all(promises)
        .then((urls) => {
          // Add the uploaded URLs to form data
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
          // Clean up preview URLs after successful upload
          cleanupPreviews();
          // Reset files array
          setFile([]);
        })
        .catch(() => {
          setImageUploadError("Images upload failed");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload a maximum of 6 images");
      setUploading(false);
    }
  };

  // Function to upload a single file to Firebase Storage
  // Returns a Promise that resolves to the download URL
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      // Get Firebase Storage instance
      const storage = getStorage(app);
      // Create unique filename using timestamp + original filename
      const fileName = new Date().getTime() + file.name;
      // Create storage reference
      const storageRef = ref(storage, fileName);
      // Create upload task with resumable upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload progress and handle completion
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Calculate upload progress percentage
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");

          // Log upload state changes
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          // Handle upload errors
          reject(error);
        },
        () => {
          // Handle successful upload completion
          // Get the download URL for the uploaded file
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  // Remove uploaded image from form data
  // This removes an image that has already been uploaded to Firebase
  const handleRemoveImage = (indexToRemove) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter(
        (_, index) => index !== indexToRemove
      ),
    });
  };

  // Handle form input changes and update formData state
  // This function manages different types of inputs: checkboxes, text, and numbers
  const handleChange = (e) => {
    // Handle property type selection (sale or rent)
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }
    // Handle boolean checkboxes (parking, furnished, offer)
    else if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }
    // Handle text inputs and number inputs
    else if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  // Handle form submission to create a new listing
  // Sends listing data to backend API and handles response
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent the form from submitting and refreshing the page
    try {
      if (formData.imageUrls.length < 1)
        return setError("Please upload at least one image");
      if (+formData.regularPrice < +formData.discountedPrice)
        return setError("Discounted price should be less than regular price");
      setLoading(true);
      setError(false);

      // Send POST request to backend with listing data
      const res = await fetch(`/backend/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id, // Add current user ID to the listing
        }),
      });

      const data = await res.json();

      // Check if API returned an error
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      // If listing creation is successful, navigate to home page
      setLoading(false);
      setError(null);
      navigate(`/listing/${data._id}`);
    } catch (error) {
      // Handle any network or other errors
      setError(error.message);
      setLoading(false);
    }
  };

  // Render the create listing form
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update an estate
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            className=" bg-white p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={10}
            type="text"
            placeholder="Name"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            className=" bg-white p-3 rounded-lg"
            id="description"
            type="text"
            placeholder="Description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            className=" bg-white p-3 rounded-lg"
            id="address"
            type="text"
            placeholder="Address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span> Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <input
                className="bg-white p-3 rounded-lg"
                type="number"
                id="bedrooms"
                min="1"
                max={10}
                required
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Bedroom</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="bg-white p-3 rounded-lg"
                type="number"
                id="bathrooms"
                min="1"
                max={10}
                required
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Bathroom</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <input
                  className="bg-white p-3 rounded-lg"
                  type="number"
                  id="regularPrice"
                  min="50"
                  max={10000}
                  required
                  onChange={handleChange}
                  value={formData.regularPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Regular Price</p>
                  <span className="text-xs">RM/Months</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              {formData.offer && ( //if offer is true
                <div className="flex items-center gap-2">
                  <input
                    className="bg-white p-3 rounded-lg"
                    type="number"
                    id="discountedPrice"
                    min="0"
                    max={11000}
                    required
                    onChange={handleChange}
                    value={formData.discountedPrice}
                  />
                  <div className="flex flex-col items-center">
                    <p>Discounted Price</p>
                    <span className="text-xs">RM/Months</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className=" font-semibold">Images:</p>
          <span className="font-normal text-gray-500 ml-2">
            The first image will be the cover (max 6)
          </span>
          <div className="flex gap-4 ">
            <input
              onChange={(e) => {
                // Store the selected files
                setFile(e.target.files);
                // Generate preview URLs for immediate display
                if (e.target.files && e.target.files.length > 0) {
                  // Clean up any existing previews first
                  cleanupPreviews();
                  // Generate new previews
                  generatePreviews(e.target.files);
                } else {
                  // If no files selected, clean up previews
                  cleanupPreviews();
                }
              }}
              className="p-3 border border-gray-300 rounded-lg w-full "
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={uploading}
              className=" p-3 text-green-600 border border-green-600 rounded-lg uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>{" "}
            {/* we change to type button because we want it to button for the image uploadd not to submit the form as it inside the form */}
          </div>

          {/* Error message display */}
          <p className="text-red-600 text-sm">
            {imageUploadError && imageUploadError}
          </p>

          {/* Preview Section - Shows selected files before upload */}
          {previewUrls.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Selected Images (Preview):</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    {/* Preview image */}
                    <img
                      className="w-full h-24 object-cover rounded-lg border"
                      src={url}
                      alt={`Preview ${index + 1}`}
                    />
                    {/* Remove button for individual preview */}
                    <button
                      type="button"
                      onClick={() => removePreview(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Images Section - Shows images that have been uploaded to Firebase */}
          {formData.imageUrls.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Uploaded Images:</p>
              {formData.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex justify-between p-3 border items-center mb-2 rounded-lg"
                >
                  <img
                    className="w-20 h-20 object-contain rounded-lg"
                    src={url}
                    alt="listing image"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-3 text-red-600 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Updating..." : "Update Listing"}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}
