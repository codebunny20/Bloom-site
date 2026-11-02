import os
from flask import Flask, jsonify, render_template, request, send_file
import json
from pathlib import Path

# Initialize the Flask application
app = Flask(__name__, template_folder="templates", static_folder="static")

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True) 