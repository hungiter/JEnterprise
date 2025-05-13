@echo off
chcp 65001 >nul
call .\.venv\Scripts\activate.bat
pip install fastapi==0.110.1
pip install uvicorn[standard]==0.29.0
pip install underthesea==6.1.1
pip freeze > requirements.txt
pause