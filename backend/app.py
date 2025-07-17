import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='../static', template_folder='../templates')
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')
DB_PATH = os.path.join(os.path.dirname(__file__), 'scripts.db')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        db.execute('''CREATE TABLE IF NOT EXISTS scripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            files TEXT
        )''')
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/history.html')
def history():
    return render_template('history.html')

@app.route('/api/scripts', methods=['POST'])
def save_script():
    title = request.form.get('title')
    content = request.form.get('content')
    files = []
    if 'files' in request.files:
        uploaded_files = request.files.getlist('files')
        for file in uploaded_files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            files.append('/uploads/' + filename)
    with get_db() as db:
        cur = db.execute('INSERT INTO scripts (title, content, files) VALUES (?, ?, ?)',
                         (title, content, str(files)))
        script_id = cur.lastrowid
    return jsonify({'id': script_id, 'title': title, 'content': content, 'files': files})

@app.route('/api/scripts', methods=['GET'])
def get_scripts():
    with get_db() as db:
        rows = db.execute('SELECT * FROM scripts').fetchall()
        scripts = []
        for row in rows:
            scripts.append({
                'id': row['id'],
                'title': row['title'],
                'content': row['content'],
                'files': eval(row['files']) if row['files'] else []
            })
    return jsonify(scripts)

@app.route('/api/scripts/<int:script_id>', methods=['GET'])
def get_script(script_id):
    with get_db() as db:
        row = db.execute('SELECT * FROM scripts WHERE id = ?', (script_id,)).fetchone()
        if not row:
            return jsonify({'error': 'Not found'}), 404
        return jsonify({
            'id': row['id'],
            'title': row['title'],
            'content': row['content'],
            'files': eval(row['files']) if row['files'] else []
        })

@app.route('/api/scripts/<int:script_id>', methods=['PUT'])
def update_script(script_id):
    title = request.form.get('title')
    content = request.form.get('content')
    files = []
    if 'files' in request.files:
        uploaded_files = request.files.getlist('files')
        for file in uploaded_files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            files.append('/uploads/' + filename)
    with get_db() as db:
        row = db.execute('SELECT files FROM scripts WHERE id = ?', (script_id,)).fetchone()
        if not row:
            return jsonify({'error': 'Not found'}), 404
        old_files = eval(row['files']) if row['files'] else []
        # If new files are uploaded, append to old files
        if files:
            all_files = old_files + files
        else:
            all_files = old_files
        db.execute('UPDATE scripts SET title = ?, content = ?, files = ? WHERE id = ?',
                   (title, content, str(all_files), script_id))
    return jsonify({'id': script_id, 'title': title, 'content': content, 'files': all_files})

@app.route('/api/scripts/<int:script_id>', methods=['DELETE'])
def delete_script(script_id):
    with get_db() as db:
        row = db.execute('SELECT files FROM scripts WHERE id = ?', (script_id,)).fetchone()
        if not row:
            return jsonify({'error': 'Not found'}), 404
        files = eval(row['files']) if row['files'] else []
        for file_path in files:
            abs_path = os.path.join(os.path.dirname(__file__), '..', file_path.lstrip('/'))
            if os.path.exists(abs_path):
                os.remove(abs_path)
        db.execute('DELETE FROM scripts WHERE id = ?', (script_id,))
    return jsonify({'success': True})

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join(os.path.dirname(__file__), '../uploads'), filename)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3001, debug=True) 