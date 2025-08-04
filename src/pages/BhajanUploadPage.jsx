import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { FaMusic, FaFileImage, FaFileAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

const BhajanUploadPage = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [lyricsFile, setLyricsFile] = useState(null);
  const [lyricsText, setLyricsText] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const handleCloudinaryUpload = async (file, folder) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // <-- Replace this
    formData.append("folder", folder);

    const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/auto/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.error("Title is required.");
      return;
    }

    setUploading(true);
    try {
      const audioURL = audioFile ? await handleCloudinaryUpload(audioFile, "bhajans/audio") : "";
      const imageURL = imageFile ? await handleCloudinaryUpload(imageFile, "bhajans/images") : "";
      const lyricsURL = lyricsFile ? await handleCloudinaryUpload(lyricsFile, "bhajans/lyrics") : "";

      await addDoc(collection(db, "bhajans"), {
        title,
        audioURL,
        imageURL,
        lyricsURL,
        lyricsText: lyricsFile ? "" : lyricsText.trim(), // store typed lyrics if no file
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      toast.success("Bhajan uploaded successfully!");
      setTitle("");
      setAudioFile(null);
      setImageFile(null);
      setLyricsFile(null);
      setLyricsText("");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="absolute left-4 top-5 bg-white border rounded-xl text-orange-600 px-3 py-1 shadow"
      >
        <FiArrowLeft />
      </button>

      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl p-8 mt-8">
        <h2 className="text-3xl font-bold text-rose-600 mb-2">🎵 Upload Bhajan</h2>
        <p className="text-gray-600 mb-6">
          You can upload bhajan lyrics (as text or file), audio (MP3), and an optional image.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Bhajan Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-300 outline-none"
              placeholder="Eg: Ganesha Stuthi"
              required
            />
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Audio (MP3)</label>
            <p className="text-xs text-gray-500 mb-1">Accepted: .mp3, .m4a, .aac</p>
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <FaMusic className="text-rose-600 text-xl" />
              <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Image (optional)</label>
            <p className="text-xs text-gray-500 mb-1">Accepted: .jpg, .jpeg, .png</p>
            <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <FaFileImage className="text-purple-600 text-xl" />
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
          </div>

          {/* Lyrics Upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Lyrics File (optional)</label>
            <p className="text-xs text-gray-500 mb-1">Accepted: .pdf, .txt</p>
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <FaFileAlt className="text-blue-600 text-xl" />
              <input type="file" accept=".pdf,.txt" onChange={(e) => setLyricsFile(e.target.files[0])} />
            </div>
          </div>

          {/* Lyrics Textarea */}
          {!lyricsFile && (
            <div>
              <label className="block font-medium text-gray-700 mb-1">Type or Paste Lyrics</label>
              <textarea
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                placeholder="Type lyrics here if you didn’t upload a file..."
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
              ></textarea>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg shadow-lg transition"
          >
            {uploading ? "Uploading..." : "Upload Bhajan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BhajanUploadPage;
