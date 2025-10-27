"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import FileUpload from "./FileUpload";

const AddSpecialEventModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "competition",
    departments: ["AI-DS"],
    type: "individual",
    maxTeamSize: "",
    mode: "offline",
    img: "",
    venue: "",
    isMultiDay: false,
    date: "",
    startDate: "",
    endDate: "",
    time: "",
    endTime: "",
    expiryDate: "",
    rules: [""],
    prizes: [""],
    studentCoordinators: [{ name: "", phone: "", email: "" }],
    facultyCoordinators: [{ name: "", phone: "", email: "" }],
    competitionPptUrl: "",
    competitionGformLink: "",
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

  const handleDepartmentToggle = (deptId) => {
    setFormData((prev) => {
      const currentDepts = prev.departments || [];
      if (currentDepts.includes(deptId)) {
        return {
          ...prev,
          departments: currentDepts.filter((d) => d !== deptId),
        };
      } else {
        return {
          ...prev,
          departments: [...currentDepts, deptId],
        };
      }
    });
  };

  const addStudentCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      studentCoordinators: [...prev.studentCoordinators, { name: "", phone: "", email: "" }],
    }));
  };

  const updateStudentCoordinator = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      studentCoordinators: prev.studentCoordinators.map((coord, i) =>
        i === index ? { ...coord, [field]: value } : coord
      ),
    }));
  };

  const removeStudentCoordinator = (index) => {
    setFormData((prev) => ({
      ...prev,
      studentCoordinators: prev.studentCoordinators.filter((_, i) => i !== index),
    }));
  };

  const addFacultyCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      facultyCoordinators: [...prev.facultyCoordinators, { name: "", phone: "", email: "" }],
    }));
  };

  const updateFacultyCoordinator = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      facultyCoordinators: prev.facultyCoordinators.map((coord, i) =>
        i === index ? { ...coord, [field]: value } : coord
      ),
    }));
  };

  const removeFacultyCoordinator = (index) => {
    setFormData((prev) => ({
      ...prev,
      facultyCoordinators: prev.facultyCoordinators.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken?.();

      const response = await fetch("/api/special-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          rules: formData.rules.filter((r) => r.trim()),
          prizes: formData.prizes.filter((p) => p.trim()),
          studentCoordinators: (formData.studentCoordinators || []).filter((c) =>
            (c?.name || '').trim() || (c?.phone || '').trim() || (c?.email || '').trim()
          ),
          facultyCoordinators: (formData.facultyCoordinators || []).filter((c) =>
            (c?.name || '').trim() || (c?.phone || '').trim() || (c?.email || '').trim()
          ),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create event");
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
            Add Special Event
          </h3>
          <button
            onClick={onClose}
            className="text-muted-text hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
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

          {/* Category, Departments & Type */}
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

            <div className="md:col-span-2">
              <label className="block text-white font-audiowide text-sm mb-2">
                Departments * (Select multiple)
              </label>
              <div className="bg-background-soft border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "AI-DS", name: "AI-DS" },
                    { id: "AI-ML", name: "AI-ML" },
                    { id: "AGRI", name: "AGRI" },
                    { id: "BIO-MED", name: "BIO-MED" },
                    { id: "CHEM", name: "CHEM" },
                    { id: "CIVIL", name: "CIVIL" },
                    { id: "CSE", name: "CSE" },
                    { id: "CSE-CYB", name: "CSE-CYB" },
                    { id: "CSE-IOT", name: "CSE-IOT" },
                    { id: "IT", name: "IT" },
                    { id: "ECE", name: "ECE" },
                    { id: "EEE", name: "EEE" },
                    { id: "EIE", name: "EIE" },
                    { id: "MECH", name: "MECH" },
                    { id: "MED-ELE", name: "MED-ELE" },
                    { id: "MBA", name: "MBA" },
                    { id: "S&H", name: "S&H" },
                    { id: "COMMON", name: "COMMON" },
                  ].map((dept) => (
                    <label key={dept.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.departments?.includes(dept.id) || false}
                        onChange={() => handleDepartmentToggle(dept.id)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      />
                      <span className="ml-2 text-white font-space text-sm">{dept.id}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.departments?.length === 0 && (
                <p className="text-red-500 text-xs mt-1">Select at least one department</p>
              )}
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
          </div>

          {/* Max Team Size */}
          {formData.type === "team" && (
            <div className="grid md:grid-cols-3 gap-4">
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
            </div>
          )}

          {/* Event Details */}
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

          {/* Multi-day Event Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMultiDay}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isMultiDay: e.target.checked }))
                }
                className="w-4 h-4 text-primary bg-background-soft border-border rounded focus:ring-primary"
              />
              <span className="ml-2 text-white font-space text-sm">
                Multi-day Event
              </span>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {!formData.isMultiDay ? (
              <>
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
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-white font-audiowide text-sm mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-white font-audiowide text-sm mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                Start Time
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-audiowide text-sm mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
              />
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
          </div>

          <ImageUpload
            onImageUpload={(url) => setFormData((prev) => ({ ...prev, img: url }))}
            currentImage={formData.img}
            disabled={loading}
          />

          {/* Competition specific fields */}
          {formData.category === 'competition' && (
            <div className="p-4 border border-dashed border-primary/50 rounded-lg space-y-4">
              <h4 className="font-audiowide text-primary">Competition Fields</h4>
              <div>
                <label className="block text-white font-audiowide text-sm mb-2">
                  Competition PPT/PDF
                </label>
                <FileUpload
                  onFileUpload={(url) => setFormData((prev) => ({ ...prev, competitionPptUrl: url }))}
                  currentFile={formData.competitionPptUrl}
                  disabled={loading}
                  acceptedFormats=".pdf,.ppt,.pptx,.zip"
                  label="Upload Presentation"
                />
                <div className="mt-3">
                  <label className="block text-white font-audiowide text-sm mb-2">
                    Or paste Cloudinary URL
                  </label>
                  <input
                    type="url"
                    name="competitionPptUrl"
                    value={formData.competitionPptUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, competitionPptUrl: e.target.value }))}
                    placeholder="https://res.cloudinary.com/your-cloud/raw/upload/.../file.zip"
                    className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white font-audiowide text-sm mb-2">
                  Registration Google Form Link
                </label>
                <input
                  type="url"
                  name="competitionGformLink"
                  value={formData.competitionGformLink}
                  onChange={handleChange}
                  placeholder="https://forms.gle/example"
                  className="w-full bg-background-soft border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Rules */}
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

          {/* Prizes */}
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

          {/* Student Coordinators */}
          <div>
            <label className="block text-white font-audiowide text-sm mb-2">
              Student Coordinators
            </label>
            {formData.studentCoordinators.map((coordinator, index) => (
              <div key={index} className="mb-4 p-4 bg-background-soft rounded-lg border border-border">
                <div className="grid md:grid-cols-3 gap-3 mb-2">
                  <input
                    type="text"
                    value={coordinator.name}
                    onChange={(e) => updateStudentCoordinator(index, "name", e.target.value)}
                    className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                    placeholder="Name"
                  />
                  <input
                    type="tel"
                    value={coordinator.phone}
                    onChange={(e) => updateStudentCoordinator(index, "phone", e.target.value)}
                    className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                    placeholder="Phone"
                  />
                  <input
                    type="email"
                    value={coordinator.email}
                    onChange={(e) => updateStudentCoordinator(index, "email", e.target.value)}
                    className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                    placeholder="Email"
                  />
                </div>
                {formData.studentCoordinators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStudentCoordinator(index)}
                    className="text-red-500 hover:text-red-400 text-sm font-space"
                  >
                    Remove Coordinator
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addStudentCoordinator}
              className="text-primary hover:text-hover-primary text-sm font-space"
            >
              + Add Student Coordinator
            </button>
          </div>

          {/* Faculty Coordinators */}
          <div>
            <label className="block text-white font-audiowide text-sm mb-2">
              Faculty Coordinators
            </label>
            {formData.facultyCoordinators.map((coordinator, index) => (
              <div key={index} className="mb-4 p-4 bg-background-soft rounded-lg border border-border">
                <div className="grid md:grid-cols-3 gap-3 mb-2">
                  <input
                    type="text"
                    value={coordinator.name}
                    onChange={(e) => updateFacultyCoordinator(index, "name", e.target.value)}
                    className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                    placeholder="Name"
                  />
                  <input
                    type="tel"
                    value={coordinator.phone}
                    onChange={(e) => updateFacultyCoordinator(index, "phone", e.target.value)}
                    className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                    placeholder="Phone"
                  />
                  <input
                    type="email"
                    value={coordinator.email}
                    onChange={(e) => updateFacultyCoordinator(index, "email", e.target.value)}
                    className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg font-space focus:outline-none focus:border-primary"
                    placeholder="Email"
                  />
                </div>
                {formData.facultyCoordinators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFacultyCoordinator(index)}
                    className="text-red-500 hover:text-red-400 text-sm font-space"
                  >
                    Remove Coordinator
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFacultyCoordinator}
              className="text-primary hover:text-hover-primary text-sm font-space"
            >
              + Add Faculty Coordinator
            </button>
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
              {loading ? "Creating..." : "Create Event"}
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

export default AddSpecialEventModal;