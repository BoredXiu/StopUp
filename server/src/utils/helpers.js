const { v4: uuidv4 } = require('uuid');

function generateOrderNo() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase();
  return `SP${dateStr}${random}`;
}

function generatePaymentNo() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-10);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PAY${timestamp}${random}`;
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

function isValidDate(dateStr) {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

module.exports = {
  generateOrderNo,
  generatePaymentNo,
  maskPhone,
  isValidDate,
};