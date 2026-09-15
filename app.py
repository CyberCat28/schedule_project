from flask import Flask, render_template
from config import Config
import firebase_admin
from firebase_admin import credentials, firestore
from routes.groups import groups_bp
from routes.teachers import teachers_bp
from routes.subjects import subjects_bp
from routes.classrooms import classrooms_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # инициализация аirebase
    cred = credentials.Certificate(app.config['FIREBASE_CREDENTIALS'])
    firebase_admin.initialize_app(cred)
    
    app.db = firestore.client()
    
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(teachers_bp, url_prefix='/api/teachers')
    app.register_blueprint(subjects_bp, url_prefix='/api/subjects')
    app.register_blueprint(classrooms_bp, url_prefix='/api/classrooms')
    
    # страницы
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/groups')
    def groups_page():
        return render_template('groups.html')
    
    @app.route('/teachers')
    def teachers_page():
        return render_template('teachers.html')
    
    @app.route('/subjects')
    def subjects_page():
        return render_template('subjects.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)