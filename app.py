import firebase_admin
from flask import Flask, render_template
from config import Config
from firebase_admin import credentials, firestore
from routes.groups import groups_bp
from routes.teachers import teachers_bp
from routes.subjects import subjects_bp
from routes.lessons import lessons_bp
from routes.export import export_bp

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
    app.register_blueprint(lessons_bp, url_prefix='/api/lessons')
    app.register_blueprint(export_bp)
    
    # страницы
    @app.route('/')
    def index():
        return render_template('schedule.html')
    
    @app.route('/groups')
    def groups_page():
        return render_template('groups.html')
    
    @app.route('/teachers')
    def teachers_page():
        return render_template('teachers.html')
    
    @app.route('/subjects')
    def subjects_page():
        return render_template('subjects.html')
    
    @app.route('/schedule')
    def schedule_page():
        return render_template('schedule.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)