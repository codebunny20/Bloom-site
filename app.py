from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from datetime import datetime, timezone
import json
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_file

# Initialize the Flask application
app = Flask(__name__, template_folder="templates", static_folder="static")
