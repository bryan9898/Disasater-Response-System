import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from PIL import Image

# Verify images and remove corrupt files
def verify_images(folder_path):
    for subdir, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(subdir, file)
            try:
                with Image.open(file_path) as img:
                    img.verify()  # Verify that it is, in fact, an image
            except (IOError, SyntaxError):
                print('Bad file:', file_path)  # Print out the names of corrupt files
                os.remove(file_path)

# Check images for corruption
verify_images('./organisedImages/train')
verify_images('./organisedImages/val')

# Data generators
train_datagen = ImageDataGenerator(rescale=1./255)
val_datagen = ImageDataGenerator(rescale=1./255)

def create_generator(gen, directory, batch_size=20):
    g = gen.flow_from_directory(
        directory,
        target_size=(150, 150),
        batch_size=batch_size,
        class_mode='categorical'
    )
    while True:
        try:
            data = next(g)
            yield data
        except (IOError, SyntaxError):
            print('Skipping bad file.')
            continue

# Creating generators
train_generator = create_generator(train_datagen, './organisedImages/train')
val_generator = create_generator(val_datagen, './organisedImages/val')

# Model definition
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    MaxPooling2D(2, 2),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Flatten(),
    Dense(512, activation='relu'),
    Dense(6, activation='softmax')
])

# Compile the model
model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])

# Fit the model
history = model.fit(
    train_generator,
    steps_per_epoch=9485,  # This needs to match approximately the size of the dataset / batch_size
    epochs=3,
    validation_data=val_generator,
    validation_steps=100 # This needs to match approximately the size of the validation dataset / batch_size
)

# Save the model
model.save('model_save/disaster_image_classification_model.h5')
