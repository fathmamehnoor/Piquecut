import os
import json
import random
import gymnasium as gym
import numpy as np
import cv2
import matplotlib.pyplot as plt
from PIL import Image
from flask import send_file

def mm_to_pixels(mm, dpi=96):
    return int(mm * dpi / 25.4)


def load_dataset(dataset_dir, json_file):
    dataset = []
    with open(json_file, 'r') as jsonfile:
        data = json.load(jsonfile)["_via_img_metadata"]
        for key, info in data.items():
            filename = info['filename']
            image_path = os.path.join(dataset_dir, filename)

            # Check if there are any regions
            if not info['regions']:
                continue  # Skip this entry if no regions are defined

            width = info['regions'][0]['shape_attributes']['width']
            height = info['regions'][0]['shape_attributes']['height']
            image = Image.open(image_path)
            image.verify()  # Verify that it is an image
            image = Image.open(image_path)  # Reload the image after verification
            image.load()  # Load the image to get size info
            dataset.append({"image": image, "filename": filename, "width": width, "height": height})
    return dataset

INTERNAL_PADDING = mm_to_pixels(10)
PAPER_PADDING = mm_to_pixels(20)
MIN_STICKER_SIZE = mm_to_pixels(50)

class StickerPlacementEnv(gym.Env):
    def __init__(self, dataset, paper_size_mm=(297, 420), dpi=96):
        super(StickerPlacementEnv, self).__init__()
        self.paper_width_mm, self.paper_height_mm = paper_size_mm
        self.paper_width = mm_to_pixels(self.paper_width_mm, dpi)
        self.paper_height = mm_to_pixels(self.paper_height_mm, dpi)
        self.dataset = dataset
        self.current_sticker_index = 0
        self.placed_stickers = []
        self.dpi = dpi
        self.current_step = 0

        # Define action and observation space
        self.action_space = gym.spaces.Box(low=-1, high=1, shape=(2,), dtype=np.float32)

        self.observation_space = gym.spaces.Box(
            low=0,
            high=255,
            shape=(self.paper_height, self.paper_width, 3),  # Color shape
            dtype=np.uint8
        )

    def reset(self, seed=None):
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)
        self.placed_stickers = []
        self.current_sticker_index = 0
        self.current_step = 0
        self.paper = np.ones((self.paper_height, self.paper_width, 3), np.uint8) * 255
        return self.paper, {}

    def step(self, action):
        self.current_step += 1

        if self.current_sticker_index >= len(self.dataset):
            done = True
            reward = self._calculate_final_reward()
        else:
            sticker = self.dataset[self.current_sticker_index]
            width, height = sticker["width"], sticker["height"]
            image = sticker["image"]

            if width > self.paper_width - 2 * PAPER_PADDING or height > self.paper_height - 2 * PAPER_PADDING:
                width, height = self._scale_down_to_minimum_size(width, height)
                image = image.resize((width, height))

            # Find the best position for the sticker to minimize unused area
            best_x, best_y, best_reward = self._find_best_position(width, height, image)

            if best_x is not None and best_y is not None:
                self._place_sticker(best_x, best_y, width, height, image)
                self.current_sticker_index += 1
                reward = best_reward
            else:
                reward = -1  # Penalty for not being able to place the sticker
                self.current_sticker_index += 1  # Move to the next sticker

        done = self.current_sticker_index >= len(self.dataset)
        obs = self.paper
        terminated = done
        truncated = False  # No truncation based on steps
        info = {"num_placed_stickers": self.current_sticker_index}

        return obs, reward, terminated, truncated, info

    def render(self, mode='human', save_path=None):
        dpi = 96  # Set the DPI for the figure
        fig = plt.figure(figsize=(self.paper_width/dpi, self.paper_height/dpi), dpi=dpi)
        plt.imshow(self.paper)
        plt.axis('off')  # Hide the axis
        fig.savefig(save_path, format='png', dpi=dpi, bbox_inches='tight', pad_inches=0)
        plt.show()
        plt.close(fig)  # Close the figure to release memory

    def close(self):
        plt.close()

    def _is_valid_position(self, x, y, width, height):
        if x < PAPER_PADDING or y < PAPER_PADDING:
            return False
        if x + width > self.paper_width - PAPER_PADDING or y + height > self.paper_height - PAPER_PADDING:
            return False
        for (px, py, pwidth, pheight, _) in self.placed_stickers:
            if not (x + width + INTERNAL_PADDING < px or x > px + pwidth + INTERNAL_PADDING or
                    y + height + INTERNAL_PADDING < py or y > py + pheight + INTERNAL_PADDING):
                return False
        return True

    def _find_best_position(self, width, height, image):
        best_x, best_y, best_reward = None, None, float('-inf')
        for x in range(PAPER_PADDING, self.paper_width - width - PAPER_PADDING):
            for y in range(PAPER_PADDING, self.paper_height - height - PAPER_PADDING):
                if self._is_valid_position(x, y, width, height):
                    reward = self._calculate_reward(x, y, width, height)
                    if reward > best_reward:
                        best_x, best_y, best_reward = x, y, reward
        return best_x, best_y, best_reward

    def _place_sticker(self, x, y, width, height, image):
        # Convert the image to an array
        overlay_np = np.array(image)

        # Check if the image has three color channels (RGB)
        if len(overlay_np.shape) == 2:
            # If the image is grayscale, convert it to RGB
            overlay_np = cv2.cvtColor(overlay_np, cv2.COLOR_GRAY2RGB)

        # Resize the overlay_np array to match the dimensions of the slice
        overlay_np = cv2.resize(overlay_np, (width, height))

        # Ensure that indices are integers
        y_int, x_int = int(y), int(x)

        # Check if the image has an alpha channel
        if overlay_np.shape[-1] == 4:
            # Separate the color channels and the alpha channel
            overlay_rgb = overlay_np[:, :, :3]
            alpha_channel = overlay_np[:, :, 3] / 255.0

            # Blend the sticker with the background using the alpha channel
            for c in range(3):  # For each color channel
                self.paper[y_int:y_int+height, x_int:x_int+width, c] = \
                    (alpha_channel * overlay_rgb[:, :, c] + \
                    (1 - alpha_channel) * self.paper[y_int:y_int+height, x_int:x_int+width, c]).astype(np.uint8)
        else:
            # If no alpha channel, assume the image is fully opaque
            self.paper[y_int:y_int+height, x_int:x_int+width] = overlay_np

        # Add the sticker to the list of placed stickers
        self.placed_stickers.append((x, y, width, height, overlay_np))

    def _calculate_reward(self, x, y, width, height):
        reward = 0
        if self._is_within_boundaries(x, y, width, height):
            reward += 1  # Reward for placing within boundaries
        if not self._is_overlapping(x, y, width, height):
            reward += 1  # Reward for not overlapping

        # Reward for minimizing unused space on the A3 paper
        unused_area = self._calculate_unused_area()
        reward += (1 - unused_area / (self.paper_width * self.paper_height))  # More reward for less unused space

        return reward

    def _calculate_final_reward(self):
        # Reward based on the number of stickers placed successfully
        reward = len(self.placed_stickers)
        return reward

    def _calculate_unused_area(self):
        used_area = sum(w * h for _, _, w, h, _ in self.placed_stickers)
        total_area = self.paper_width * self.paper_height
        unused_area = total_area - used_area
        return unused_area

    def _is_within_boundaries(self, x, y, width, height):
        return PAPER_PADDING <= x <= self.paper_width - width - PAPER_PADDING and \
               PAPER_PADDING <= y <= self.paper_height - height - PAPER_PADDING

    def _is_overlapping(self, x, y, width, height):
        for (px, py, pwidth, pheight, _) in self.placed_stickers:
            if not (x + width + INTERNAL_PADDING < px or x > px + pwidth + INTERNAL_PADDING or
                    y + height + INTERNAL_PADDING < py or y > py + pheight + INTERNAL_PADDING):
                return True
        return False

    def _scale_down_to_minimum_size(self, width, height):
        aspect_ratio = width / height
        if width > height:
            width = MIN_STICKER_SIZE
            height = int(width / aspect_ratio)
        else:
            height = MIN_STICKER_SIZE
            width = int(height * aspect_ratio)
        return width, height