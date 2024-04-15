import shutil
import numpy as np
import os

def create_and_copy_dataset(base_dir, main_categories, exclude_subcategories={}):
    working_dir = './AI'  
    
    for main_cat in main_categories:
        os.makedirs(os.path.join(working_dir, 'train', main_cat), exist_ok=True)
        os.makedirs(os.path.join(working_dir, 'val', main_cat), exist_ok=True)
        os.makedirs(os.path.join(working_dir, 'test', main_cat), exist_ok=True)

        main_cat_dir = os.path.join(base_dir, main_cat)
        if not os.path.exists(main_cat_dir):
            print(f"Directory not found: {main_cat_dir}")
            continue

        all_files = []
        for sub_cat in os.listdir(main_cat_dir):
            sub_cat_dir = os.path.join(main_cat_dir, sub_cat)

            # Skip if the subcategory is in the exclude list
            if sub_cat in exclude_subcategories.get(main_cat, []):
                continue

            if os.path.isdir(sub_cat_dir):
                # Handle sub-directories
                files = [os.path.join(sub_cat_dir, f) for f in os.listdir(sub_cat_dir) if os.path.isfile(os.path.join(sub_cat_dir, f))]
                all_files.extend(files)
            else:
                # Handle direct files in main category folder
                if os.path.isfile(sub_cat_dir):
                    all_files.append(sub_cat_dir)

        # Shuffle and split files
        np.random.shuffle(all_files)
        total_files = len(all_files)
        train_split = int(0.7 * total_files)
        val_split = int(0.85 * total_files)

        for i, file_path in enumerate(all_files):
            if i < train_split:
                shutil.copy(file_path, os.path.join(working_dir, 'train', main_cat))
            elif i < val_split:
                shutil.copy(file_path, os.path.join(working_dir, 'val', main_cat))
            else:
                shutil.copy(file_path, os.path.join(working_dir, 'test', main_cat))


main_categories = ['Damaged_Infrastructure', 'Fire_Disaster', 'Human_Damage', 'Land_Disaster', 'Non_Damage', 'Water_Disaster']
exclude_subcategories = {}
base_dir = './Image analysis' 
create_and_copy_dataset(base_dir, main_categories, exclude_subcategories)
