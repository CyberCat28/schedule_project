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
            'contact': data.get('contact', ''),
            'color': data['color'],
            'subject_ids': data.get('subject_ids', [])
        }
        
        # создание преподавателя
        doc_ref = db.collection('teachers').add(teacher_data)
        teacher_id = doc_ref[1].id
        
        # добавляем id преподавателя в каждую выбранную дисциплину
        for subject_id in teacher_data['subject_ids']:
            subject_ref = db.collection('subjects').document(subject_id)
            subject = subject_ref.get()
            if subject.exists:
                current_teachers = subject.to_dict().get('teacher_ids', [])
                if teacher_id not in current_teachers:
                    current_teachers.append(teacher_id)
                    subject_ref.update({'teacher_ids': current_teachers})

        # возвращение созданного преподавателя
        created_doc = db.collection('teachers').document(teacher_id).get()
        return jsonify(created_doc.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['PUT'])
def update_teacher(teacher_id):
    """ обновление преподавателя """
    try:
        data = request.json
        db = firestore.client()
        
        # получение текущиих данных преподавателя
        current_doc = db.collection('teachers').document(teacher_id).get()
        if not current_doc.exists:
            return jsonify({'error': 'Преподаватель не найден.'}), 404
        
        current_subject_ids = current_doc.to_dict().get('subject_ids', [])
        new_subject_ids = data.get('subject_ids', current_subject_ids)
        
        # обновление данных преподавателя
        update_data = {
            'name': data.get('name', current_doc.to_dict()['name']),
            'short_name': data.get('short_name', current_doc.to_dict()['short_name']),
            'contact': data.get('contact', current_doc.to_dict().get('contact', '')),
            'color': data.get('color', current_doc.to_dict()['color']),
            'subject_ids': new_subject_ids
        }
        
        db.collection('teachers').document(teacher_id).update(update_data)
        
        # Удаление преподавателя из дисциплин, которые больше не выбраны
        removed_subjects = set(current_subject_ids) - set(new_subject_ids)
        for subject_id in removed_subjects:
            subject_ref = db.collection('subjects').document(subject_id)
            subject = subject_ref.get()
            if subject.exists:
                teacher_ids = subject.to_dict().get('teacher_ids', [])
                if teacher_id in teacher_ids:
                    teacher_ids.remove(teacher_id)
                    subject_ref.update({'teacher_ids': teacher_ids})
        
        # добавление преподавателя в новые дисциплины
        added_subjects = set(new_subject_ids) - set(current_subject_ids)
        for subject_id in added_subjects:
            subject_ref = db.collection('subjects').document(subject_id)
            subject = subject_ref.get()
            if subject.exists:
                teacher_ids = subject.to_dict().get('teacher_ids', [])
                if teacher_id not in teacher_ids:
                    teacher_ids.append(teacher_id)
                    subject_ref.update({'teacher_ids': teacher_ids})
        
        updated_doc = db.collection('teachers').document(teacher_id).get()
        return jsonify(updated_doc.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teachers_bp.route('/<teacher_id>', methods=['DELETE'])
def delete_teacher(teacher_id):
    """ удаление преподавателя """
    try:
        db = firestore.client()
        
        # получение дисциплины преподавателя
        teacher = db.collection('teachers').document(teacher_id).get()
        if teacher.exists:
            subject_ids = teacher.to_dict().get('subject_ids', [])
            
            # удаление преподавателя из всех связанных дисциплин
            for subject_id in subject_ids:
                subject_ref = db.collection('subjects').document(subject_id)
                subject = subject_ref.get()
                if subject.exists:
                    teacher_ids = subject.to_dict().get('teacher_ids', [])
                    if teacher_id in teacher_ids:
                        teacher_ids.remove(teacher_id)
                        subject_ref.update({'teacher_ids': teacher_ids})
        
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