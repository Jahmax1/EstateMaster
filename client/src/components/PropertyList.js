import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    type: '',
    maxPrice: '10000', // Default to higher value
  });
  const [mapCenter, setMapCenter] = useState([0.3476, 32.5825]); // Kampala default [lat, lng]
  const navigate = useNavigate();

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    minHeight: '400px',
    zIndex: 1,
  };

  const fetchProperties = async () => {
    console.log('Fetching properties with filters:', filters, 'Map center:', mapCenter);
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.region.trim()) params.append('region', filters.region.trim());
      if (filters.type) params.append('type', filters.type);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (mapCenter[0] && mapCenter[1]) {
        params.append('lat', mapCenter[0]);
        params.append('lng', mapCenter[1]);
        params.append('radius', 10); // 10km
      }
      const url = `http://localhost:5000/api/properties?${params.toString()}`;
      console.log('Request URL:', url);
      const res = await axios.get(url);
      console.log('Fetch Properties Response:', res.data);
      setProperties(res.data);
    } catch (err) {
      console.error('Fetch Properties Error:', err.message, err.response?.data, err.response?.status);
      setError(err.response?.data?.msg || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with filters:', filters, 'Map center:', mapCenter);
    fetchProperties();
  }, [filters, mapCenter]);

  const handleFilterChange = (e) => {
    console.log('Filter changed:', e.target.name, e.target.value);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    console.log('Filter form submitted with:', filters);
    fetchProperties();
  };

  const handleClearFilters = () => {
    console.log('Clearing filters');
    setFilters({ region: '', type: '', maxPrice: '10000' });
    setMapCenter([0.3476, 32.5825]);
  };

  // Component to handle map click events
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        console.log('Map clicked at:', e.latlng);
        setMapCenter([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Properties</h2>

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-700">Region</label>
          <input
            type="text"
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Kololo"
          />
        </div>
        <div>
          <label className="block text-gray-700">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-gray-700">Max Rent Price (UGX)</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1200"
            min="0"
          />
        </div>
        <div className="flex items-end space-x-2">
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Map */}
      <div className="mb-6 google-map-container">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={mapContainerStyle}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents />
          {properties.map((property) => (
            property.location?.coordinates && (
              <Marker
                key={property._id}
                position={[property.location.coordinates[1], property.location.coordinates[0]]}
              >
                <Popup>
                  <div>
                    <h3>{property.title}</h3>
                    <p>{property.region}, {property.district}</p>
                    <button
                      onClick={() => navigate(`/properties/${property._id}`)}
                      className="text-blue-500 hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Properties */}
      {loading && <p className="mt-4">Loading properties...</p>}
      {properties.length === 0 && !loading ? (
        <p className="mt-4">No properties available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {properties.map((property) => (
            <div
              key={property._id}
              className="p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => navigate(`/properties/${property._id}`)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{property.region}, {property.district}</h3>
              <p className="text-gray-600">Type: {property.type}</p>
              <p className="text-gray-600">
                Rent Price: {property.rentPrice ? `UGX ${property.rentPrice.toLocaleString()}` : 'N/A'}
              </p>
              <p className="text-gray-600">
                Purchase Price: {property.purchasePrice ? `UGX ${property.purchasePrice.toLocaleString()}` : 'N/A'}
              </p>
              <p className="text-gray-600">{property.description}</p>
              <p className="text-gray-600">Status: {property.status}</p>
              <p className="text-gray-600">Owner: {property.owner.name} ({property.owner.email})</p>
              {property.photos && property.photos.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-700">Photos:</p>
                  <div className="flex space-x-2">
                    {property.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${photo}`}
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