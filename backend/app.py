import os
import tempfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
from stable_baselines3 import PPO
from sticker_placement_env import StickerPlacementEnv
import matplotlib.pyplot as plt
from PIL import Image
import io
import base64


app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'




@app.route('/predict', methods=['POST'])
def predict(): # Ensure env is defined globally if needed for subsequent predictions
    try:
        data = request.json
        observation = data['observation']
        dataset = []


        for item in observation:
            filename = item['name']
            width = item['width']
            height = item['height']
            image = item['image']  # This should be the File object

            # Convert File object to PIL Image
            binary_data = base64.b64decode(image)
        
            # Create a BytesIO object to read binary data as a stream
            image_stream = io.BytesIO(binary_data)
            
            # Open the stream as a PIL Image
            image = Image.open(image_stream)
            try:
                image.verify()
            except (IOError, SyntaxError) as e:
                print(f"Error verifying image: {e}")
            image = Image.open(image_stream)
            image.load()  
        
            # Append the image and related data to the dataset
            dataset.append({"image": image, "filename": filename, "width": width, "height": height})


        model = PPO.load("model/ppo_sticker_placement")
        env = StickerPlacementEnv(dataset)
        
        obs, _ = env.reset()
        total_reward = 0
        for _ in range(len(observation)):
            action, _states = model.predict(obs)
            obs, reward, terminated, truncated, _ = env.step(action)
            total_reward += reward
            if terminated or truncated:
                break
                
        # Render the environment to get an image (if needed)
        env.render(save_path='output/output_a3.png')  # Adjust as per your environment's rendering logic
        
        # Prepare response: convert action to list if needed
        
        response_data = {}
        
        response_data['action'] = action
        
        return jsonify(response_data)
    
    except KeyError as e:
        return jsonify({'error': f'Missing key in request data: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
