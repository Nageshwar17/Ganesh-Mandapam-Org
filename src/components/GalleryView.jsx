import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";
import Masonry from "react-masonry-css";
import { toast } from "react-hot-toast";

const GalleryView = ({ mandapamId }) => {
  const [images, setImages] = useState([]);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    if (mandapamId) {
      fetchImages();
    }
  }, [mandapamId]);

  useEffect(() => {
    if (user) {
      checkAdmin();
    }
  }, [user]);

  const checkAdmin = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setIsAdmin(userDoc.exists() && userDoc.data().isMandapamAdmin === true);
    } catch (err) {
      console.error("Error checking admin:", err);
    }
  };

  const fetchImages = async () => {
    try {
      const q = query(
        collection(db, "mandapams", mandapamId, "gallery"),
        orderBy("uploadedAt", "desc")
      );
      const snap = await getDocs(q);
      let imgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setImages(imgs);
      imgs.forEach((img) => fetchComments(img.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (imageId) => {
    try {
      const q = query(
        collection(db, "mandapams", mandapamId, "gallery", imageId, "comments"),
        orderBy("createdAt", "asc")
      );
      const snap = await getDocs(q);
      setComments((prev) => ({
        ...prev,
        [imageId]: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (image) => {
    if (!user) {
      toast.error("Login to like images");
      return;
    }
    const ref = doc(db, "mandapams", mandapamId, "gallery", image.id);
    const hasLiked = image.likes?.includes(user.uid);

    try {
      await updateDoc(ref, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                likes: hasLiked
                  ? img.likes.filter((uid) => uid !== user.uid)
                  : [...(img.likes || []), user.uid],
              }
            : img
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (imageId) => {
    if (!user) {
      toast.error("Login to comment");
      return;
    }
    const text = newComment[imageId]?.trim();
    if (!text) return;

    try {
      const newCommentDoc = await addDoc(
        collection(db, "mandapams", mandapamId, "gallery", imageId, "comments"),
        {
          userId: user.uid,
          userName: user.displayName || user.email || "Anonymous",
          userPhoto: user.photoURL || null,
          text,
          createdAt: serverTimestamp(),
        }
      );
      setNewComment((prev) => ({ ...prev, [imageId]: "" }));

      setComments((prev) => ({
        ...prev,
        [imageId]: [
          ...(prev[imageId] || []),
          {
            id: newCommentDoc.id,
            userId: user.uid,
            userName: user.displayName || user.email || "Anonymous",
            userPhoto: user.photoURL || null,
            text,
            createdAt: { toDate: () => new Date() },
          },
        ],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (imageId, comment) => {
    if (!user) return;
    if (comment.userId !== user.uid && !isAdmin) {
      toast.error("You can't delete this comment");
      return;
    }
    try {
      await deleteDoc(
        doc(
          db,
          "mandapams",
          mandapamId,
          "gallery",
          imageId,
          "comments",
          comment.id
        )
      );
      setComments((prev) => ({
        ...prev,
        [imageId]: prev[imageId].filter((c) => c.id !== comment.id),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Delete Image
  const deleteImage = async (imageId, uploaderId) => {
    if (!user) return;
    if (uploaderId !== user.uid && !isAdmin) {
      toast.error("You can't delete this image");
      return;
    }
    try {
      await deleteDoc(doc(db, "mandapams", mandapamId, "gallery", imageId));
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete image");
    }
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div className="px-0 py-4">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-white shadow-md overflow-hidden"
          >
            <img src={img.imageURL} alt="" className="w-full object-cover" />
            <div className="p-3">
              {/* Uploader info & delete button */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Uploaded by: {img.uploadedBy}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">
                    {img.uploadedAt?.toDate
                      ? img.uploadedAt.toDate().toLocaleString()
                      : ""}
                  </p>
                  {(img.uploaderId === user?.uid || isAdmin) && (
                    <button
                      onClick={() => deleteImage(img.id, img.uploaderId)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>

              {/* Likes */}
              <div className="flex items-center mt-2">
                <button
                  onClick={() => toggleLike(img)}
                  className="flex items-center text-red-500"
                >
                  {user && img.likes?.includes(user.uid) ? (
                    <FaHeart className="mr-1" />
                  ) : (
                    <FaRegHeart className="mr-1" />
                  )}
                </button>
                <span>{img.likes?.length || 0} Likes</span>
              </div>

              {/* Comments */}
              <div className="mt-3">
                {comments[img.id]?.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-2 mb-2 border-b pb-1"
                  >
                    <img
                      src={c.userPhoto || "/default-avatar.png"}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.userName}</p>
                      <p className="text-sm">{c.text}</p>
                      <p className="text-xs text-gray-400">
                        {c.createdAt?.toDate
                          ? c.createdAt.toDate().toLocaleString()
                          : ""}
                      </p>
                    </div>
                    {(c.userId === user?.uid || isAdmin) && (
                      <button
                        onClick={() => deleteComment(img.id, c)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add comment */}
              {user && (
                <div className="flex mt-2 gap-2">
                  <input
                    type="text"
                    value={newComment[img.id] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [img.id]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="flex-1 border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => addComment(img.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default GalleryView;
