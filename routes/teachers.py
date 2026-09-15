from flask import Blueprint, request, jsonify
from firebase_admin import firestore

teachers_bp = Blueprint('teachers', __name__)

@teachers_bp.route('/', methods=['GET'])
def get_teachers():
    """ получение всех преподавателей """
    try:
        db = firestore.client()
        teachers_ref = db.collection('teachers')
        docs = teachers_ref.stream()
        
        teachers = []
        for doc in docs:
            teacher = doc.to_dict()
            teacher['id'] = doc.id
            teachers.append(teacher)
        
        return jsonify(teachers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['GET'])    
def get_teacher(teacher_id):
    """ получение конкретного преподавателя по id """
    try:
        db = firestore.client()
        doc = db.collection('teachers').document(teacher_id).get()
        
        if doc.exists:
            teacher = doc.to_dict()
            teacher['id'] = doc.id
            return jsonify(teacher), 200
        else:
            return jsonify({'error': 'Преподаватель не найден.'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/', methods=['POST'])
def create_teacher():
    """ добавление нового преподавателя """
    try:
        data = request.json
        db = firestore.client()
        
        teacher_data = {
            'name': data['name'],
            'short_name': data['short_name'],
            'color': data['color'],
            'subject_ids': data.get('subject_ids', [])
        }
        
        doc_ref = db.collection('teachers').add(teacher_data)
        return jsonify({'id': doc_ref[1].id, **teacher_data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['PUT'])
def update_teacher(teacher_id):
    """ обновление преподавателя """
    try:
        data = request.json
        db = firestore.client()
        
        db.collection('teachers').document(teacher_id).update(data)
        
        updated_doc = db.collection('teachers').document(teacher_id).get()
        return jsonify(updated_doc.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['DELETE'])
def delete_teacher(teacher_id):
    """ удаление преподавателя """
    try:
        db = firestore.client()
        db.collection('teachers').document(teacher_id).delete()
        return jsonify({'message': 'Преподаватель удалён.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>/subjects', methods=['GET'])
def get_teacher_subjects(teacher_id):
    """ получить дисциплин преподавателя """
    try:
        db = firestore.client()
        teacher = db.collection('teachers').document(teacher_id).get()
        
        if not teacher.exists:
            return jsonify({'error': 'Преподаватель не найден.'}), 404
        
        subject_ids = teacher.to_dict().get('subject_ids', [])
        subjects = []
        
        for subj_id in subject_ids:
            subj_doc = db.collection('subjects').document(subj_id).get()
            if subj_doc.exists:
                subject = subj_doc.to_dict()
                subject['id'] = subj_doc.id
                subjects.append(subject)
        
        return jsonify(subjects), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500