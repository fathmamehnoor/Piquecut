# Piquecut

PiqueCut is a web app that utilizes machine learning to optimize the placement of stickers on an A3 paper sheet. It aims to minimize waste and maximize the utilization of space, ensuring efficient sticker arrangement based on user-provided inputs, thus ptimizing paper usage for sticker printing shops.

## About

 * The reinforcement learning model in PiqueCut is trained using the Proximal Policy Optimization (PPO) algorithm from the Stable Baselines3 library.
 * PiqueCut implements a custom environment following the OpenAI Gym interface, which allows the reinforcement learning model to interact with and learn from the sticker placement task.

 * The web application is built using React for the frontend and Flask for the backend.
 * It allows to interact with the model, obtain an A3 with stickers placed optimally.


## Usage


1. Git clone the backend directory: 
    `git clone https://github.com/fathmamehnoor/Piquecut/tree/main/backend`

2. Navigate to the Backend Directory:
    `cd backend`
    
3. Create a Virtual Environment:
    `python3 -m venv env`

4. Activate the Virtual Environment:
    `source env/bin/activate`

5. Install dependencies:
    `pip install -r requirements.txt`

6. Run the Backend: 
    `python3 app.py`

7. Access the Frontend:

    Go to the hosted frontend URL and upload your sticker images and configure placement preferences through the web interface(open in chromium).: 
    https://piquecut.azurewebsites.net/


