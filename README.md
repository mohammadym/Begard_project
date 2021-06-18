# Begard_project

This is my software development project. This project is about tourism purposes.
Our work is about suggest plans for trips for users.


# Front-End documention:

You need to install NodeJS and NPM from https://nodejs.org/en/download/ .

-----------------------------------------------------------

then install Angular CLI by running the following command:
    
    $ npm install -g @angular/cli
    
----------------------------------------------------

install all required npm packages by runnig the command below from the command line in the project root folder (where the package.json is loacated):
    
    $ npm install

--------------------------------------------------------

to start the application run the following command from the command line in the project root folder:
    
    $ ng serve --open
    
-----------------------------------------------------------

your browser should automatically open the project at http://localhost:4200.

-----------------------------------------------------------

to build the project you must run the following command in the command line in the project root folder:

    $ ng build --prod --base-href /static/

# Back-End documention:

you need to install python 3.6 and up.

to install requirements, in your virtualenv or another place run this in terminal :

	$ pip3 install -r requirements.txt

(recommend you to install package in a virtual env)

---------------------------------------------
To Setup Postgresql:

when for first time ,you pull project and want to setup postgresql

at first you must install requirements.txt , then run following commands in order :

	$	sudo apt-get install postgresql postgresql-contrib

	$	sudo apt-get install libpq-dev python3-dev

	$	sudo su - postgres psql

	postgres=#	CREATE USER begarduser WITH ENCRYPTED PASSWORD 'Begardpass';

	postgres=#	CREATE DATABASE begarddb with owner begarduser;

	postgres=#	ALTER ROLE begarduser SET client_encoding TO 'utf8';

	postgres=#	ALTER ROLE begarduser SET default_transaction_isolation TO 'read committed';

	postgres=#	ALTER ROLE begarduser SET timezone TO 'UTC';

	postgres=#	GRANT ALL PRIVILEGES ON DATABASE begarddb TO begarduser;

	postgres=#	\q

if you are not in first time just run followings :

	$	sudo su - postgres psql

	postgres=#	drop database begarddb;

	postgres=#	create database begarddb with owner begarduser;

	postgres=#	\q
-----------------------------------------------

for use from backup-vx.sql (x is number of backup file like 'backup-v1.sql')file and set this in your database, run following command :

	$ pg_restore -d begarddb < /path/to/backup-vx.sql


------------------------------------------------

for run project :

go to main directory of project "shits/Begard_Project/Begard_project",

then, here run 

	$ python manage.py migrate
	
(just once, after you pull project)

after this, you can use project database.


for run server in this directory, run following:

	$ python manage.py runserver

------------------------------------------------



