@echo off
chcp 65001 >nul
call .\.venv\Scripts\activate.bat
cd py_vncorenlp
uvicorn vncorenlp:app --reload
pause