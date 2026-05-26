# 🧬 Sickle Cell Sentinel — AI Diagnostics

AI-powered sickle cell disease detection from blood smear images using a 4-model ensemble deep learning system.

## 🎯 Features

- **4-Model Ensemble**: DenseNet121, InceptionV3, InceptionResNetV2, and CustomCNN
- **Majority Voting**: Ensemble consensus for reliable diagnosis
- **Modern Web UI**: Gradient design with smooth animations and loading indicators
- **Image Preprocessing**: Automatic grayscale-to-RGB conversion, center cropping, normalization
- **Model Caching**: Pre-loading and caching prevent reloading overhead
- **Comprehensive Results**: Individual model predictions + ensemble verdict + confidence scores

## 📋 Architecture

```
Sickle_App/
├── app.py                    # Flask server + prediction logic
├── templates/
│   └── index.html           # Modern web interface
├── models/
│   ├── DenseNet121.model/   # Transfer learning (128×128)
│   ├── inception_V3.model/  # Transfer learning (128×128)
│   ├── InceptionResNetV2.model/ # Transfer learning (128×128)
│   └── keras_model.h5       # CustomCNN (224×224)
├── uploads/                 # User-uploaded images
└── labels.txt              # Class labels (Negative/Positive)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install flask tensorflow opencv-python numpy werkzeug
```

### 2. Download Pre-trained Models

Create the `models/` directory and download:
- `DenseNet121.model/` (SavedModel format)
- `inception_V3.model/` (SavedModel format)
- `InceptionResNetV2.model/` (SavedModel format)
- `keras_model.h5` (CustomCNN)

**Note**: Models must be placed in the exact directory structure shown above. Total size: ~500MB.

### 3. Run the Server

```bash
cd Sickle_App
python app.py
```

Visit **http://localhost:5000** in your browser.

## 📊 How It Works

### Image Processing
1. Read image (PNG/JPG/BMP/TIFF)
2. Convert grayscale to RGB if needed
3. Resize to model input size (128×128 or 224×224)
4. Normalize pixels (0-1 range)

### Prediction Pipeline
1. Load each of 4 models (cached)
2. Run inference on preprocessed image
3. Extract predicted class and confidence
4. Calibrate confidence (smoothing factor: 0.85)

### Ensemble Decision
- **Positive votes**: Count of "Positive" predictions
- **Negative votes**: Count of "Negative" predictions
- **Final verdict**: Majority vote (3+ positive → Positive, else Negative)

### Results Display
- Individual model card showing:
  - Model name & architecture info
  - Predicted class
  - Confidence % with progress bar
  - ★ Best performer highlighted
- Ensemble summary with vote breakdown
- Uploaded image preview

## 🔧 Configuration

Edit `app.py`:

```python
MODEL_REGISTRY = {
    'DenseNet121':      {'path': '...', 'size': 128},
    'InceptionV3':      {'path': '...', 'size': 128},
    'InceptionResNetV2':{'path': '...', 'size': 128},
    'CustomCNN':        {'path': '...', 'size': 224},
}
```

Adjust confidence calibration:
```python
def calibrate(prob):
    return round(0.5 + (prob - 0.5) * 0.85, 4)  # 0.85 = calibration factor
```

## 📈 Performance

**Startup**: ~10 seconds (2 fast models pre-loaded)
**First Prediction**: ~30-45 seconds (loads remaining 2 models)
**Subsequent Predictions**: ~15-20 seconds (all models cached)

## ⚠️ Medical Disclaimer

This application is for **demonstration and research purposes only**. Results should NOT be used for clinical decision-making without professional medical validation. Always consult qualified healthcare professionals for diagnosis.

## 📝 Model Details

| Model | Backend | Input Size | Purpose |
|-------|---------|-----------|---------|
| DenseNet121 | Transfer Learning | 128×128 | Dense connections capture fine details |
| InceptionV3 | Transfer Learning | 128×128 | Multi-scale feature extraction |
| InceptionResNetV2 | Transfer Learning | 128×128 | Hybrid inception-residual blocks |
| CustomCNN | Custom Architecture | 224×224 | Domain-specific features |

## 🛠️ Troubleshooting

### Only 2 models showing in results
- Ensure all 4 model directories exist with correct names
- Check model files are not corrupted (test with TensorFlow's `load_model()`)

### Slow predictions
- First prediction loads InceptionResNetV2 & CustomCNN (~30s)
- Subsequent predictions use cache (~15-20s)

### Port already in use
```bash
# Change port in app.py
app.run(host='0.0.0.0', port=5001)
```

## 📦 Dependencies

- Python 3.8+
- TensorFlow 2.x
- OpenCV (cv2)
- NumPy
- Flask

Install all: `pip install -r requirements.txt`

## 📄 License

Educational and research use only. 

## 👨‍💻 Development

Created as a medical AI diagnostics prototype combining:
- Deep learning (4 ensemble models)
- Web framework (Flask)
- Modern UI/UX (responsive design, animations)
- Image processing (OpenCV)

---

**Status**: Development 🔄
**Last Updated**: April 2026
