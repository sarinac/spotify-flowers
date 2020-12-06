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
    query = request.args["track"]
    track = spotify.search(query)

    uri = spotify.search_uri()
    dataset = spotify.get_results(uri)

    track = spotify.search_track()
    artist = spotify.search_artist()

    return render_template("index.html", dataset=dataset, track=track, artist=artist)


if __name__ == "__main__":
    app.run(ssl_context="adhoc")
