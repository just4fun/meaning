meaning
=======

[![Build Status](https://travis-ci.org/just4fun/meaning.png)](https://travis-ci.org/just4fun/meaning)

A mini blogging platform inspired by [MEAN.JS](http://meanjs.org).   
The name of this repo means that I'm still learning MEAN.JS and falling in love with it.  

###[Live Demo](http://talent-is.me)

## Prerequisites
I think you should have some basic knowledge about [MongoDB](http://mongodb.org/), [Express](http://expressjs.com/), [AngularJS](https://angularjs.org/), and [Node.js](http://nodejs.org/) in advance.    
You can go through their official websites directly, or view [MEAN.IO Repo](https://github.com/linnovate/mean) / [MEAN.JS Repo](https://github.com/meanjs/mean) for reference.

**Tips**: *The [history](http://blog.meanjs.org/post/76726660228/forking-out-of-an-open-source-conflict) of [MEAN.IO](http://mean.io) and [MEAN.JS](http://meanjs.org).*

I also use [CoffeeScript](http://coffeescript.org/) and [LESS](http://lesscss.org/) as the front-end precompiler.

And the crucial tool to run MEAN.JS application is [Grunt](http://gruntjs.com/), which will automate your development process.
Make sure you have installed [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.org/), then install grunt globally via npm:
```
$ sudo npm install -g grunt-cli
```
What is more, make sure [MongoDB](http://mongodb.org/) is running on the ```default port 27017```.

## Installation
```
$ git clone https://github.com/just4fun/meaning.git
$ cd meaning
$ npm install
$ grunt
```

## Grunt Commands
```
$ grunt
```
```Default command```, which will build application without minification and uglificaion, then run it.
```
$ grunt -release
```
Build application with minification and uglificaion, then run it.
```
$ grunt build
```
Build application without minification and uglificaion.
```
$ grunt build -release
```
Build application with minification and uglificaion.
```
$ grunt build-server
```
Only build server code.
```
$ grunt run
```
Run application immediately.   
This command is always executed after ```$ grunt build (-release)```


## Default User
Account: ```admin```    
Password: ```12345```

## More
This mini site only has basic posting function now, and there are bugs inevitably, I will improve it during the time I spend on learning MEAN.JS.

```Just for fun```

## License
[The MIT License](http://opensource.org/licenses/MIT)
