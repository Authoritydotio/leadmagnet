module.exports = (req, res) => {
  res.status(200).json({ bookingUrl: process.env.BOOKING_URL || 'https://authority.io/apply' });
};
