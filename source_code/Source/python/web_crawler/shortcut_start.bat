@echo off
chcp 65001 >nul
call .\.venv\Scripts\activate.bat
chcp 65001 >nul
uvicorn main:app --reload
pause
