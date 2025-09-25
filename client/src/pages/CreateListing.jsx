import React from "react";

export default function CreateListing() {
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a new estate
      </h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            className=" bg-white p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={10}
            type="text"
            placeholder="Name"
            required
          />
          <input
            className=" bg-white p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={10}
            type="text"
            placeholder="Description"
            required
          />
          <input
            className=" bg-white p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={10}
            type="text"
            placeholder="Address"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span> Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
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
              />
              <p>Bathroom</p>
            </div>
            <div className="lex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <input
                  className="bg-white p-3 rounded-lg"
                  type="number"
                  id="Regular Price"
                  min="1"
                  max={10}
                  required
                />
                <div className="flex flex-col items-center">
                  <p>Regular Price</p>
                  <span className="text-xs">RM/Months</span>
                </div>
              </div>
            </div>
            <div className="lex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <input
                  className="bg-white p-3 rounded-lg"
                  type="number"
                  id="Discounted Price"
                  min="1"
                  max={10}
                  required
                />
                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  <span className="text-xs">RM/Months</span>
                </div>
              </div>
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
              className="p-3 border border-gray-300 rounded-lg w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button className=" p-3 text-green-600 border border-green-600 rounded-lg uppercase hover:shadow-lg disabled:opacity-80">
              Upload
            </button>
          </div>
          <button className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}
