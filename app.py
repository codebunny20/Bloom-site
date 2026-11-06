from flask import Flask, abort, render_template

app = Flask(__name__, template_folder="templates", static_folder="static")

# Each tool has its own page in templates/pages/<slug>.html
TOOLS = [
    {"slug": "mood", "name": "Mood check-in", "icon": "☺", "tint": "sage",
     "description": "Check in with how today feels."},
    {"slug": "medications", "name": "Medications", "icon": "✚", "tint": "lavender",
     "description": "Track your doses day by day."},
    {"slug": "appointments", "name": "Appointments", "icon": "▣", "tint": "peach",
     "description": "Keep upcoming dates in one place."},
    {"slug": "journal", "name": "Journal", "icon": "✎", "tint": "sage",
     "description": "A private space for your thoughts."},
    {"slug": "milestones", "name": "Milestones", "icon": "✧", "tint": "butter",
     "description": "Celebrate the moments that matter."},
    {"slug": "resources", "name": "Resources", "icon": "♡", "tint": "lavender",
     "description": "Support networks and crisis contacts."},
]
TOOLS_BY_SLUG = {tool["slug"]: tool for tool in TOOLS}


@app.context_processor
def inject_tools():
    return {"tools": TOOLS}


@app.route("/")
def index():
    return render_template("index.html", active="home")


@app.route("/<slug>")
def tool_page(slug):
    tool = TOOLS_BY_SLUG.get(slug)
    if tool is None:
        abort(404)
    return render_template(f"pages/{slug}.html", tool=tool, active=slug)


if __name__ == "__main__":
    app.run(debug=True)
