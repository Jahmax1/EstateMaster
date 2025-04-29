import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LandlordDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    region: '',
    district: '',
    type: 'house',
    rentPrice: '',
    description: '',
    photos: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch landlord's properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/properties', {
          headers: { 'x-auth-token': token },
        });
        // Filter properties owned by the current user
        const ownedProperties = res.data.filter(
          (property) => property.owner._id === user.id
        );
        setProperties(ownedProperties);
      } catch (err) {
        console.error('Fetch Properties Error:', err.response?.data);
        setError(err.response?.data?.msg || 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProperties();
    }
  }, [user]);

  const handleChange = (e) => {
    if (e.target.name === 'photos') {
      setFormData({ ...formData, photos: e.target.files });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'photos' && formData.photos) {
          Array.from(formData.photos).forEach((photo) => {
            formDataToSend.append('photos', photo);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
      await axios.post('http://localhost:5000/api/properties', formDataToSend, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData({
        region: '',
        district: '',
        type: 'house',
        rentPrice: '',
        description: '',
        photos: null,
      });
      const res = await axios.get('http://localhost:5000/api/properties', {
        headers: { 'x-auth-token': token },
      });
      const ownedProperties = res.data.filter(
        (property) => property.owner._id === user.id
      );
      setProperties(ownedProperties);
      setError('');
    } catch (err) {
      console.error('Add Property Error:', err.response?.data);
      setError(err.response?.data?.msg || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Landlord Dashboard</h2>
      <p>Welcome, {user?.name || 'Landlord'}!</p>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>

      {/* Add Property Form */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Add New Property</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Rent Price</label>
            <input
              type="number"
              name="rentPrice"
              value={formData.rentPrice}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="4"
            />
          </div>
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700">Photos (up to 5)</label>
            <input
              type="file"
              name="photos"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-2 rounded text-white ${
                loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>

      {/* Property List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Properties</h3>
        {loading && <p>Loading properties...</p>}
        {properties.length === 0 && !loading ? (
          <p>No properties added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div
                key={property._id}
                className="p-4 bg-gray-100 rounded-lg shadow"
              >
                <h4 className="text-lg font-semibold">{property.region}, {property.district}</h4>
                <p>Type: {property.type}</p>
                <p>Rent Price: {property.rentPrice ? `$${property.rentPrice}` : 'N/A'}</p>
                <p>{property.description}</p>
                <p>Status: {property.availability}</p>
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
    </div>
  );
};

export default LandlordDashboard;