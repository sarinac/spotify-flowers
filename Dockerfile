FROM python:3.7-buster
WORKDIR /spotify-flowers
ENV FLASK_APP=run.py
COPY . .
RUN pip install -r requirements.txt
ENTRYPOINT ["python", "-m", "flask", "run"]