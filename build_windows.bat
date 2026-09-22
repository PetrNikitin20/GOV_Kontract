@echo off
REM Пересборка локальной Windows-версии из исходников репозитория
python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller
python -m PyInstaller --onefile --noconsole --add-data "source\app.py;." --copy-metadata streamlit --collect-all streamlit source\main.py
pause
