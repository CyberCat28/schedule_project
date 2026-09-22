import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    FIREBASE_CREDENTIALS = '' # скачайте файл с приватным ключом из firebase и вставьте название файла