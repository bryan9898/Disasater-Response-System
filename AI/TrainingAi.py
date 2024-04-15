import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from transformers import BertTokenizer, TFBertForSequenceClassification, pipeline
from transformers import InputExample, InputFeatures

df = pd.read_csv('./Text Analysis/train.csv')

# Initialize the tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

def convert_example_to_feature(review):
  # Tokenize the text into tensors with 'encode_plus'
  return tokenizer.encode_plus(review, 
                               add_special_tokens = True,      # Add '[CLS]' and '[SEP]'
                               max_length = 64,           # Pad & truncate all sentences.
                               pad_to_max_length = True,  # Pad sentence to max length.
                               return_attention_mask = True,  # Generate attention mask.
                               return_tensors = 'tf',     # Return tf tensors.
                              )

# Preparing dataset
def map_example_to_dict(input_ids, attention_masks, label):
    return {
      "input_ids": input_ids,
      "attention_mask": attention_masks,
    }, label

def encode_examples(ds, limit=-1):
    # Prepare list, so that we can build up final TensorFlow dataset from slices.
    input_ids_list = []
    token_type_ids_list = []
    attention_mask_list = []
    label_list = []

    if (limit > 0):
        ds = ds.take(limit)
    
    for index, row in ds.iterrows():
        review = row["text"]
        label = row["target"]
        bert_input = convert_example_to_feature(review)
        
        input_ids_list.append(bert_input['input_ids'][0])
        attention_mask_list.append(bert_input['attention_mask'][0])
        label_list.append([label])
        
    return tf.data.Dataset.from_tensor_slices((input_ids_list, attention_mask_list, label_list)).map(map_example_to_dict)

# Split the dataset into train and test
train_df, eval_df = train_test_split(df, test_size=0.2)

# Encode examples
train_data = encode_examples(train_df)
eval_data = encode_examples(eval_df)

# Load TFBertForSequenceClassification, the pretrained BERT model with a single linear classification layer on top.
model = TFBertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

# Define the training arguments
training_args = tf.keras.callbacks.ModelCheckpoint(filepath='./model_save/', save_weights_only=True, monitor='val_loss', mode='min', save_best_only=True)

# Compile the model
optimizer = tf.keras.optimizers.Adam(learning_rate=5e-5)
loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
metric = tf.keras.metrics.SparseCategoricalAccuracy('accuracy')
model.compile(optimizer=optimizer, loss=loss, metrics=[metric])

# Train the model
model.fit(train_data.shuffle(1000).batch(16), epochs=12, batch_size=16, validation_data=eval_data.batch(16), callbacks=[training_args])

# Save the entire model as a SavedModel for later use
model.save_pretrained('./model_save/')
tokenizer.save_pretrained('./model_save/')


# Load the model
loaded_model = TFBertForSequenceClassification.from_pretrained('./model_save/')

predictor = pipeline('sentiment-analysis', model=loaded_model, tokenizer=tokenizer)

# Example prediction
predictions = predictor("Fire at sengkang area near the mrt station. Please avoid the area.")

print(predictions)