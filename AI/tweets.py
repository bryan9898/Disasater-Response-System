import tweepy
import firebase_admin
from firebase_admin import credentials, firestore
from transformers import BertTokenizer, TFBertForSequenceClassification, pipeline
import openai
import os

from dotenv import load_dotenv
load_dotenv()

# Initialize Firebase Admin
cred = credentials.Certificate('cred.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# OpenAI API credentials from environment variables
openai_api_key = os.getenv('OPENAI_API_KEY')
twitter_bearer_token = os.getenv('TWITTER_BREAER_TOKEN')
print(openai_api_key, twitter_bearer_token)

# OpenAI setup
openai.api_key = openai_api_key

# Function to extract location with GPT
def extract_location_with_gpt(tweet_text):
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",  # Use an appropriate engine
            prompt=f"Extract the location from this tweet: \"{tweet_text}\"",
            max_tokens=50
        )
        location_text = response.choices[0].text.strip()
        if location_text and location_text.lower() != "unknown":
            return location_text
        return None
    except Exception as e:
        print(f"Error in extracting location: {e}")
        return None

# Function to save tweet to Firestore
def save_tweet_to_firestore(tweet, prediction, score, location=None):
    doc_ref = db.collection('tweets').document()
    tweet_data = {
        'text': tweet.text,
        'prediction': prediction,
        'score': score,
        'created_at': tweet.created_at.isoformat(),  # Convert datetime to string
    }
    if location:
        tweet_data['location'] = location
    doc_ref.set(tweet_data)

# Load the trained BERT model and tokenizer
model_path = './model_save/'
tokenizer = BertTokenizer.from_pretrained(model_path)
model = TFBertForSequenceClassification.from_pretrained(model_path, num_labels=2)
predictor = pipeline('text-classification', model=model, tokenizer=tokenizer, return_all_scores=False)

# Function to predict disaster from tweet text
def predict_disaster(tweet_text):
    predictions = predictor(tweet_text)
    prediction = predictions[0]
    return prediction['label'] == 'LABEL_1', prediction['score']  # Assumes 'LABEL_1' corresponds to disaster

# Tweepy StreamingClient for app-only authentication
class MyStream(tweepy.StreamingClient):
    limit = 5  # Set the limit to 5 tweets

    def on_tweet(self, tweet):
        if self.num_tweets < self.limit:
            is_disaster, score = predict_disaster(tweet.text)
            if is_disaster:
                location = extract_location_with_gpt(tweet.text)
                print(f"Tweet: {tweet.text}, Prediction: Disaster, Score: {score}, Location: {location}")
                save_tweet_to_firestore(tweet, "Disaster", score, location)
                self.num_tweets += 1
                if self.num_tweets >= self.limit:
                    print("Reached the limit of 5 tweets. Disconnecting...")
                    self.disconnect()

# Initialize the stream
stream_client = MyStream(bearer_token=twitter_bearer_token)

# Define the rules for your stream
keywords = ['disaster', 'earthquake', 'flood', 'fire', 'hurricane', 'tornado', 'tsunami', 'volcano', 'wildfire', 'cyclone']
for keyword in keywords:
    stream_client.add_rules(tweepy.StreamRule(value=keyword))

# Start streaming
stream_client.filter()
