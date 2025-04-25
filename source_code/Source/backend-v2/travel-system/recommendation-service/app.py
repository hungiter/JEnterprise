
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api/recommend/hello")
def recommend():
    return jsonify(["Tour A", "Tour B", "Tour C"])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
