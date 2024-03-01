import numpy as np

from tensorflow.keras.applications.vgg16 import preprocess_input
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model

def process_image(image_path, vgg_model):
    image = load_img(image_path, target_size=(224, 224))
    # convert image pixels to numpy array
    image = img_to_array(image)
    # reshape data for model
    image = image.reshape((1, image.shape[0], image.shape[1], image.shape[2]))
    # preprocess image for vgg16
    image = preprocess_input(image)
    # extract features
    features = vgg_model.predict(image, verbose=0)

    return features

class CaptioningModel():
    def __init__(self, model_path, tokenizer):
        self.model = load_model(model_path)
        self.tokenizer = tokenizer
    
    def idx_to_word(self, integer, tokenizer):
        for word, index in tokenizer.word_index.items():
            if index == integer:
                return word
        return None
    
    # generate caption for an image
    def predict_caption(self, image, max_length=35):
        # add start tag for generation process
        in_text = 'startseq'
        # iterate over the max length of sequence
        for i in range(max_length):
            # encode input sequence
            sequence = self.tokenizer.texts_to_sequences([in_text])[0]
            # pad the sequence
            sequence = pad_sequences([sequence], max_length)
            # predict next word
            yhat = self.model.predict([image, sequence], verbose=0)
            # get index with high probability
            yhat = np.argmax(yhat)
            # convert index to word
            word = self.idx_to_word(yhat, self.tokenizer)
            # stop if word not found
            if word is None:
                break
            # append word as input for generating next word
            in_text += " " + word
            # stop if we reach end tag
            if word == 'endseq':
                break
        

        return in_text[9:-7]
