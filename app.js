const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));


let people = {
        doctorwhocomposer:{
            surname:"Derbyshire",
            forename:"Delia",
            password:"password",    //extremely secure
            email:"delia.derbyshire@drwhomst.dve"

        },
        devman:{
            surname:"Probably",
            forename:"Anonymous",
            password:"also_password",    //even more secure
            email:"devck@protonmail.com"
        }
    };
let taskDescriptions = {
        veg:{
            Tag: 'veg',
            Title: 'Vegetables',
            Description: 'Chop peppers, onions and mushrooms as needed. Label with date.',
            Time: 10,
            Prerequisites: []
        },
        coffee:{
            Tag: 'coffee',
            Title: 'Coffee Machine',
            Description: 'Wash the coffee machine and capsule dispenser.',
            Time: 2,
            Prerequisites: []
        },
        mop:{
            Tag: 'mop',
            Title: 'Mop',
            Description: 'Mop the floor. Add one pump from the wall-mounted detergent dispenser to a bucket 1/3rd full of water.',
            Time: 5,
            Prerequisites: ["dishes"]
        },
        probe:{
            Tag: 'probe',
            Title: 'Probe Toasties',
            Description: 'Probe 2 toasties (or reach closing time having made at most 1 toastie).',
            Time: 2,
            Prerequisites: []
        },
        dishes:{
            Tag: 'dishes',
            Title: 'Dishes',
            Description: 'Remove all clean dishes from the drying rack, ensure the cutlery box is closed. Wash dishes from shift with soap and hot water, leave to dry on rack',
            Time: 2,
            Prerequisites: []
        }
};
let tasks = ["veg", "coffee", "probe", "dishes", "mop"];
let afternoon = ["veg", "coffee", "probe", "dishes"];
let evening = ["probe", "dishes", "mop"];


app.get('/', function (requ, resp) {
    resp.send()
})


// authenticate a user
app.get('/auth', function (requ, resp) {
    let userName = requ.query.userName;
    let password = requ.query.password;
    console.log("Login attempted:");
    console.log(userName);
    console.log(password);
    if (people[userName]==undefined){
        resp.send(false);
    }
    else if (people[userName]['password']==password){
        //console.log("Verified.");
        resp.send(true);
    }
    else {
        //console.log("Phony password/uname pair");
        resp.send(false);
    }
});

app.get('/afternoon', function (request, response) {
    let afternoonTasks = [];
    tasks.forEach(function (taskName) {
        if (afternoon.includes(taskName)) afternoonTasks.push(taskDescriptions[taskName]);
    })
    let responseJSON = JSON.stringify(afternoonTasks);
    response.send(responseJSON);
    console.log(responseJSON);
});

app.get('/people/:username', function (request, response) {
    console.log("People GET called. Username: ")
    console.log(request.params.username);
    response.send(names)
});

module.exports = app;
