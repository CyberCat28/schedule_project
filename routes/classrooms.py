from flask import Blueprint, request, jsonify
from firebase_admin import firestore

classrooms_bp = Blueprint('classrooms', __name__)

@classrooms_bp.route('/', methods=['GET'])
def get_classrooms():
    """ получение всех кабинетов """
    try:
        db = firestore.client()
        classrooms_ref = db.collection('classrooms')
        docs = classrooms_ref.stream()
        
        classrooms = []
        for doc in docs:
            classroom = doc.to_dict()
            classroom['id'] = doc.id
            classrooms.append(classroom)
        
        return jsonify(classrooms), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@classrooms_bp.route('/', methods=['POST'])
def create_classroom():
    """ добавление кабинета """
    try:
        data = request.json
        db = firestore.client()
        
        classroom_data = {
            'number': data['number'],
            'name': data.get('name', '')
        }
        
        doc_ref = db.collection('classrooms').add(classroom_data)
        return jsonify({'id': doc_ref[1].id, **classroom_data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500