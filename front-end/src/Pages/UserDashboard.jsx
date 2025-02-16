import React, { useEffect, useState } from "react";
import { fetchLikedProperties, fetchSavedProperties,toggleLikeProperty,toggleSaveProperty  } from "../services/propertyService"; // Add functions to fetch liked and saved properties
import PropertyCard from "../components/PropertyCard"; // A component to display property details
import { fetchUserMessages, fetchReplies } from "../services/messageService";


const UserDashboard = () => {
  const [likedProperties, setLikedProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [messages, setMessages] = useState([]); 
  const [error, setError] = useState("");

  useEffect(() => {
    const getLikedProperties = async () => {
      try {
        const likedData = await fetchLikedProperties();
        setLikedProperties(likedData);
      } catch (err) {
        setError("Failed to fetch liked properties.");
      }
    };
    const getSavedProperties = async () => {
      try {
        const savedData = await fetchSavedProperties();
        setSavedProperties(savedData);
      } catch (err) {
        setError("Failed to fetch saved properties.");
      }
    };
    getLikedProperties();
    getSavedProperties();
  }, []);

  // Handle Unlike
  const handleUnlike = async (id) => {
    try {
      await toggleLikeProperty(id);
      setLikedProperties(likedProperties.filter(property => property._id !== id));
    } catch (err) {
      setError("Failed to unlike the property.");
    }
  };


 // Handle Unsave
 const handleUnsave = async (id) => {
  try {
    await toggleSaveProperty(id);
    setSavedProperties(savedProperties.filter(property => property._id !== id));
  } catch (err) {
    setError("Failed to unsave the property.");
  }
};

useEffect(() => {
  const getMessages = async () => {
    try {
      const messagesData = await fetchUserMessages();
      
      // Fetch replies for each message
      const messagesWithReplies = await Promise.all(
        messagesData.map(async (msg) => {
          const replies = await fetchReplies(msg._id);
          return { ...msg, replies };
        })
      );

      setMessages(messagesWithReplies);
    } catch (err) {
      setError("Failed to fetch messages.");
    }
  };
  getMessages();  
}, []);



  return (
    <div className="mt-20 max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">user Dashboard</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Liked Properties</h2>
        {likedProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedProperties.map((property) => (
              <PropertyCard key={property._id} property={property}  onUnlike={() => handleUnlike(property._id)}/>
            ))}
          </div>
        ) : (
          <p>No liked properties yet.</p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Saved Properties</h2>
        {savedProperties.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((property) => (
              <PropertyCard key={property._id} property={property} onUnsave={() => handleUnsave(property._id)}/>
            ))}
            
          </div>
        ) : (
          <p>No saved properties yet.</p>
        )}
      </div>
  
    <div className="mt-20 max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">User Messages</h1>

      {messages.length > 0 ? (
  messages.map((msg) => (
    <div key={msg._id} className="border p-3 my-2 rounded-lg bg-gray-50">
    <p><strong>Property:</strong> {msg.propertyId?.title || "Unknown"}</p>
      <p><strong>{msg.sender}</strong> ({msg.email}):</p>
      <p className="text-gray-700">{msg.message}</p>
      <p className="text-sm text-gray-500">Sent: {new Date(msg.timestamp).toLocaleString()}</p>

      {/* Display Replies */}
      {msg.replies.length > 0 && (
        <div className="mt-2 p-2 border-l-4 border-blue-500 bg-blue-50 rounded">
          <h3 className="text-md font-semibold text-blue-600">Replies:</h3>
          {msg.replies.map((reply) => (
            <p key={reply._id} className="text-gray-800">
              {reply.message} <span className="text-sm text-gray-500">({new Date(reply.timestamp).toLocaleString()})</span>
            </p>
          ))}
        </div>
      )}
    </div>
  ))
) : (
  <p className="text-gray-500 text-center">No messages received.</p>
)}


    </div>
    </div>
  );
};

export default UserDashboard;



