FROM python:3.6

MAINTAINER Killian Walsh

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install libgdal-dev
RUN mkdir -p /usr/src/app
RUN export CPLUS_INCLUDE_PATH=/usr/include/gdal
RUN export C_INCLUDE_PATH=/usr/include/gdal

COPY requirements.txt /usr/src/app
COPY . /usr/src/app

WORKDIR /usr/src/app

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]