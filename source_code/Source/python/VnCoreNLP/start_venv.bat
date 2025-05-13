@echo off
call .\.venv\Scripts\activate
cd py_vncorenlp
uvicorn vncorenlp:app --reload
pause