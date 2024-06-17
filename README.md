# Piquecut

PiqueCut is a web app that utilizes machine learning to optimize the placement of stickers on an A3 paper sheet. It aims to minimize waste and maximize the utilization of space, ensuring efficient sticker arrangement based on user-provided inputs, thus ptimizing paper usage for sticker printing shops.

## About

### Model

 * PiqueCut implements a custom environment following the OpenAI Gym interface, which allows the reinforcement learning model to interact with and learn from the sticker placement task.
 * The reinforcement learning model in PiqueCut is trained using the Proximal Policy Optimization (PPO) algorithm from the Stable Baselines3 library.
 * It finds the best position by considering the padding and the space left so that it doesn’t overlap with other stickers.
 * Rewards are given when its within boundaries, doesn’t overlap, and for least amount of unused area in the paper.


 ### Web App

 * The web application is built using React for the frontend and Flask for the backend.
 * Allows to interact with the model, obtain an A3 with sticker placed optimally.

 ### Features

 * Upload single or multiple sticker images with minimum printed dimension requirements.
 * Reinforcement Learning (RL) model is used to determine the most space-efficient layout for stickers on A3 paper, considering user-defined padding.
 * If a sticker doesn’t fit as it is, it tries different orientation and check if any of them is able to fit in the paper.
 * If the sticker is large and cannot fit in the paper size, it reduces the sticker size to minimum of 5cm to 5cm.


## Usage


1. Git clone the backend directory: 
    `git clone https://github.com/fathmamehnoor/Piquecut/tree/main/backend`

2. setup python environment: 
    `cd backend`
    `python3 -m venv env`
    `source env/bin/activate`

3. Install dependencies:
    `pip install -r requirements.txt`

4. Run the Backend: 
    `python3 app.py`

5. Access the Frontend:

    Go to the hosted frontend URL and upload your sticker images and configure placement preferences through the web interface.: 
    `https://piquecut.azurewebsites.net/`


