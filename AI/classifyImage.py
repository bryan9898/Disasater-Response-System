import sys
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model

def load_and_prepare_image(img_path):
    # Load and resize the image to be compatible with the model input
    img = image.load_img(img_path, target_size=(150, 150))
    # Convert the image to an array
    img_array = image.img_to_array(img)
    # Expand dimensions to match the model input shape
    img_array = np.expand_dims(img_array, axis=0)
    # Normalize the image data
    img_array /= 255.0
    return img_array

def main():
    if len(sys.argv) != 2:
        print("Usage: python classify_image.py '<image_path>'")
        sys.exit(1)

    img_path = sys.argv[1]

    # Load the model
    model = load_model('./model_save/disaster_image_classification_model.h5')

    # Class labels
    class_labels = {
        0: 'Damaged_Infrastructure',
        1: 'Fire_Disaster',
        2: 'Human_Damage',
        3: 'Land_Disaster',
        4: 'Non_Damage',
        5: 'Water_Disaster'
    }
    
    # Load and prepare the image
    img_array = load_and_prepare_image(img_path)
    # Make predictions
    predictions = model.predict(img_array, verbose=0)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class_label = class_labels[predicted_class_index]

    print(predicted_class_label)

if __name__ == "__main__":
    main()
