import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { CATEGORIES, rupees } from '../helpers.js';
import FoodImage from './FoodImage.jsx';

const emptyForm = { name: '', description: '', category: 'Pizza', price: '', image: '', available: true };

function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadFoods() {
    try {
      const data = await api('/api/admin/foods');
      setFoods(data.foods);
      setPageError('');
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFoods();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function validate() {
    if (form.name.trim().length < 2) return 'Food name must be at least 2 characters.';
    if (!form.description.trim()) return 'Description is required.';
    if (form.description.trim().length > 200) return 'Description must be 200 characters or less.';
    if (!form.price || Number(form.price) <= 0) return 'Price must be a number greater than 0.';
    if (form.image.trim() && !/^(https?:\/\/|\/)/i.test(form.image.trim())) {
      return 'Image URL must start with http:// or https://';
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price) };
      if (editingId) {
        await api(`/api/admin/foods/${editingId}`, { method: 'PUT', body });
        setMessage('Food item updated.');
      } else {
        await api('/api/admin/foods', { method: 'POST', body });
        setMessage('Food item added.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadFoods();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(food) {
    setEditingId(food._id);
    setForm({
      name: food.name,
      description: food.description,
      category: food.category,
      price: String(food.price),
      image: food.image || '',
      available: food.available
    });
    setMessage('');
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  }

  async function handleDelete(food) {
    if (!window.confirm(`Delete "${food.name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/foods/${food._id}`, { method: 'DELETE' });
      setMessage('Food item deleted.');
      if (editingId === food._id) cancelEdit();
      await loadFoods();
    } catch (err) {
      setPageError(err.message);
    }
  }

  async function toggleAvailability(food) {
    try {
      await api(`/api/admin/foods/${food._id}/availability`, {
        method: 'PATCH',
        body: { available: !food.available }
      });
      await loadFoods();
    } catch (err) {
      setPageError(err.message);
    }
  }

  return (
    <div>
      <form className="form-box wide" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Food Item' : 'Add Food Item'}</h3>
        {formError && <p className="error-box">{formError}</p>}
        {message && <p className="success-box">{message}</p>}

        <label>Food name</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} />

        <label>Description</label>
        <textarea name="description" rows="2" value={form.description} onChange={handleChange}></textarea>

        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Price (₹)</label>
        <input type="number" name="price" min="1" step="0.01" value={form.price} onChange={handleChange} />

        <label>Image URL</label>
        <input type="text" name="image" placeholder="https://..." value={form.image} onChange={handleChange} />

        <label className="checkbox-label">
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
          Available for customers
        </label>

        <div className="button-row">
          <button className="btn" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Food'}
          </button>
          {editingId && <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <h3 className="section-title">All Food Items</h3>
      {pageError && <p className="error-box">{pageError}</p>}
      {loading && <p className="message">Loading food items...</p>}
      {!loading && foods.length === 0 && <p className="message">No food items yet. Add your first one above.</p>}

      {foods.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food._id}>
                  <td><FoodImage src={food.image} alt={food.name} className="cart-image" /></td>
                  <td>
                    <strong>{food.name}</strong>
                    <div className="small-text">{food.description}</div>
                  </td>
                  <td>{food.category}</td>
                  <td>{rupees(food.price)}</td>
                  <td>
                    <span className={food.available ? 'badge badge-green' : 'badge badge-red'}>
                      {food.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-small" onClick={() => startEdit(food)}>Edit</button>
                      <button className="btn btn-small btn-outline" onClick={() => toggleAvailability(food)}>
                        {food.available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => handleDelete(food)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminFoods;
