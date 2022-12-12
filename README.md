# Repository for the Startup Freelancer Agency

Repository for the Startup Freelancer Agency for University of South Wales. 

This repo usues Firebase 9 and Bootstrap 5.  

## Installation / dependencies
1. Install nodejs and npm (usually installed with nodejs).
https://nodejs.org/en/download/  

2. Install webpack and webpack cli tools
```console  
$ npm i webpack webpack-cli - D  

```  
3. Also install the webpack html-loader  
https://webpack.js.org/loaders/html-loader/  
```console  
$ npm install --save-dev html-loader
``` 
4. Install firebase
```console  
$ npm install firebase  

```  

## To run the environment locally
This is an npm webpack environment  
To run / build the environment
```console
$ npm run build

``` 
(Leave the terminal window open). 
This will watch for edits in the JS code and rebuild on every save. 

To preview in the browser:  
Use a live reload or http server such as a python server
To use a python server:  
Open a terminal window at the root of the project.  

```console
$ python3 -m http.server

``` 

The web site should now be accessible from   
http://[::]:8000/dist/   


## To deploy to firebase hosting / build the environment  
```console  
$ firebase deploy  

```  

## Live web site  
https://studio-freelancer-agency.web.app/  

## Tutorials
Setup the local devlopment environment:  
Follow video 1 & 2  
https://youtu.be/9zdvmgGsww0  

