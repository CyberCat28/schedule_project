from flask import Blueprint, request, jsonify
from firebase_admin import firestore

groups_bp = Blueprint('groups', __name__)

def get_db():
    from app import create_app
    return create_app().db

@groups_bp.route('/', methods=['GET'])
def get_groups():
    """ получение всех групп """
    try:
        db = firestore.client()
        groups_ref = db.collection('groups')
        docs = groups_ref.stream()
        
        groups = []
        for doc in docs:
            group = doc.to_dict()
            group['id'] = doc.id
            groups.append(group)
        
        return jsonify(groups), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/', methods=['POST'])
def create_group():
    """ добавление новой группы """
    try:
        data = request.json
        db = firestore.client()
        
        group_data = {
            'name': data['name'],
            'speciality': data['speciality'],
            'course': data['course']
        }
        
        doc_ref = db.collection('groups').add(group_data)
        return jsonify({'id': doc_ref[1].id, **group_data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<group_id>', methods=['GET'])
def get_group(group_id):
    """ получение конкретной группы """
    try:
        db = firestore.client()
        doc = db.collection('groups').document(group_id).get()
        
        if doc.exists:
            group = doc.to_dict()
            group['id'] = doc.id
            return jsonify(group), 200
        else:
            return jsonify({'error': 'Группа не найдена.'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<group_id>', methods=['PUT'])
def update_group(group_id):
    """ обновление группы """
    try:
        data = request.json
        db = firestore.client()
        
        db.collection('groups').document(group_id).update(data)
        
        updated_doc = db.collection('groups').document(group_id).get()
        return jsonify(updated_doc.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@groups_bp.route('/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    """ удаление группы """
    try:
        db = firestore.client()
        db.collection('groups').document(group_id).delete()
        return jsonify({'message': 'Группа удалена.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500