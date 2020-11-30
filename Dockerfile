FROM python:3.7-buster
WORKDIR /spotify-flowers
COPY . .
RUN pip install -r requirements.txt
ENTRYPOINT ["python", "-m", "flask", "run"]