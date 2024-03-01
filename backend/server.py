from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time

from model_class import process_image, CaptioningModel
from tensorflow.keras.applications.vgg16 import VGG16
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.text import tokenizer_from_json
import json

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

caption = {}
models = None
vgg_model = VGG16()
vgg_model = Model(inputs=vgg_model.inputs, outputs=vgg_model.layers[-2].output)
tokenizer = tokenizer_from_json(json.load(open('resources/tokenizer.json')))


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def Caption(processed, name, i):
    start_time = time.time()
    captioner = CaptioningModel(f'{name.lower()}_models/{name}_epoch{epochs[i]}.h5', tokenizer)
    caption = captioner.predict_caption(processed)
    elaspsed_time = time.time() - start_time
    caption += '.'
    caption = caption.capitalize()
    return caption, elaspsed_time

@app.route("/")
def home():
    return jsonify({"status": "Connected"})

@app.route("/model", methods=['POST'])
def model():
    global models, epochs
    data = request.get_json()
    models = data.get('models')
    epochs = data.get('epochs')
    print(models)
    print(epochs[0])
    return jsonify({'message': 'Models and epochs Loaded'}), 200
    

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
        processed = process_image(img_path, vgg_model)
        print("Initialization complete")
        global caption
        for model in models:
            if model == 'LSTM':
                LSTMcaption, LSTMet = Caption(processed, 'LSTM', 0)
                response = {"LSTMcaption": LSTMcaption, "LSTMet": LSTMet}
                caption.update(response)
            if model == 'GRU':
                GRUcaption, GRUet = Caption(processed, 'GRU', 1)
                response = {"GRUcaption": GRUcaption, "GRUet": GRUet}              
                caption.update(response)
            if model == 'RNN':
                RNNcaption, RNNet = Caption(processed, 'RNN', 2)
                response = {"RNNcaption": RNNcaption, "RNNet": RNNet}
                caption.update(response)

        # Remove the image after captioning
        os.remove(img_path)
        return  jsonify(caption), 200

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
