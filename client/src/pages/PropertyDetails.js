import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      console.log('Fetching property:', id);
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/properties/${id}`);
        console.log('Fetch Property Response:', res.data);
        setProperty(res.data);
      } catch (err) {
        console.error('Fetch Property Error:', err.response?.data);
        setError(err.response?.data?.msg || 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;
  if (!property) return <div className="text-center p-6">Property not found</div>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">{property.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photos */}
        <div>
          {property.photos.map((photo, index) => (
            <img
              key={index}
              src={`http://localhost:5000${photo}`}
              alt={`${property.title} ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ))}
        </div>
        {/* Videos */}
        <div>
          {property.videos?.map((video, index) => (
            <ReactPlayer
              key={index}
              url={`http://localhost:5000${video}`}
              controls
              width="100%"
              height="200px"
              className="mb-4"
            />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-gray-600">{property.description}</p>
        <p className="text-gray-600 mt-2"><strong>Address:</strong> {property.address}</p>
        <p className="text-gray-600"><strong>Region:</strong> {property.region}</p>
        <p className="text-gray-600"><strong>District:</strong> {property.district}</p>
        <p className="text-gray-600"><strong>Type:</strong> {property.type}</p>
        <p className="text-gray-600">
          <strong>Rent Price:</strong> {property.rentPrice ? `UGX ${property.rentPrice.toLocaleString()}` : 'N/A'}
        </p>
        <p className="text-gray-600">
          <strong>Purchase Price:</strong> {property.purchasePrice ? `UGX ${property.purchasePrice.toLocaleString()}` : 'N/A'}
        </p>
        <p className="text-gray-600"><strong>Status:</strong> {property.status}</p>
        <p className="text-gray-600"><strong>Owner:</strong> {property.owner.name} ({property.owner.email})</p>
      </div>
      <button
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={() => alert('Contact agent to book a viewing')}
      >
        Book Viewing
      </button>
    </div>
  );
};

export default PropertyDetails;