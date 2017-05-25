# Vélocité Schedule Manager

Introductory video in French: https://www.youtube.com/watch?v=6rP1ZYjyvoE&t=1s

Application showcase in French: https://www.youtube.com/watch?v=0PN4_tYZrqs&t=226s

A web application prototype developed as part of my Bachelor's Thesis in 2015 for Velocite SA in Lausanne, Switzerland.
Velocite is a post establishment that employs postmen on bicycles. The postmen define their availabilities and the manager assigns the desired shifts (name, time, type, city) to them. This application offered a friendlier user interface and numerous input controls that made the work of the schedule organizer much more effective.

Based on MEAN-stack (MongoDB, ExpressJS, AngularJS, NodeJS), this app it allows to a simple user:
  - to send and edit his availabilities (dates, hours and cities where he would like to work)
  - to see the planing of the others

Furthermore, a power user (manager) can:
  - create and edit shifts
  - assign or remove shifts from the workers
  - open and close months (open = workers can send and modify their availabilities, closed = no more changes can be done)

Also, the application:
  - tells, who can do which shift
  - where have been assigned too many or too little shifts and to whom
  -  who is available and where


# Installation
You will need:
 - MongoDB - https://www.mongodb.org/downloads?_ga=1.174360038.554951655.1427457132
 - 2 instances of the command line (for example with ConEmu https://code.google.com/p/conemu-maximus5/)
 - NodeJs with Node Package Manager installed (NPM) - https://nodejs.org/download/
 - Bower – install with “npm install -g bower” in the command line after installing NodeJS
 - I recommend using Robomongo for the interaction with MongoDB

Now open 2 command line instances. In the first one, run MongoDB with ```mongod``` in the directorz where you can find the MongoDB executable.
In the second one run ```bower install && npm install``` in the root directory of this project.
It will take some time to download (200 MB)

After the installation, open the "developement.js" file under ```server\config\environment``` in a text editor and change the
```seedDB``` variable to ```true``` for this first time installation, so that the database will be populated. After that, you can change it to ```false``` and save.

Now run ```grunt serve``` and wait for the application to appear, normally under ```localhost:9000```.

The app is now ready. 
Admin account: 
  - login: admin@admin.com
  - password: admin
  
Simple user account:
  - login: test@test.com
  - password: test
