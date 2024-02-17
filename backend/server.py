from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Importing deps for image prediction
from tensorflow.keras.preprocessing import image
from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model
from werkzeug.utils import secure_filename

from model1 import predict_caption, initialize

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def model1(img_path):
    model, feature, tokenizer, max_length = initialize(img_path)
    caption = predict_caption(model, feature, tokenizer, max_length)
    return caption

@app.route("/")
def home():
    return jsonify({"status": "Connected to the server"})

@app.route("/upload", methods=['POST'])
def upload():
    if 'file' not in request.files:
        return 'No file part', 400
    
    # Create the uploads directory if it doesn't exist
    if not os.path.exists('uploads/'):
        os.makedirs('uploads/')

    file = request.files['file']

    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    if file.filename == '':
        return 'No selected file', 400

    if file and allowed_file(file.filename):
        # Write the filename to a text file
        file.save('uploads/' + file.filename)
        img_path = f"./uploads/{file.filename}"
        # caption = model1(img_path)


         # Convert the image to a base64 string
        with open(img_path, "rb") as img_file:
            img_base64 = base64.b64encode(img_file.read()).decode('utf-8')

        # filename = secure_filename(file.filename)
        # save_path = os.path.join(os.path.expanduser('~'), 'Desktop')
        # os.makedirs(save_path, exist_ok=True)
        # file.save(os.path.join(save_path, filename))sudo ubuntu-drivers autoinstall
        return jsonify({"image": img_base64})

    

    


if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
