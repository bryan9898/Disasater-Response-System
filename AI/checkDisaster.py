import sys
import tensorflow as tf
from transformers import BertTokenizer, TFBertForSequenceClassification, pipeline

def main():
    if len(sys.argv) != 2:
        print("Usage: python check_disaster.py '<text_to_check>'")
        sys.exit(1)

    text_to_check = sys.argv[1]

   
    label_mapping = {0: 'Not a Disaster', 1: 'Disaster'}

    # Load the tokenizer and model
    tokenizer = BertTokenizer.from_pretrained('./model_save/')
    model = TFBertForSequenceClassification.from_pretrained('./model_save/')

    # Initialize the pipeline
    predictor = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)

    # Function to get a descriptive label
    def get_label_description(label_id):
    
        numeric_id = int(label_id.split('_')[-1])
        return label_mapping.get(numeric_id, "Unknown")

    # Perform prediction
    predictions = predictor(text_to_check)
    for prediction in predictions:
        descriptive_label = get_label_description(prediction['label'])
        print(f"{descriptive_label},{prediction['score']}")

if __name__ == "__main__":
    main()
