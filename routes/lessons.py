from flask import Blueprint, request, jsonify
from firebase_admin import firestore

lessons_bp = Blueprint('lessons', __name__)

@lessons_bp.route('/', methods=['GET'])
def get_lessons():
    """ получение всех занятий """
    try:
        db = firestore.client()
        lessons_ref = db.collection('lessons')
        docs = lessons_ref.stream()
        
        lessons = []
        for doc in docs:
            lesson = doc.to_dict()
            lesson['id'] = doc.id
            lessons.append(lesson)
        
        return jsonify(lessons), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lessons_bp.route('/<lesson_id>', methods=['GET'])
def get_lesson(lesson_id):
    """ получение конкретного занятия """
    try:
        db = firestore.client()
        doc = db.collection('lessons').document(lesson_id).get()
        
        if doc.exists:
            lesson = doc.to_dict()
            lesson['id'] = doc.id
            return jsonify(lesson), 200
        else:
            return jsonify({'error': 'Занятие не найдено'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lessons_bp.route('/', methods=['POST'])
def create_lesson():
    """ создание нового занятия """
    try:
        data = request.json
        db = firestore.client()
        
        lesson_data = {
            'group_id': data['group_id'],
            'teacher_id': data['teacher_id'],
            'subject_id': data['subject_id'],
            'classroom_id': data.get('classroom_id', ''),
            'day': data['day'],
            'week1_lesson': data.get('week1_lesson', 0),
            'week2_lesson': data.get('week2_lesson', 0),
            'lesson_type': data.get('lesson_type', 'Лекция')
        }
        
        doc_ref = db.collection('lessons').add(lesson_data)
        created_doc = db.collection('lessons').document(doc_ref[1].id).get()
        return jsonify(created_doc.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lessons_bp.route('/<lesson_id>', methods=['PUT'])
def update_lesson(lesson_id):
    """ обновление занятия """
    try:
        data = request.json
        db = firestore.client()
        
        db.collection('lessons').document(lesson_id).update(data)
        
        updated_doc = db.collection('lessons').document(lesson_id).get()
        return jsonify(updated_doc.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lessons_bp.route('/<lesson_id>', methods=['DELETE'])
def delete_lesson(lesson_id):
    """ удаление занятия """
    try:
        db = firestore.client()
        db.collection('lessons').document(lesson_id).delete()
        return jsonify({'message': 'Занятие удалено'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500