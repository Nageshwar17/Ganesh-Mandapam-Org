import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const AdminRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsAdmin(data.role === "admin");
      }
    };

    checkRole();
  }, [user]);

  if (loading || isAdmin === null) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/unauthorized" />;
  return children;
};

export default AdminRoute;
