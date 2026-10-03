# Model Training & AI for Rahat Setu (EventFlow AI)

This directory contains ML models, training pipelines, and notebooks for crowd density estimation, queue prediction, and AI tour recommendations.

## Structure
- `datasets/`: Raw and preprocessed event crowd & queue datasets (Git ignored)
- `notebooks/`: Exploratory Jupyter notebooks for experimentation
- `src/`: Reusable Python modules for preprocessing, training, and inference
- `models/`: Exported model weights (.onnx, .joblib, or PyTorch checkpoints - Git ignored)
- `requirements.txt`: Python package dependencies

## Setup
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```
