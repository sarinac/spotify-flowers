# spotify-flowers 🌸 🌹 🌺

[See final product here!](https://spotify-flowers.herokuapp.com/)

This project is version 2 of my [design on visualizing Spotify data with d3.js](https://github.com/sarinac/Visual-Sandbox/tree/master/03_electroswing_on_spotify). I created a visual for 1 song (Lone Digger by Caravan Palace) and then wanted to extend it for any song found on Spotify. 

## Instructions

### Set Environment Variables

Create a `.env` file to set the following variables.

```
export FLASK_APP=app/run.py

export SPOTIPY_CLIENT_ID = ""
export SPOTIPY_CLIENT_SECRET = ""
```

### Set up Virtual Environment

Install `pipenv`.
```
pip install pipenv
```
Create a virtual environment.
```
pipenv shell
```

### Run Application Locally

#### Using Flask
Run using Flask.
```
flask run
```
Alternatively, use `python -m` which does the same thing.
```
python -m flask run
```

#### Using Web Server (no Flask)
If not using Flask, remove the `static` directory from the file path for the Worker object in `flowers.js`. Then run the following command in the terminal.
```
python -m http.server 8000 &
```
Then navigate to http://localhost:8000/ to access the file in `app/static/sample.html`.

### Deployment

#### Using Heroku

Set up a Heroku account, connecting it to github and setting configuration variables (same as these environment variables). Heroku uses the `Procfile` and `runtime.txt` files.

#### If using Docker...

Although I ended up not using Docker, the Dockerfile is still here.

Build docker image.
```
docker image build . -t spotify-flowers
```
Verify that image exists in your image list.
```
docker image ls
```