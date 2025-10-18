"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DEPARTMENTS, getDepartmentName } from "@/constants/departments";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Minus } from "lucide-react";

export default function AddEventModal({ onClose, onEventAdded }) {
  const { isDepartmentAdmin, userDepartment } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    img: "",
    requiresPass: true, // Events require pass by default
    date: "",
    time: "",
    venue: "",
    expiryDate: "",
    category: "Technical",
    department: isDepartmentAdmin ? userDepartment : "",
    rules: [""],
    prizes: ["", "", ""],
    studentCoordinators: [{ name: "", phone: "", email: "" }],
    facultyCoordinators: [{ name: "", phone: "", email: "" }],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rules: formData.rules.filter((rule) => rule.trim() !== ""),
          prizes: formData.prizes.filter((prize) => prize.trim() !== ""),
        }),
      });

      if (response.ok) {
        onEventAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error adding event:", error);
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, ""],
    }));
  };

  const updateRule = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) => (i === index ? value : rule)),
    }));
  };

  const removeRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-background border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h3 className="font-audiowide text-xl text-white mb-6">
          Add New Event
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-audiowide text-muted-text mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-audiowide text-muted-text mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
              required
              disabled={isDepartmentAdmin}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {isDepartmentAdmin && (
              <p className="text-xs text-muted-text mt-1">
                You can only create events for your department:{" "}
                {getDepartmentName(userDepartment)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">
              Short Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">
              Full Description
            </label>
            <textarea
              required
              value={formData.fullDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fullDescription: e.target.value,
                }))
              }
              className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none h-32"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-audiowide text-muted-text mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.requiresPass}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requiresPass: e.target.checked,
                      }))
                    }
                  />
                  <div
                    className={`block w-14 h-8 rounded-full ${
                      formData.requiresPass
                        ? "bg-primary"
                        : "bg-background-soft border border-border"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${
                      formData.requiresPass ? "translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-white font-space text-sm">
                  Requires Event Pass
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-audiowide text-muted-text mb-2">
                Time
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-audiowide text-muted-text mb-2">
                Registration Expiry
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiryDate: e.target.value,
                  }))
                }
                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-audiowide text-muted-text mb-2">
                Venue
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, venue: e.target.value }))
                }
                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            {/* <label className="block text-sm font-audiowide text-muted-text mb-2">Event Image</label> */}
            <ImageUpload
              currentImage={formData.img}
              onImageUpload={(url) =>
                setFormData((prev) => ({ ...prev, img: url }))
              }
              disabled={loading}
            />
          </div>

          {/* Pass Requirement Info */}
          {formData.requiresPass && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-white font-space">
                <strong className="font-audiowide">Event Pass Required:</strong>{" "}
                Students will need to purchase an event pass to register for
                this event. Workshops are free and don't require a pass.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">
              Rules
            </label>
            {formData.rules.map((rule, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  className="flex-1 bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                  placeholder={`Rule ${index + 1}`}
                />
                {formData.rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRule}
              className="text-primary hover:text-primary-dark transition-colors font-space text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Rule
            </button>
          </div>

          <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">
              Prizes
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["1st Prize", "2nd Prize", "3rd Prize"].map((label, index) => (
                <div key={index}>
                  <label className="block text-xs text-muted-text mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={formData.prizes[index]}
                    onChange={(e) => {
                      const newPrizes = [...formData.prizes];
                      newPrizes[index] = e.target.value;
                      setFormData((prev) => ({ ...prev, prizes: newPrizes }));
                    }}
                    className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                    placeholder={index === 0 ? "Required" : "Optional"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">
              Student Coordinators
            </label>
            {formData.studentCoordinators.map((coordinator, index) => (
              <div key={index} className="mb-4 p-4 bg-background-soft rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <input
                    type="text"
                    required
                    value={coordinator.name}
                    onChange={(e) => updateStudentCoordinator(index, "name", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                    placeholder="Name"
                  />
                  <input
                    type="tel"
                    required
                    value={coordinator.phone}
                    onChange={(e) => updateStudentCoordinator(index, "phone", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                    placeholder="Phone"
                  />
                  <input
                    type="email"
                    value={coordinator.email}
                    onChange={(e) => updateStudentCoordinator(index, "email", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                    placeholder="Email"
                  />
                </div>
                {formData.studentCoordinators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStudentCoordinator(index)}
                    className="text-red-400 hover:text-red-300 transition-colors font-space text-sm flex items-center gap-1"
                  >
                    <Minus size={16} />
                    Remove Coordinator
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addStudentCoordinator}
              className="text-primary hover:text-primary-dark transition-colors font-space text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Student Coordinator
            </button>
          </div>

          <div>
            <label className="block text-sm font-audiowide text-muted-text mb-2">
              Faculty Coordinators
            </label>
            {formData.facultyCoordinators.map((coordinator, index) => (
              <div key={index} className="mb-4 p-4 bg-background-soft rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                  <input
                    type="text"
                    required
                    value={coordinator.name}
                    onChange={(e) => updateFacultyCoordinator(index, "name", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                    placeholder="Name"
                  />
                  <input
                    type="tel"
                    required
                    value={coordinator.phone}
                    onChange={(e) => updateFacultyCoordinator(index, "phone", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                    placeholder="Phone"
                  />
                  <input
                    type="email"
                    value={coordinator.email}
                    onChange={(e) => updateFacultyCoordinator(index, "email", e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                    placeholder="Email"
                  />
                </div>
                {formData.facultyCoordinators.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFacultyCoordinator(index)}
                    className="text-red-400 hover:text-red-300 transition-colors font-space text-sm flex items-center gap-1"
                  >
                    <Minus size={16} />
                    Remove Coordinator
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFacultyCoordinator}
              className="text-primary hover:text-primary-dark transition-colors font-space text-sm flex items-center gap-1"
            >
              <Plus size={16} />
              Add Faculty Coordinator
            </button>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg font-audiowide hover:from-hover-primary hover:to-primary transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Event"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-background-soft border border-border text-white px-6 py-2 rounded-lg font-audiowide hover:bg-background transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
