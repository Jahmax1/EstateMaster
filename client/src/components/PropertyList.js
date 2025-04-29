import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/properties');
        setProperties(res.data);
      } catch (err) {
        console.error('Fetch Properties Error:', err.response?.data);
        setError(err.response?.data?.msg || 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-4">Available Properties</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p>Loading properties...</p>}
      {properties.length === 0 && !loading ? (
        <p>No properties available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div
              key={property._id}
              className="p-4 bg-white rounded-lg shadow-lg"
            >
              <h3 className="text-lg font-semibold">{property.region}, {property.district}</h3>
              <p>Type: {property.type}</p>
              <p>Rent Price: {property.rentPrice ? `$${property.rentPrice}` : 'N/A'}</p>
              <p>Purchase Price: {property.purchasePrice ? `$${property.purchasePrice}` : 'N/A'}</p>
              <p>{property.description}</p>
              <p>Status: {property.availability}</p>
              <p>Owner: {property.owner.name} ({property.owner.email})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;