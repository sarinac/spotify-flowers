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
    artist = "by " + spotify.search_artist()

    description_sections = f"""
    This arrangement consists of {spotify.number_sections} flowers, each representing a section 
    in the music with its stem positioned in order of when it plays. 
    The size of the flower corresponds to the loudness of the section.
    """

    description_bars = f"""
    Each of the {spotify.number_bars} petals is a musical bar, which progresses clockwise within each flower. 
    The colors in each petal represent different pitches moving from the center to the tips. 
    """

    return render_template(
        "index.html",
        dataset=dataset,
        track=track,
        artist=artist,
        description_sections=description_sections,
        description_bars=description_bars,
    )


if __name__ == "__main__":
    app.run(ssl_context="adhoc")
