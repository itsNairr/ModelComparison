#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Feb 19 15:15:14 2024

@author: thomastesselaar Gated Recurrent Unit (GRU) 
"""

import keras
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input 
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Model
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from tqdm import tqdm


class ImageCaptioner:
    def __init__(self, filepath:str, verbose=False):
        # can take a few seconds to initialize
        self.captioner = keras.models.load_model(filepath, compile=False)
        self.captioner.compile(optimizer='adam', loss='binary_crossentropy')
        
        model = VGG16()
        self.reature_extracter = Model(inputs=model.inputs, outputs=model.layers[-2].output)
        
        self.init_tokenizer()
        
        if verbose:
            print(self.reature_extracter.summary())
    
    
    def init_tokenizer(self):
        with open('./GRU/captions.txt', 'r') as f:
            next(f)
            captions_doc = f.read()
            
        all_captions = []
            
        for line in tqdm(captions_doc.split('\n')):
            try: 
                caption = line.split(',')[1:]
                caption = " ".join(caption)
                caption = caption.replace('[^A-Za-z]', '')
                caption = caption.replace('\s+', ' ')
                caption = 'startseq ' + " ".join([word for word in caption.split() if len(word)>1]) + ' endseq'
                all_captions.append(caption)
            except: 
                continue
        
        self.tokenizer = Tokenizer()
        self.tokenizer.fit_on_texts(all_captions)
        self.max_len = max(len(caption.split()) for caption in all_captions)
    
    
    def caption(self, img_path:str, display=False):
        features = self.process_image(img_path)
        
        caption = self.get_caption(features)
        
        if display:
            image = Image.open(img_path)
            plt.imshow(image)
            print(caption)
        
        return caption
    

    def process_image(self, img_path):
        # load image
        image = load_img(img_path, target_size=(224, 224))
        
        # preprocess
        image = img_to_array(image)
        image = image.reshape((1, image.shape[0], image.shape[1], image.shape[2]))
        image = preprocess_input(image)
        
        # extract features
        features = self.reature_extracter.predict(image, verbose=0)
        
        return features
        
    
    def get_caption(self, features):
        in_text = 'startseq'
        
        for i in range(self.max_len):
            sequence = self.tokenizer.texts_to_sequences([in_text])[0]
            
            sequence = pad_sequences([sequence], self.max_len)
            
            yhat = self.captioner.predict([features, sequence], verbose=0)
            yhat = np.argmax(yhat)
            word = self.idx_to_word(yhat)
            
            if word is None:
                break
            
            in_text += " " + word
            
            if word == 'endseq':
                break
            
        return in_text.replace('startseq ', '').replace(' endseq', '')
    
    
    def idx_to_word(self, integer):
        for word, index in self.tokenizer.word_index.items():
            if index == integer:
                return word
        return None
    
    
    def score(self):
        pass




