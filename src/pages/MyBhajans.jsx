// ✅ CLOUDINARY DELETE & EDIT BHJAN + PREVIEW MODAL
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import Modal from "react-modal";
Modal.setAppElement("#root");

const MyBhajans = () => {
  const [user] = useAuthState(auth);
  const [bhajans, setBhajans] = useState([]);
  const [modalBhajan, setModalBhajan] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editLyrics, setEditLyrics] = useState("");

    const closeModal = () => {
    setModalBhajan(null);
    setEditing(false);
  };


  const fetchBhajans = async () => {
    if (!user) return;
    const q = query(collection(db, "bhajans"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBhajans(list);
  };

  const deleteFromCloudinary = async (url) => {
    if (!url) return;
    const publicId = url.split("/").pop().split(".")[0];
    await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/delete_by_token", {
      method: "POST",
      body: JSON.stringify({ public_id: publicId }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const handleDelete = async (bhajan) => {
    const confirm = window.confirm("Are you sure you want to delete this bhajan?");
    if (!confirm) return;
    try {
      // Delete files from Cloudinary
      await deleteFromCloudinary(bhajan.audioURL);
      await deleteFromCloudinary(bhajan.imageURL);
      await deleteFromCloudinary(bhajan.lyricsURL);

      await deleteDoc(doc(db, "bhajans", bhajan.id));
      toast.success("Bhajan deleted!");
      fetchBhajans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete.");
    }
  };

  const handleEdit = async () => {
    if (!modalBhajan) return;
    await updateDoc(doc(db, "bhajans", modalBhajan.id), {
      title: editTitle.trim(),
      lyricsText: editLyrics.trim(),
    });
    toast.success("Bhajan updated!");
    setModalBhajan(null);
    setEditing(false);
    fetchBhajans();
  };

  useEffect(() => {
    fetchBhajans();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">🎼 My Uploaded Bhajans</h2>
      {bhajans.length === 0 ? (
        <p>No bhajans uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {bhajans.map(b => (
            <div key={b.id} className="bg-white p-4 shadow rounded-xl relative">
              <h3 className="font-semibold text-lg">{b.title}</h3>
              {b.audioURL && <audio controls src={b.audioURL} className="w-full mt-2" />}
              <div className="mt-4 flex justify-between text-sm">
                <button
                  onClick={() => setModalBhajan(b)}
                  className="text-blue-600 hover:underline"
                >Preview</button>
                <button
                  onClick={() => {
                    setModalBhajan(b);
                    setEditTitle(b.title);
                    setEditLyrics(b.lyricsText);
                    setEditing(true);
                  }}
                  className="text-green-600 hover:underline"
                >Edit</button>
                <button
                  onClick={() => handleDelete(b)}
                  className="text-red-600 hover:underline"
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!modalBhajan}
        onRequestClose={closeModal}
        className="bg-white p-8 rounded-xl max-w-xl mx-auto mt-20 outline-none shadow-xl overflow-y-auto max-h-screen"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      >

        {editing ? (
          <>
            <h2 className="text-lg font-bold mb-2">✏️ Edit Bhajan</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full mb-3 border rounded p-2"
              placeholder="Title"
            />
            <textarea
              value={editLyrics}
              onChange={(e) => setEditLyrics(e.target.value)}
              rows={6}
              className="w-full mb-4 border rounded p-2"
              placeholder="Lyrics"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="text-gray-500">Cancel</button>
              <button onClick={handleEdit} className="text-white bg-green-600 px-4 py-1 rounded">Save</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-2">🎶 {modalBhajan?.title}</h2>
            {modalBhajan?.audioURL && <audio controls src={modalBhajan.audioURL} className="w-full mb-4" />}
            {modalBhajan?.lyricsText && <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-3 rounded-lg max-h-160 overflow-y-auto">{modalBhajan.lyricsText}</pre>}
            <div className="text-right mt-4">
              <button onClick={closeModal} className="text-blue-600 hover:underline">Close</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default MyBhajans;