import React from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaUsers, FaEye, FaCalendarAlt, FaImage, FaRupeeSign } from "react-icons/fa";
import { MdOutlineVolunteerActivism, MdSearch } from "react-icons/md";
import { GiTempleDoor } from "react-icons/gi";

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-100 min-h-screen px-4 py-8 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
            🛕 About Our Mandapam Platform 🙏
          </h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Welcome to the Vinayaka Chavithi Mandapam Management System! <br />
            
            Our platform is built to simplify the organization, participation, and enjoyment of Ganesh Utsav celebrations — especially when they are conducted in shared community spaces called Mandapams.
            <br />
            Whether you're an organizer (Admin), a community helper (Volunteer), or just a curious visitor, this system makes it easy to discover, manage, and enjoy the festivities in your locality.
            <br />
            Manage, celebrate, and contribute to Vinayaka Chavithi Mandapams with ease and transparency.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <FaUserShield className="text-3xl text-blue-600" />, title: "Admin Role", desc: "Admins can create mandapams, approve volunteers, upload gallery, and manage schedules & expenses."
            },
            {
              icon: <MdOutlineVolunteerActivism className="text-3xl text-green-600" />, title: "Volunteers", desc: "Volunteers can join mandapams, participate in activities, and help organize the event."
            },
            {
              icon: <FaEye className="text-3xl text-purple-600" />, title: "Public Access", desc: "Anyone can browse nearby mandapams, view events, schedules, galleries, and contact info without login."
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
            <GiTempleDoor className="text-3xl" /> Platform Features
          </h2>
          <ul className="grid md:grid-cols-2 gap-6">
            {[{
              icon: <MdSearch className="text-orange-500 text-2xl" />,
              label: "Search Mandapams",
              detail: "Find nearby or known mandapams with address and admin info."
            }, {
              icon: <FaCalendarAlt className="text-orange-500 text-2xl" />,
              label: "Event Schedules",
              detail: "View daily programs, pooja timings, and cultural activities."
            }, {
              icon: <FaUsers className="text-orange-500 text-2xl" />,
              label: "Volunteer Info",
              detail: "Know who the active volunteers are, and their roles."
            }, {
              icon: <FaImage className="text-orange-500 text-2xl" />,
              label: "Gallery Uploads",
              detail: "View memorable moments captured during the festival."
            }, {
              icon: <FaRupeeSign className="text-orange-500 text-2xl" />,
              label: "Expense Tracking",
              detail: "Admins can log and display expense receipts for transparency."
            }].map((f, i) => (
              <li key={i} className="flex items-start gap-4">
                <div>{f.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-700">{f.label}</h4>
                  <p className="text-sm text-gray-600">{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-yellow-50 p-6 rounded-2xl shadow text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎯 Our Mission
          </h2>
          <p className="max-w-3xl mx-auto text-gray-600">
            To empower local communities to celebrate Ganesh Chaturthi with unity, organization, and digital simplicity. From event planning to volunteer management, our platform brings transparency and joy to every aspect of the celebration.
          </p>
        </motion.div>

        <div className="text-center pt-8">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Ganesha Mandapam Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
