import os, sys, threading, webbrowser
import streamlit.web.cli as stcli

def resource_path(rel_path: str) -> str:
    base = getattr(sys, "_MEIPASS", os.path.abspath("."))
    return os.path.join(base, rel_path)

def open_browser(url: str):
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    app_path = resource_path("app.py")
    port = 8501
    url = f"http://localhost:{port}"
    threading.Timer(1.5, open_browser, args=(url,)).start()
    sys.argv = ["streamlit","run",app_path,"--global.developmentMode=false","--server.headless=true",f"--server.port={port}","--browser.gatherUsageStats=false"]
    sys.exit(stcli.main())
