import express from 'express';
import db from '../connection.js';

const router = express.Router();

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

router.post('/api/search', async (req, res) => {
  const { search, location } = req.body;
  const { latitude, longitude } = location;

  try {
    const result = await db.query(
      `SELECT sp.id, sp.name, sp.email, pd.location, pd.latitude, pd.longitude, pd.category
       FROM service_providers sp
       JOIN provider_details pd ON sp.id = pd.provider_id
       WHERE sp.name ILIKE $1 OR pd.category ILIKE $1
       OR SIMILARITY(sp.name, $2) > 0.3 OR SIMILARITY(pd.category, $2) > 0.3`,
      [`%${search}%`, search]
    );

    // Calculate distances for all services
    const servicesWithDistance = result.rows.map((service) => {
      const distance = calculateDistance(latitude, longitude, service.latitude, service.longitude);
      return { ...service, distance };
    });

    // Separate relevant and irrelevant services
    const relevantServices = servicesWithDistance.filter(service =>
      service.category.toLowerCase().includes(search.toLowerCase())
    );

    const irrelevantServices = servicesWithDistance.filter(service =>
      !service.category.toLowerCase().includes(search.toLowerCase())
    );

    // Sort relevant services by distance
    relevantServices.sort((a, b) => a.distance - b.distance);

    // Sort irrelevant services by distance
    irrelevantServices.sort((a, b) => a.distance - b.distance);

    // Combine relevant and irrelevant services
    const sortedServices = [...relevantServices, ...irrelevantServices];

    res.json({
      success: true,
      services: sortedServices
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Error fetching services' });
  }
});

export default router;