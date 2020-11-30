from flask import Flask, render_template, request
from src import spotify_analysis
import os

app = Flask(__name__)
spotify = spotify_analysis.SpotifyAnalysis()


@app.route("/")
def index():
    dataset = {}
    return render_template("index.html", dataset=dataset)


@app.route("/grow")
def grow():
    uri = request.args["URI"]
    dataset = spotify.get_results(uri)
    return render_template("index.html", dataset=dataset)


if __name__ == "__main__":
    app.run(ssl_context="adhoc")
