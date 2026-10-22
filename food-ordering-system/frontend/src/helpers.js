export const CATEGORIES = ['Pizza', 'Burgers', 'Biryani', 'Snacks', 'Drinks'];
export const MAX_QTY = 10;

export function rupees(amount) {
  const n = Number(amount);
  return '₹' + (Number.isInteger(n) ? n : n.toFixed(2));
}

export function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// Last 6 characters of the MongoDB id, for tables
export function shortId(id) {
  return '#' + String(id).slice(-6).toUpperCase();
}

// Same phone rules as the backend (10 digit Indian mobile number)
export function cleanPhone(raw) {
  let phone = String(raw || '').replace(/[\s-]/g, '');
  if (phone.startsWith('+91')) phone = phone.slice(3);
  else if (phone.startsWith('91') && phone.length === 12) phone = phone.slice(2);
  else if (phone.startsWith('0') && phone.length === 11) phone = phone.slice(1);
  return phone;
}
