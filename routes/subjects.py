from flask import Blueprint, request, jsonify
from firebase_admin import firestore

subjects_bp = Blueprint('subjects', __name__)

@subjects_bp.route('/', methods=['GET'])
def get_subjects():
    """ получение всех дисциплин """
    try:
        db = firestore.client()
        subjects_ref = db.collection('subjects')
        docs = subjects_ref.stream()
        
        subjects = []
        for doc in docs:
            subject = doc.to_dict()
            subject['id'] = doc.id
            subjects.append(subject)
        
        return jsonify(subjects), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['GET'])
def get_subject(subject_id):
    """ получить конкретной дисциплины по id """
    try:
        db = firestore.client()
        doc = db.collection('subjects').document(subject_id).get()
        
        if doc.exists:
            subject = doc.to_dict()
            subject['id'] = doc.id
            return jsonify(subject), 200
        else:
            return jsonify({'error': 'Дисциплина не найдена.'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/', methods=['POST'])
def create_subject():
    """ добавление новой дисциплины """
    try:
        data = request.json
        db = firestore.client()
        
        subject_data = {
            'name': data['name'],
            'short_name': data['short_name'],
            'teacher_id': data.get('teacher_id')
        }
        
        doc_ref = db.collection('subjects').add(subject_data)
        
        # если указан teacher_id, добавляем subject в список преподавателя
        if 'teacher_id' in data:
            teacher_ref = db.collection('teachers').document(data['teacher_id'])
            teacher = teacher_ref.get()
            if teacher.exists:
                current_subjects = teacher.to_dict().get('subject_ids', [])
                current_subjects.append(doc_ref[1].id)
                teacher_ref.update({'subject_ids': current_subjects})
        
        return jsonify({'id': doc_ref[1].id, **subject_data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['PUT'])
def update_subject(subject_id):
    """ обновление дисциплины """
    try:
        data = request.json
        db = firestore.client()
        
        db.collection('subjects').document(subject_id).update(data)
        
        updated_doc = db.collection('subjects').document(subject_id).get()
        return jsonify(updated_doc.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    """ удаление дисциплины """
    try:
        db = firestore.client()
        
        # удаление ссылки на дисциплину у преподавателя
        subject = db.collection('subjects').document(subject_id).get()
        if subject.exists:
            teacher_id = subject.to_dict().get('teacher_id')
            if teacher_id:
                teacher_ref = db.collection('teachers').document(teacher_id)
                teacher = teacher_ref.get()
                if teacher.exists:
                    subject_ids = teacher.to_dict().get('subject_ids', [])
                    if subject_id in subject_ids:
                        subject_ids.remove(subject_id)
                        teacher_ref.update({'subject_ids': subject_ids})
        
        db.collection('subjects').document(subject_id).delete()
        return jsonify({'message': 'Дисциплина удалена.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500