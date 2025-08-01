import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const CLOUDINARY_UPLOAD_PRESET = "vinayakauploads";
const CLOUDINARY_CLOUD_NAME = "dpeikoqsv";

const CreateMandapam = () => {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    country: "India",
    address: "",
    description: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      toast.error("You must be logged in to create a mandapam.");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error.message}</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append("file", logoFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const { name, city, state, address } = form;

  if (!name || !city || !state || !address) {
    toast.error("Please fill all required fields.");
    return;
  }

  try {
    setUploading(true);

    let uploadedUrl = form.logoUrl;
    if (logoFile) {
      uploadedUrl = await handleImageUpload();
    }

    // Step 1: Create a document reference (to get the ID in advance)
    const mandapamRef = doc(collection(db, "mandapams"));

    // Step 2: Set data explicitly with ID
    await setDoc(mandapamRef, {
      ...form,
      logoUrl: uploadedUrl,
      createdAt: new Date().toISOString(),
      mandapamId: mandapamRef.id,
      adminId: user.uid,
      adminEmail: user.email,
      adminName: user.displayName || "", // optional
      members: [user.uid],
    });

    // Step 3: Save user with mandapamId
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role: "admin",
      mandapamId: mandapamRef.id,
    });

    toast.success("Mandapam created successfully!");

    setForm({
      name: "",
      city: "",
      state: "",
      country: "India",
      address: "",
      description: "",
      logoUrl: "",
    });
    setLogoFile(null);
    navigate("/admin/dashboard");

  } catch (error) {
    console.error(error);
    toast.error("Failed to create mandapam.");
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-orange-600 text-center mb-6">
          Create Your Mandapam
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <input
            type="text"
            name="name"
            placeholder="Mandapam Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              required
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
              readOnly
              className="border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <textarea
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            required
            className="w-full border rounded-lg px-4 py-2"
          />

          <textarea
            name="description"
            placeholder="Description / Festival Details"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg px-4 py-2"
          />

          <div>
            <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-600 mb-1">
              Upload Logo / Banner (optional)
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 rounded-lg text-white ${
              uploading ? "bg-orange-300" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {uploading ? "Creating..." : "Create Mandapam"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMandapam;
