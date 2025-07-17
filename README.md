# Flask Script Editor

## Setup

1. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On Linux/Mac
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the Flask backend:
   ```sh
   python backend/app.py
   ```
4. Open the frontend in your browser:
   - Open `templates/index.html` or `static/index.html` (depending on where you place it).

## API Endpoints
- `POST /api/scripts` - Save a script (title, content, images)
- `GET /api/scripts` - Get all scripts
- `GET /api/scripts/<id>` - Get a script by ID
- `DELETE /api/scripts/<id>` - Delete a script by ID
- `/uploads/<filename>` - Serve uploaded images 