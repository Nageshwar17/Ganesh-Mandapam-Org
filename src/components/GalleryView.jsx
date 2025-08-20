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
import { FaHeart, FaRegHeart, FaTrash, FaComment } from "react-icons/fa";
import { HiOutlineShare } from "react-icons/hi";
import Masonry from "react-masonry-css";
import { toast } from "react-hot-toast";

const GalleryView = ({ mandapamId }) => {
  const [images, setImages] = useState([]);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [likeAnimationId, setLikeAnimationId] = useState(null);

  useEffect(() => {
    if (mandapamId) fetchImages();
  }, [mandapamId]);

  useEffect(() => {
    if (user) checkAdmin();
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

  // Like toggled by icon click
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

  // Double-click always adds like; no unlike on double tap
  const handleDoubleClick = async (image) => {
    if (!user) {
      toast.error("Login to like images");
      return;
    }
    if (image.likes?.includes(user.uid)) {
      // Already liked: just animate heart
      setLikeAnimationId(image.id);
      setTimeout(() => setLikeAnimationId(null), 1200);
      return;
    }
    const ref = doc(db, "mandapams", mandapamId, "gallery", image.id);
    try {
      await updateDoc(ref, {
        likes: arrayUnion(user.uid),
      });
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, likes: [...(img.likes || []), user.uid] }
            : img
        )
      );
      setLikeAnimationId(image.id);
      setTimeout(() => setLikeAnimationId(null), 1200);
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
        doc(db, "mandapams", mandapamId, "gallery", imageId, "comments", comment.id)
      );
      setComments((prev) => ({
        ...prev,
        [imageId]: prev[imageId].filter((c) => c.id !== comment.id),
      }));
    } catch (err) {
      console.error(err);
    }
  };

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

  // Share button handler (uses Web Share API if available)
  const handleShare = (image) => {
    if (navigator.share) {
      navigator
        .share({
          title: "Mandapam Gallery Image",
          url: image.imageURL,
        })
        .catch((error) => toast.error("Failed to share"));
    } else {
      // fallback: copy URL
      navigator.clipboard.writeText(image.imageURL);
      toast.success("Image URL copied to clipboard");
    }
  };

  return (
    <div className="px-0 py-4 max-w-7xl mx-auto">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((img) => {
          const likedByUser = user && img.likes?.includes(user.uid);
          const commentCount = comments[img.id]?.length || 0;
          return (
            <div
              key={img.id}
              className="relative bg-white shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300 flex flex-col"
            >
              <div
                className="relative w-full cursor-pointer group overflow-hidden select-none"
                onDoubleClick={() => handleDoubleClick(img)}
              >
                <img
                  src={img.imageURL}
                  alt=""
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {likeAnimationId === img.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <FaHeart className="text-red-500 text-7xl animate-love" />
                  </div>
                )}
                {(img.uploaderId === user?.uid || isAdmin) && (
                  <button
                    onClick={() => deleteImage(img.id, img.uploaderId)}
                    className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 transition"
                    aria-label="Delete image"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span title={`Uploaded by ${img.uploadedBy}`}>{img.uploadedBy}</span>
                  <span>{img.uploadedAt?.toDate ? img.uploadedAt.toDate().toLocaleString() : ""}</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {/* Comment icon with count left */}
                  <button
                    onClick={() =>
                      setShowCommentsFor(showCommentsFor === img.id ? null : img.id)
                    }
                    className="flex items-center text-gray-600 hover:text-orange-500 transition"
                    aria-label="Toggle comments"
                  >
                    <FaComment className="text-xl mr-1" />
                    <span className="select-none">{commentCount}</span>
                  </button>

                  {/* Like icon toggle */}
                  <button
                    onClick={() => toggleLike(img)}
                    className={`flex items-center text-2xl focus:outline-none focus:ring-2 focus:ring-red-400 rounded transition-colors ${
                      likedByUser ? "text-red-500" : "text-gray-400"
                    }`}
                    aria-label={likedByUser ? "Unlike" : "Like"}
                  >
                    {likedByUser ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <span className="select-none text-gray-700 font-semibold">{img.likes?.length || 0}</span>

                  {/* Share button */}
                  <button
                    onClick={() => handleShare(img)}
                    className="ml-auto flex items-center text-gray-600 hover:text-green-500 transition"
                    aria-label="Share image"
                  >
                    <HiOutlineShare className="w-6 h-6" />
                  </button>
                </div>

                {showCommentsFor === img.id && (
                  <div className="border-t pt-2 space-y-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
                    {(comments[img.id]?.length === 0 || !comments[img.id]) && (
                      <p className="text-sm text-gray-400 italic">No comments yet.</p>
                    )}
                    {comments[img.id]?.map((c) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <img
                          src={c.userPhoto || "/default-avatar.png"}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-semibold text-gray-900">{c.userName}</p>
                          <p>{c.text}</p>
                          <p className="text-xs text-gray-400">
                            {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ""}
                          </p>
                        </div>
                        {(c.userId === user?.uid || isAdmin) && (
                          <button
                            onClick={() => deleteComment(img.id, c)}
                            className="text-gray-400 hover:text-red-600 ml-2"
                            aria-label="Delete comment"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}

                    {user && (
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComment[img.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({ ...prev, [img.id]: e.target.value }))
                          }
                          className="flex-grow border rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        />
                        <button
                          onClick={() => addComment(img.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 flex-shrink-0 text-sm font-semibold transition"
                          aria-label="Post comment"
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Masonry>

      <style>{`
        @keyframes love-burst {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          15% {
            transform: scale(1.1);
            opacity: 1;
          }
          30% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        .animate-love {
          animation: love-burst 1.2s ease forwards;
        }
        /* Scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #fed7aa; /* orange-100 */
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #f97316; /* orange-500 */
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default GalleryView;
