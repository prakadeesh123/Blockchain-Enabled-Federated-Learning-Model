from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
import pandas as pd
import io
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report
from tensorflow.keras.models import load_model
from cryptography.fernet import Fernet
import os

app = FastAPI()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for testing; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler
model = load_model(r"C:\Users\Prakadeesh\Downloads\FGM.h5")
scaler = joblib.load(r"C:\Users\Prakadeesh\Downloads\scaler.pkl")

# Generate encryption key and Fernet object
ENCRYPTION_KEY = Fernet.generate_key()
fernet = Fernet(ENCRYPTION_KEY)

@app.get("/")
def root():
    return {"message": "✅ FastAPI server is running and ready for predictions!"}

@app.post("/predict_and_filter")
async def predict_and_filter(file: UploadFile = File(...)):
    try:
        # Read uploaded CSV
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        # Separate features and label
        y = df['label']
        X = df.drop(columns=['label'])

        # Encode categorical columns if any
        le = LabelEncoder()
        for col in X.select_dtypes(include='object').columns:
            X[col] = le.fit_transform(X[col])

        # Align columns to match scaler
        expected_columns = scaler.feature_names_in_
        X = X.reindex(columns=expected_columns, fill_value=0)

        # Scale features
        X_scaled = scaler.transform(X)

        # Predict using model
        preds = (model.predict(X_scaled) > 0.5).astype(int).flatten()

        # Evaluation
        acc = accuracy_score(y, preds)
        f1 = f1_score(y, preds)
        cm = confusion_matrix(y, preds).tolist()
        report = classification_report(y, preds, output_dict=True)

        # Save normal data
        df['prediction'] = preds
        normal_data = df[df['prediction'] == 0].drop(columns=['prediction'])
        normal_data.to_csv("normal_filtered.csv", index=False)

        return {
            "accuracy": acc,
            "f1_score": f1,
            "confusion_matrix": cm,
            "classification_report": report,
            "total_rows": len(df),
            "normal_count": len(normal_data),
            "attack_count": len(df) - len(normal_data),
            "normal_data": normal_data.to_dict(orient='records')
        }

    except Exception as e:
        return {"error": str(e)}

@app.post("/encrypt_and_download")
async def encrypt_normal_data():
    try:
        file_path = "normal_filtered.csv"
        if not os.path.exists(file_path):
            return {"error": "No normal data to encrypt."}

        with open(file_path, 'rb') as f:
            original_data = f.read()

        encrypted_data = fernet.encrypt(original_data)
        encrypted_path = "encrypted_data.csv.enc"

        with open(encrypted_path, 'wb') as ef:
            ef.write(encrypted_data)

        return FileResponse(
            path=encrypted_path,
            filename="encrypted_data.csv.enc",
            media_type="application/octet-stream"
        )
    except Exception as e:
        return {"error": str(e)}

@app.get("/get_encryption_key")
def get_key():
    return {"key": ENCRYPTION_KEY.decode()}

@app.post("/decrypt")
async def decrypt(file: UploadFile = File(...), Key: str = Form(...)):
    try:
        # Read uploaded encrypted file
        encrypted_data = await file.read()

        # Check if the provided key is valid (length of a Fernet key should be 44 characters)
        if len(Key) != 44:
            return JSONResponse(content={"error": "Invalid encryption key length."}, status_code=422)

        # Create a Fernet object with the user-provided key
        decrypt_fernet = Fernet(Key.encode())

        # Decrypt the data
        decrypted = decrypt_fernet.decrypt(encrypted_data)

        # Convert decrypted bytes to DataFrame
        df = pd.read_csv(io.BytesIO(decrypted))

        # Convert the DataFrame back to CSV format with one row per line
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)

        # Move the cursor to the start of the buffer before returning the response
        csv_buffer.seek(0)

        # Return the CSV as a StreamingResponse (downloads as .csv file)
        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=decrypted_data.csv"}
        )

    except Exception as e:
        return JSONResponse(content={"error": f"Decryption failed: {str(e)}"}, status_code=500)