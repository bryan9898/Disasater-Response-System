import tensorflow as tf
from transformers import BertTokenizer, TFBertForSequenceClassification, pipeline

# Define a mapping for your labels
label_mapping = {0: 'Not a Disaster', 1: 'Disaster'}

# Load the tokenizer and model
tokenizer = BertTokenizer.from_pretrained('./model_save/')
model = TFBertForSequenceClassification.from_pretrained('./model_save/')

# Initialize the pipeline
predictor = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)

# Function to get a descriptive label
def get_label_description(label_id):
    # Extract the numeric part of the label and convert it to int
    numeric_id = int(label_id.split('_')[-1])
    return label_mapping.get(numeric_id, "Unknown")

# Test texts
test_texts = [
    "Fire at sengkang area near the mrt station. Please avoid the area.",
    "Major earthquake disrupts city center, emergency services responding.",
    "Fake news about flooding in downtown area spreading on social media.",
    "Heavy rainfall expected tomorrow in several regions, stay tuned for updates.",
    "Volcano eruption alert raised to highest level, evacuation orders in place.",
    "There's a party downtown tonight, come join us for a good time!",
    "Traffic jam on the highway, avoid the area if possible.",
    "Earthquake at johor",
    "Flood at tampines",
    "In about a month students would have set their pens ablaze in The Torch Publications",
    "landslide near tuas",
    "tsunami at east coast",
    "tonight we party and cause an earthquake",
    "the rain is so heavy it feels like a flood",
]

# Predict and display with descriptive labels
for text in test_texts:
    predictions = predictor(text)
    for prediction in predictions:
        # Convert the label (e.g., 'LABEL_1') to something more descriptive
        descriptive_label = get_label_description(prediction['label'])
        print(f"Text: {text}\nPrediction: {descriptive_label} with confidence {prediction['score']}\n")
