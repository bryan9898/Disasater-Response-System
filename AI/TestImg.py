import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import numpy as np

# Load the trained model
model = load_model('model_save/disaster_image_classification_model.h5')

# Define a dictionary to map class indices to labels
class_labels = {
    0: 'Damaged_Infrastructure',
    1: 'Fire_Disaster',
    2: 'Human_Damage',
    3: 'Land_Disaster',
    4: 'Non_Damage',
    5: 'Water_Disaster'
}

def load_and_prepare_image(img_path):
    img = image.load_img(img_path, target_size=(150, 150))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

def predict_image(model, img_path):
    print(f"Loading and preprocessing image: {img_path}")
    img_array = load_and_prepare_image(img_path)
    # Make a prediction
    predictions = model.predict(img_array)
    # Retrieve the most likely result
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class_label = class_labels[predicted_class_index]
    return predicted_class_label

# Path to the image you want to test
test_image_path = './organisedImages/test/Land_Disaster/04_01_0019.png'

# Predict the image
predicted_class = predict_image(model, test_image_path)

# Print the result
print(f"The image was predicted as class: {predicted_class}")
