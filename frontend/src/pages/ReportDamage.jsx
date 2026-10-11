import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ReportDamage.css";

const API_URL = "http://localhost:5000/api/reports";

const DEFAULT_LOCATION = { lat: 17.9133, lng: 77.5301 };
const DAMAGE_TYPES = [
  "Pothole",
  "Road Crack",
  "Broken Road",
  "Debris",
  "Waterlogging",
  "Other",
];
const SEVERITY_OPTIONS = ["Low", "Medium", "Critical"];
const ROAD_TYPES = [
  "National Highway",
  "State Highway",
  "City Road",
  "Rural Road",
  "Other",
];

// Configure Leaflet's default marker icons for Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

// Accept a 10-digit Indian mobile number, optionally prefixed with 91 or +91.
function normalizeIndianMobile(value) {
  const digits = value.replace(/\D/g, "");
  const mobile = digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits;

  return /^[6-9]\d{9}$/.test(mobile) ? mobile : null;
}

export default function ReportDamage() {
  const [citizen, setCitizen] = useState(null);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");

  const [damageType, setDamageType] = useState("Pothole");
  const [severity, setSeverity] = useState("Medium");
  const [roadType, setRoadType] = useState("City Road");
  const [roadName, setRoadName] = useState("");

  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("citizenToken");
      const savedUser = localStorage.getItem("citizenData");

      if (token && savedUser) {
        const user = JSON.parse(savedUser);
        setCitizen(user);
        setReporterName(user.name || "");
        setReporterPhone(user.phone || "");
        setReporterEmail(user.email || "");
      }
    } catch {
      setCitizen(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function showMessage(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    setMessage("");
    setMessageType("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      showMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
        showMessage("Current location captured successfully.", "success");
      },
      (error) => {
        const errors = {
          1: "Location permission denied. Allow location access in your browser.",
          2: "Your current location could not be determined.",
          3: "Location request timed out. Please try again.",
        };
        showMessage(
          errors[error.code] ||
            "Unable to get your location. Please choose a point on the map."
        );
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function handleMapLocationSelect(newLocation) {
    setLocation(newLocation);
    showMessage("Map location selected.", "success");
  }

  async function submitReport(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!reporterName.trim()) {
      showMessage("Please enter the reporter's full name.");
      return;
    }

    const normalizedPhone = normalizeIndianMobile(reporterPhone);
    if (!normalizedPhone) {
      showMessage(
        "Enter a valid 10-digit Indian mobile number, with or without +91."
      );
      return;
    }

    if (
      reporterEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())
    ) {
      showMessage("Please enter a valid email address.");
      return;
    }

    if (!image) {
      showMessage("Please upload a road damage photo.");
      return;
    }

    if (
      !Number.isFinite(location.lat) ||
      !Number.isFinite(location.lng) ||
      location.lat < -90 || location.lat > 90 ||
      location.lng < -180 || location.lng > 180
    ) {
      showMessage("Please select a valid road location.");
      return;
    }

    const formData = new FormData();
    formData.append("reporterName", reporterName.trim());
    formData.append("reporterPhone", normalizedPhone);
    formData.append("reporterEmail", reporterEmail.trim());
    formData.append("damageType", damageType);
    formData.append("severity", severity);
    formData.append("roadType", roadType);
    formData.append("roadName", roadName.trim() || "Unknown");
    formData.append("latitude", String(location.lat));
    formData.append("longitude", String(location.lng));
    formData.append("image", image);

    try {
      setSubmitting(true);
      const token = localStorage.getItem("citizenToken");
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const response = await axios.post(API_URL, formData, {
        headers,
        timeout: 60000,
      });

      showMessage(
        response.data?.message || "Road damage report submitted successfully!",
        "success"
      );

      setDamageType("Pothole");
      setSeverity("Medium");
      setRoadType("City Road");
      setRoadName("");
      setImage(null);
      setImagePreview("");

      if (!citizen) {
        setReporterName("");
        setReporterPhone("");
        setReporterEmail("");
      }

      const fileInput = document.getElementById("damage-image");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(
        "Report submission error:",
        error.response?.data || error.message
      );
      showMessage(
        error.response?.data?.message ||
          "Failed to submit report. Check your backend connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function removeImage() {
    setImage(null);
    setImagePreview("");
    const input = document.getElementById("damage-image");
    if (input) input.value = "";
  }

  return (
    <main className="report-page">
      <section className="report-header">
        <span className="report-eyebrow">ROADGUARD / CITIZEN PORTAL</span>
        <h1>Report Road Damage</h1>
        <p>
          Help make roads safer. Submit a photo and location so the responsible
          authorities can investigate the issue.
        </p>
      </section>

      <form className="report-form" onSubmit={submitReport}>
        <section className="report-section">
          <div className="section-heading">
            <span className="section-number">01</span>
            <div>
              <h2>Reporter Details</h2>
              <p>Provide contact information for report verification.</p>
            </div>
          </div>

          <div className="report-fields">
            <label className="report-field">
              Full Name <span className="required">*</span>
              <input
                type="text"
                value={reporterName}
                onChange={(event) => setReporterName(event.target.value)}
                placeholder="Enter your full name"
                maxLength={100}
                autoComplete="name"
                required
              />
            </label>

            <label className="report-field">
              Mobile Number <span className="required">*</span>
              <input
                type="tel"
                value={reporterPhone}
                onChange={(event) => setReporterPhone(event.target.value)}
                placeholder="9876543210 or +919876543210"
                maxLength={16}
                autoComplete="tel"
                required
              />
            </label>

            <label className="report-field full-width">
              Email Address <span className="optional">(optional)</span>
              <input
                type="email"
                value={reporterEmail}
                onChange={(event) => setReporterEmail(event.target.value)}
                placeholder="you@example.com"
                maxLength={150}
                autoComplete="email"
              />
            </label>
          </div>

          <p className="report-note">
            {citizen
              ? "You are signed in. Your account details have been filled in; you can update the contact details for this report."
              : "You can report without creating an account. Your name and mobile number are required so the admin can identify the reporter."}
          </p>
        </section>

        <section className="report-section">
          <div className="section-heading">
            <span className="section-number">02</span>
            <div>
              <h2>Damage Details</h2>
              <p>Describe the road issue you noticed.</p>
            </div>
          </div>

          <div className="report-fields">
            <label className="report-field">
              Damage Type <span className="required">*</span>
              <select value={damageType} onChange={(event) => setDamageType(event.target.value)} required>
                {DAMAGE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label className="report-field">
              Severity <span className="required">*</span>
              <select value={severity} onChange={(event) => setSeverity(event.target.value)} required>
                {SEVERITY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            <label className="report-field">
              Road Type <span className="required">*</span>
              <select value={roadType} onChange={(event) => setRoadType(event.target.value)} required>
                {ROAD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label className="report-field">
              Road Name
              <input
                type="text"
                value={roadName}
                onChange={(event) => setRoadName(event.target.value)}
                placeholder="Road or area name (if known)"
                maxLength={200}
              />
            </label>
          </div>
        </section>

        <section className="report-section">
          <div className="section-heading">
            <span className="section-number">03</span>
            <div>
              <h2>Damage Location</h2>
              <p>Use GPS or click directly on the map.</p>
            </div>
          </div>

          <div className="location-actions">
            <button
              type="button"
              className="location-button"
              onClick={getCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? "Getting location..." : "◎ Get My Location"}
            </button>
            <span className="map-instruction">
              Or click a point on the map to select the location.
            </span>
          </div>

          <div className="report-map">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={14}
              scrollWheelZoom
              className="report-leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapLocationSelect} />
              <Marker position={[location.lat, location.lng]} />
            </MapContainer>
          </div>

          <div className="coordinates">
            <span><strong>Latitude:</strong> {location.lat.toFixed(6)}</span>
            <span><strong>Longitude:</strong> {location.lng.toFixed(6)}</span>
          </div>
        </section>

        <section className="report-section">
          <div className="section-heading">
            <span className="section-number">04</span>
            <div>
              <h2>Photo Evidence</h2>
              <p>Upload a clear photo of the damaged road.</p>
            </div>
          </div>

          <label className="report-field">
            Road Damage Image <span className="required">*</span>
            <input
              id="damage-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!image}
            />
            <span className="input-hint">Supported image formats. Maximum file size: 5 MB.</span>
          </label>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Selected road damage preview" />
              <div className="image-preview-info">
                <strong>{image?.name}</strong>
                <span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : ""}</span>
                <button type="button" className="remove-image" onClick={removeImage}>
                  Remove image
                </button>
              </div>
            </div>
          )}
        </section>

        {message && (
          <div className={`report-message ${messageType}`} role="status" aria-live="polite">
            {message}
          </div>
        )}

        <button type="submit" className="submit-report-button" disabled={submitting}>
          {submitting ? "Submitting Report..." : "Submit Road Damage Report"}
        </button>
        <p className="submit-disclaimer">
          Please ensure the image and location are accurate before submitting.
        </p>
      </form>
    </main>
  );
}
