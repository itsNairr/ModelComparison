from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time

from LTSM.model1 import predict_caption, initialize, initializeImg
from GRU.model2 import ImageCaptioner

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

caption = {}
models = None
# Load the model1
model, tokenizer, max_length, vgg_model = initialize()
# Load the model2
captioner = ImageCaptioner('./GRU/best_model.h5')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def model1(img_path):
    start_time = time.time()
    feature = initializeImg(img_path, vgg_model)
    caption = predict_caption(model, feature, tokenizer, max_length)
    elaspsed_time = time.time() - start_time
    caption = ' '.join(caption.split()[1:-1])
    caption = caption.capitalize() + '.'
    return caption, elaspsed_time

def model2(img_path):
    caption = captioner.caption(img_path, display=False)
    caption = caption.capitalize() + '.'
    return caption

@app.route("/")
def home():
    return jsonify({"status": "Connected"})

@app.route("/model", methods=['POST'])
def model():
    global models
    models = request.get_json()
    print(models)
    return jsonify({'message': 'Models Loaded'}), 200
    

@app.route("/upload", methods=['POST'])
def upload():
    global models
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
        img_path = 'uploads/' + file.filename
        file.save(img_path)
        global caption
        for model in models:
            if model == '1':
                caption1, et1 = model1(img_path)
                response = {"caption1": caption1, "elapsed_time1": et1}
                caption.update(response)
            if model == '2':
                caption2 = model2(img_path)
                response = {"caption2": caption2}
                caption.update(response)

        # Remove the image after captioning
        os.remove(img_path)
        return  jsonify(caption), 200

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
