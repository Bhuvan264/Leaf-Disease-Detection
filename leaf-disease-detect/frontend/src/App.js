import React, { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState({
    disease: "",
    confidence: 0,
    treatment: "",
  });
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult({
        disease: "",
        confidence: 0,
        treatment: "",
      });
    }
  };

  const detectDisease = async () => {
    if (!image) {
      alert("Upload a leaf image first");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch(
        "http://localhost:5000/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setResult({
        disease: data.disease,
        confidence: data.confidence,
        treatment: data.treatment,
      });
    } catch (error) {
      console.error(error);

      alert("Prediction failed");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <div style={styles.card}>
          <h1 style={styles.heading}>
            🌿 Leaf Disease Detection System
          </h1>

          <p style={styles.subHeading}>
            Upload a plant leaf image and detect diseases instantly.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={styles.input}
          />

          {preview && (
            <img
              src={preview}
              alt="leaf"
              style={styles.preview}
            />
          )}

          <button
            onClick={detectDisease}
            style={styles.button}
          >
            Detect Disease
          </button>

          {loading && (
            <p style={{ marginTop: 20 }}>
              Analyzing Image...
            </p>
          )}

          {result.disease && (
            <div style={styles.resultBox}>
              <h2>Detected Disease</h2>

              <p>
                <strong>{result.disease}</strong>
              </p>

              <p>
                Confidence: {result.confidence}%
              </p>

              <div style={styles.progress}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${result.confidence}%`,
                  }}
                />
              </div>

              <h3>Treatment</h3>
              <p>{result.treatment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  overlay: {
    minHeight: "100vh",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  card: {
    width: "700px",
    maxWidth: "95%",
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    color: "white",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  },

  heading: {
    fontSize: "36px",
    marginBottom: "10px",
  },

  subHeading: {
    marginBottom: "20px",
    color: "#f1f1f1",
  },

  input: {
    marginBottom: "20px",
  },

  preview: {
    width: "100%",
    maxHeight: "350px",
    objectFit: "contain",
    borderRadius: "15px",
    marginBottom: "20px",
  },

  button: {
    background: "#2e7d32",
    color: "white",
    border: "none",
    padding: "12px 30px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
  },

  resultBox: {
    marginTop: "25px",
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "15px",
  },

  progress: {
    width: "100%",
    height: "15px",
    background: "#ddd",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "10px",
    marginBottom: "20px",
  },

  progressFill: {
    height: "100%",
    background: "#4caf50",
  },
};