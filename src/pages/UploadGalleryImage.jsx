import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import GalleryView from "../components/GalleryView";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

const CLOUDINARY_UPLOAD_PRESET = "vinayakauploads";
const CLOUDINARY_CLOUD_NAME = "dpeikoqsv";

const UploadGalleryImage = () => {
  const { mandapamId } = useParams();
  const [user] = useAuthState(auth);
  const [image, setImage] = useState(null);
  const [isAllowed, setIsAllowed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!mandapamId) {
        console.error("No mandapamId found in route params");
        setLoadingPerms(false);
        return;
      }
      if (!user) {
        setLoadingPerms(false);
        return;
      }

      try {
        // 1. Check admin
        const mandapamRef = doc(db, "mandapams", mandapamId);
        const mandapamSnap = await getDoc(mandapamRef);

        if (mandapamSnap.exists()) {
          const mandapamData = mandapamSnap.data();
          if (mandapamData.adminId === user.uid) {
            setIsAllowed(true);
            setLoadingPerms(false);
            return;
          }
        }

        // 2. Check if approved volunteer
        const volunteerSnap = await getDocs(
          collection(db, `mandapams/${mandapamId}/volunteers`)
        );

        const isVolunteer = volunteerSnap.docs.some(
          (doc) =>
            doc.data().userId === user.uid &&
            doc.data().status === "approved"
        );

        setIsAllowed(isVolunteer);
      } catch (err) {
        console.error("Error checking permissions:", err);
        toast.error("Error checking permissions");
      } finally {
        setLoadingPerms(false);
      }
    };

    checkPermissions();
  }, [mandapamId, user]);

  const handleUpload = async () => {
    if (!image) return toast.error("Select an image first");
    if (!mandapamId) return toast.error("Invalid mandapam ID");

    setUploading(true);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `mandapam_${mandapamId}_gallery`);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();

      if (res.ok) {
        await addDoc(collection(db, `mandapams/${mandapamId}/gallery`), {
          imageURL: data.secure_url,
          publicId: data.public_id, // Store this for deletion
          uploadedBy: user.email,
          uploadedAt: new Date().toISOString(),
          uploaderId: user.uid,
          likes: [],
        });
        toast.success("Image uploaded successfully");
        setImage(null);
      } else {
        console.error("Cloudinary error:", data);
        toast.error("Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload error");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-12 text-gray-600">
        Please log in to upload images.
      </div>
    );
  }

  if (loadingPerms) {
    return (
      <div className="text-center mt-12 text-gray-500 animate-pulse">
        Checking permissions...
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="text-center mt-12 text-red-600 font-semibold">
        You do not have permission to upload to this gallery.
      </div>
    );
  }

  return (
    <>
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">
        Upload Image to Gallery
      </h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-4 w-full"
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !image}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded w-full"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
    
    </div>
    <div className="mt-10">
      <GalleryView mandapamId={mandapamId} />
    </div>
    </>
  );
};

export default UploadGalleryImage;
