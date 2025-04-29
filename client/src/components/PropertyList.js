import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    type: '',
    maxPrice: '',
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.region) params.append('region', filters.region);
      if (filters.type) params.append('type', filters.type);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      const res = await axios.get(`http://localhost:5000/api/properties?${params}`);
      setProperties(res.data);
    } catch (err) {
      console.error('Fetch Properties Error:', err.response?.data);
      setError(err.response?.data?.msg || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleClearFilters = () => {
    setFilters({ region: '', type: '', maxPrice: '' });
    fetchProperties();
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-4">Available Properties</h2>

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-700">Region</label>
          <input
            type="text"
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., Downtown"
          />
        </div>
        <div>
          <label className="block text-gray-700">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
          >
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Max Rent Price</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
            placeholder="e.g., 1000"
            min="0"
          />
        </div>
        <div className="flex items-end space-x-2">
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>

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
              {property.photos && property.photos.length > 0 && (
                <div className="mt-2">
                  <p>Photos:</p>
                  <div className="flex space-x-2">
                    {property.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000/${photo}`}
                        alt={`Property ${index + 1}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;