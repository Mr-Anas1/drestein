"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

const EditSpecialEventModal = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    price: event.price || "",
    category: event.category || "competition",
    type: event.type || "individual",
    maxTeamSize: event.maxTeamSize || "",
    mode: event.mode || "offline",
    img: event.img || "",
    venue: event.venue || "",
    date: event.date || "",
    time: event.time || "",
    expiryDate: event.expiryDate || "",
    rules: event.rules || [""],
    prizes: event.prizes || [""],
    contactEmail: event.contactEmail || "",
    contactPhone: event.contactPhone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken?.();

      const response = await fetch(`/api/special-events?id=${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          rules: formData.rules.filter((r) => r.trim()),
          prizes: formData.prizes.filter((p) => p.trim()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update event");
      }

      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-audiowide text-2xl text-white">
            Edit Special Event
          </h3>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Same form fields as Add modal */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-audiowide text-sm mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              >
                <option value="competition">Competition</option>
                <option value="workshop">Workshop</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              >
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </select>
            </div>

            {formData.type === "team" && (
              <div>
                <label className="block text-white font-audiowide text-sm mb-2">
                  Max Team Size
                </label>
                <input
                  type="number"
                  name="maxTeamSize"
                  value={formData.maxTeamSize}
                  onChange={handleChange}
                  min="2"
                  className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Mode
              </label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-audiowide text-sm mb-2">
              Registration Expiry
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-white font-audiowide text-sm mb-2">
              Image URL
            </label>
            <input
              type="text"
              name="img"
              value={formData.img}
              onChange={handleChange}
              className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-white font-audiowide text-sm mb-2">
              Rules
            </label>
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) =>
                    handleArrayChange("rules", index, e.target.value)
                  }
                  className="flex-1 bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("rules", index)}
                  className="text-red-500 hover:text-red-400 px-3"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("rules")}
              className="text-primary hover:text-hover-primary text-sm font-space"
            >
              + Add Rule
            </button>
          </div>

          <div>
            <label className="block text-white font-audiowide text-sm mb-2">
              Prizes
            </label>
            {formData.prizes.map((prize, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={prize}
                  onChange={(e) =>
                    handleArrayChange("prizes", index, e.target.value)
                  }
                  className="flex-1 bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("prizes", index)}
                  className="text-red-500 hover:text-red-400 px-3"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("prizes")}
              className="text-primary hover:text-hover-primary text-sm font-space"
            >
              + Add Prize
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary disabled:opacity-50 transition-all"
            >
              {loading ? "Updating..." : "Update Event"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-background-soft border border-border text-white px-6 py-3 rounded-lg font-audiowide hover:bg-background transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSpecialEventModal;
