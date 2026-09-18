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
            'teacher_ids': data.get('teacher_ids', [])
        }
        
        # создание дисциплины
        doc_ref = db.collection('subjects').add(subject_data)
        subject_id = doc_ref[1].id
        
        # добавление id дисциплины к каждому выбранному преподавателю
        for teacher_id in subject_data['teacher_ids']:
            teacher_ref = db.collection('teachers').document(teacher_id)
            teacher = teacher_ref.get()
            if teacher.exists:
                current_subjects = teacher.to_dict().get('subject_ids', [])
                if subject_id not in current_subjects:
                    current_subjects.append(subject_id)
                    teacher_ref.update({'subject_ids': current_subjects})
        
        created_doc = db.collection('subjects').document(subject_id).get()
        return jsonify(created_doc.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['PUT'])
def update_subject(subject_id):
    """ обновление дисциплины """
    try:
        data = request.json
        db = firestore.client()
        
        # получение текущих данных дисциплины
        current_doc = db.collection('subjects').document(subject_id).get()
        if not current_doc.exists:
            return jsonify({'error': 'Дисциплина не найдена.'}), 404
        
        current_teacher_ids = current_doc.to_dict().get('teacher_ids', [])
        new_teacher_ids = data.get('teacher_ids', current_teacher_ids)
        
        # обновление данных дисциплины
        update_data = {
            'name': data.get('name', current_doc.to_dict()['name']),
            'short_name': data.get('short_name', current_doc.to_dict()['short_name']),
            'teacher_ids': new_teacher_ids
        }
        
        db.collection('subjects').document(subject_id).update(data)
        
        # удаляение дисциплины из преподавателей, которые больше не выбраны
        removed_teachers = set(current_teacher_ids) - set(new_teacher_ids)
        for teacher_id in removed_teachers:
            teacher_ref = db.collection('teachers').document(teacher_id)
            teacher = teacher_ref.get()
            if teacher.exists:
                subject_ids = teacher.to_dict().get('subject_ids', [])
                if subject_id in subject_ids:
                    subject_ids.remove(subject_id)
                    teacher_ref.update({'subject_ids': subject_ids})
        
        # добавление дисциплины к новым преподавателям
        added_teachers = set(new_teacher_ids) - set(current_teacher_ids)
        for teacher_id in added_teachers:
            teacher_ref = db.collection('teachers').document(teacher_id)
            teacher = teacher_ref.get()
            if teacher.exists:
                subject_ids = teacher.to_dict().get('subject_ids', [])
                if subject_id not in subject_ids:
                    subject_ids.append(subject_id)
                    teacher_ref.update({'subject_ids': subject_ids})
        
        updated_doc = db.collection('subjects').document(subject_id).get()
        return jsonify(updated_doc.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subjects_bp.route('/<subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    """ удаление дисциплины """
    try:
        db = firestore.client()
        
        # получаниие преподавателей дисциплины
        subject = db.collection('subjects').document(subject_id).get()
        if subject.exists:
            teacher_ids = subject.to_dict().get('teacher_ids', [])
            # удаление дисциплиныиз всех связанных преподавателей
            for teacher_id in teacher_ids:
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