import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    FIREBASE_CREDENTIALS = 'schedule-project-f053a-firebase-adminsdk-fbsvc-16b0241eff.json'