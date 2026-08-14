from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

# Load model
model = tf.keras.models.load_model("leaf_model.h5")

# IMPORTANT:
# This MUST match train_ds.class_names from training.
class_names = ['Early_blight', 'Late_blight', 'healthy']

# Treatment database
treatments = {
    "healthy": "No disease detected. Continue proper watering, fertilization, and monitoring.",

    "Early_blight": "Remove infected leaves and apply a recommended fungicide. Avoid overhead watering.",

    "Late_blight": "Remove infected plant parts immediately. Apply copper-based fungicide and improve air circulation."
}


@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Check image
        if "image" not in request.files:
            return jsonify({
                "error": "No image uploaded"
            }), 400

        file = request.files["image"]

        # Open image
        img = Image.open(file).convert("RGB")

        # Resize to model input size
        img = img.resize((224, 224))

        # Convert to numpy
        img_array = np.array(img, dtype=np.float32)

        # DO NOT divide by 255 here!
        # The model already contains Rescaling(1./255)

        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        prediction = model.predict(
            img_array,
            verbose=0
        )

        # Get probabilities
        probabilities = prediction[0]

        # Get predicted class
        predicted_index = int(np.argmax(probabilities))

        predicted_class = class_names[predicted_index]

        confidence = float(
            probabilities[predicted_index] * 100
        )

        # Debug information
        print("\n========== DEBUG ==========")

        print("Probabilities:")

        for class_name, probability in zip(
            class_names,
            probabilities
        ):
            print(
                f"{class_name}: {probability * 100:.2f}%"
            )

        print("Predicted index:", predicted_index)
        print("Predicted class:", predicted_class)
        print("Confidence:", confidence)

        print("===========================\n")

        return jsonify({
            "disease": predicted_class,
            "confidence": round(confidence, 2),
            "treatment": treatments[predicted_class]
        })

    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        debug=True
    )