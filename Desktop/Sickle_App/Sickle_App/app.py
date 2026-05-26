import os
import sys
# Force UTF-8 output on Windows to avoid emoji encoding crashes
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
os.environ['TF_USE_LEGACY_KERAS'] = '1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'   # suppress TF noise

import cv2
import numpy as np
import tensorflow as tf

from flask import Flask, render_template, request, send_from_directory, jsonify
from werkzeug.utils import secure_filename

# ── App setup ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff'}

# ── Labels ────────────────────────────────────────────────────────────────────
LABELS = ['Negative', 'Positive']   # index 0 → Negative, 1 → Positive

# ── Model registry  (name → {path, size}) ────────────────────────────────────
# All 4 models for comprehensive ensemble analysis
MODEL_REGISTRY = {
    'DenseNet121':      {'path': os.path.join(MODELS_DIR, 'DenseNet121.model'),      'size': 128},
    'InceptionV3':      {'path': os.path.join(MODELS_DIR, 'inception_V3.model'),     'size': 128},
    'InceptionResNetV2':{'path': os.path.join(MODELS_DIR, 'InceptionResNetV2.model'),'size': 128},
    'CustomCNN':        {'path': os.path.join(MODELS_DIR, 'keras_model.h5'),         'size': 224},
}

_loaded = {}   # model cache

def get_model(name):
    """Load model with caching. Returns None if load fails."""
    if name not in _loaded:
        cfg = MODEL_REGISTRY.get(name)
        if not cfg:
            print(f'[ERROR] Unknown model: {name}')
            return None
        
        path = cfg['path']
        if not os.path.exists(path):
            print(f'[ERROR] Model file not found: {path}')
            return None
        
        try:
            print(f'[INFO] Loading {name} from {path} …')
            _loaded[name] = tf.keras.models.load_model(path)
            print(f'[INFO] ✓ {name} ready')
        except Exception as e:
            print(f'[ERROR] Failed to load {name}: {e}')
            return None
    
    return _loaded[name]

# ── Image preprocessing ───────────────────────────────────────────────────────
def preprocess(img_path, size):
    """Load and preprocess image."""
    try:
        img = cv2.imread(img_path)
        if img is None:
            raise ValueError(f'Cannot read image: {img_path}')
        
        # Handle grayscale
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (size, size))
        img = img.astype('float32') / 255.0
        return np.expand_dims(img, axis=0)   # (1, size, size, 3)
    except Exception as e:
        print(f'[ERROR] Preprocess failed: {e}')
        raise

# ── Confidence calibration ────────────────────────────────────────────────────
def calibrate(prob):
    prob = float(np.clip(prob, 0.01, 0.99))
    return round(0.5 + (prob - 0.5) * 0.85, 4)

# ── Run models (ALL 4 MODELS FOR ENSEMBLE) ────────────────────────────────────────
def predict_all(img_path):
    """Run predictions on ALL 4 models in ensemble."""
    print(f'\n[START] Analyzing {os.path.basename(img_path)}')
    results = {}
    models_tried = 0
    models_success = 0
    
    for name, cfg in MODEL_REGISTRY.items():
        models_tried += 1
        try:
            print(f'  [{models_tried}/4] Loading {name} ({cfg["size"]}×{cfg["size"]})...')
            model = get_model(name)
            if model is None:
                print(f'  ✗ {name} load returned None')
                results[name] = {'label': 'Failed', 'confidence': 0.0,
                                 'probability': 0.0, 'class_idx': -1}
                continue
            
            print(f'    → Preprocessing...')
            img = preprocess(img_path, cfg['size'])
            
            print(f'    → Predicting...')
            preds = model.predict(img, verbose=0)
            
            if preds.shape[-1] > 1:
                preds = tf.nn.softmax(preds).numpy()
            
            class_idx = int(np.argmax(preds[0]))
            raw_conf  = float(preds[0][class_idx])
            conf      = calibrate(raw_conf)
            
            results[name] = {
                'label':      LABELS[class_idx],
                'confidence': conf,
                'probability': round(float(preds[0][1]) * 100, 1),
                'class_idx':  class_idx,
            }
            models_success += 1
            print(f'  ✓ {name}: {LABELS[class_idx]} ({conf*100:.1f}%)')
        
        except Exception as e:
            print(f'  ✗ {name}: {str(e)[:100]}')
            results[name] = {'label': 'Error', 'confidence': 0.0,
                             'probability': 0.0, 'class_idx': -1}
    
    # Find best valid result
    valid = {k: v for k, v in results.items() if v['class_idx'] >= 0}
    print(f'[INFO] Completed: {models_success}/{models_tried} models successful, {len(valid)} valid results')
    
    if not valid:
        print('[ERROR] No valid predictions')
        return None, results
    
    best = max(valid, key=lambda k: valid[k]['confidence'])
    final = {
        'model':      best,
        'label':      valid[best]['label'],
        'confidence': valid[best]['confidence'],
    }
    
    # Ensemble vote
    votes = [v['class_idx'] for v in valid.values()]
    ensemble_label = LABELS[1] if votes.count(1) > votes.count(0) else LABELS[0]
    final['ensemble_label'] = ensemble_label
    
    print(f'[DONE] Result: {final["label"]} ({final["confidence"]*100:.1f}%) - Ensemble: {ensemble_label} ({len([v for v in votes if v == 1])}/{len(valid)})\n')
    return final, results

# ── Helpers ───────────────────────────────────────────────────────────────────
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('index.html', error='No file received.')
        f = request.files['file']
        if f.filename == '':
            return render_template('index.html', error='No file selected.')
        if not allowed_file(f.filename):
            return render_template('index.html', error='Unsupported file type. Use PNG/JPG/BMP/TIFF.')

        filename = secure_filename(f.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        f.save(save_path)

        final, results = predict_all(save_path)
        return render_template('index.html', filename=filename,
                               final=final, results=results)

    return render_template('index.html')

@app.route('/uploads/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('\n' + '='*60)
    print('🧬 Sickle Cell Sentinel — AI Diagnostics')
    print('='*60)
    print(f'📁 Base dir:    {BASE_DIR}')
    print(f'📁 Models dir:  {MODELS_DIR}')
    print(f'📁 Upload dir:  {UPLOAD_FOLDER}\n')
    
    # Pre-load only 2 fast models to start server quickly
    # Other 2 models will load on first request
    print('📦 Pre-loading fast models...')
    fast_models = ['DenseNet121', 'InceptionV3']
    for name in fast_models:
        model = get_model(name)
        if model:
            print(f'  ✓ {name} ready (128×128)')
        else:
            print(f'  ✗ {name} FAILED')
    
    print('\n💡 Note: InceptionResNetV2 & CustomCNN will load on first image upload')
    print('='*60)
    print('✓ Server starting on http://0.0.0.0:5000')
    print('='*60 + '\n')
    
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)