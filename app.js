const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));


let people = {
    'doctorwhocomposer': {
        surname: "Derbyshire",
        forename: "Delia",
        password: "password",    //extremely secure
        email: "delia.derbyshire@drwhomst.dve",
        access_token: "toasteeWhomstdve"
    },
    'devman': {
        surname: "Probably",
        forename: "Anonymous",
        password: "also_password",    //even more secure
        email: "devck@protonmail.com",
        access_token: "superSecur3"
    }
};
let staff_tokens = ["toasteeWhomstdve", "concertina", "superSecur3"];
let admin_tokens = ["concertina", "superSecur3"];

let taskDescriptions = {
    veg: {
        Tag: 'veg',
        Title: 'Vegetables',
        Description: 'Chop peppers, onions and mushrooms as needed. Label with date.',
        Time: 1,
        LastDone: "\"2019-01-27T12:00:00.000Z\""
    },
    coffee: {
        Tag: 'coffee',
        Title: 'Coffee Machine',
        Description: 'Wash the coffee machine and capsule dispenser.',
        Time: 2,
        LastDone: "\"2019-01-30T12:00:00.000Z\""
    },
    mop: {
        Tag: 'mop',
        Title: 'Mop',
        Description: 'Mop the floor. Add one pump from the wall-mounted detergent dispenser to a bucket 1/3rd full of water.',
        Time: 1,
        LastDone: "\"2019-01-29T12:00:00.000Z\""
    },
    probe: {
        Tag: 'probe',
        Title: 'Probe Toasties',
        Description: 'Probe 2 toasties (or reach closing time having made at most 1 toastie).',
        Time: 1,
        LastDone: "\"2019-01-30T12:00:00.000Z\""
    },
    dishes: {
        Tag: 'dishes',
        Title: 'Dishes',
        Description: 'Remove all clean dishes from the drying rack, ensure the cutlery box is closed. Wash dishes from shift with soap and hot water, leave to dry on rack',
        Time: 1,
        LastDone: "\"2019-01-30T12:00:00.000Z\""
    },
    microwave: {
        Tag: 'microwave',
        Title: 'Microwave',
        Description: 'Clean inside microwave with detergent, wipe down with wet sponge. Don\'t forget the top!',
        Time: 4,
        LastDone: "\"2019-01-23T12:00:00.000Z\""
    },
    counter: {
        Tag: 'counter',
        Title: 'Counter',
        Description: 'Clear and wipe down the counters(customer facing and coffee machine)',
        Time: 7,
        LastDone: "\"2019-01-29T12:00:00.000Z\""
    }
};
let tasks = ["veg", "coffee", "probe", "dishes", "mop"];
let afternoon = ["veg", "coffee", "probe", "dishes"];
let evening = ["probe", "dishes", "mop"];

function redact(username) {
    let person = people[username];
    let redactedPerson = {
        surname: person.surname,
        forename: person.forename
    };
    return redactedPerson;


}


app.get('/test', function (req, res) {
    console.log("Test called by app.test.js");
    res.send("32");
});

// authenticate a user
app.get('/auth', function (requ, resp) {
    let userName = requ.query.userName;
    let password = requ.query.password;
    console.log("Login attempted:");
    console.log(userName);
    console.log(password);
    if (people[userName] === undefined) {
        resp.send(false);
    } else if (people[userName]['password'] === password) {
        //console.log("Verified.");
        resp.send(true);
    } else {
        //console.log("Phony password/uname pair");
        resp.send(false);
    }
});

app.get('/afternoon', function (request, response) {
    let afternoonTasks = [];
    tasks.forEach(function (taskName) {
        if (afternoon.includes(taskName)) afternoonTasks.push(taskDescriptions[taskName]);
    });
    let responseJSON = JSON.stringify(afternoonTasks);
    response.send(responseJSON);
    console.log(responseJSON);
});

app.get('/evening', function (request, response) {
    let eveningTasks = [];
    tasks.forEach(function (taskName) {
        if (evening.includes(taskName)) eveningTasks.push(taskDescriptions[taskName]);
    })
    let responseJSON = JSON.stringify(eveningTasks);
    response.send(responseJSON);
    console.log(responseJSON);
});

app.get('/people/:username', function (request, response) {
    let username = request.params.username;
    response.send(redact(username));
});

app.get('/people/', function (request, response) {
    let username = request.params.username;
    // strip out passwords and emails - sensitive data
    let redactedPeople = {};
    Object.keys(people).map(function (username) {
        redactedPeople[username] = redact(username);
    });
    response.send(redactedPeople);
});

// bodge, not fully implemented
app.post('/people', function (requ, resp) {
    if (admin_tokens.includes(requ.body.access_token)) {
        // process the request, reject with 400 if duplicate ID.
        resp.send(400);
    }
    resp.send(403);
});

app.post('/done', function (requ, resp) {
    console.log("Done called");
    if (staff_tokens.includes(requ.body.access_token)) {
        let taskTag = requ.body.task;
        if (taskTag in taskDescriptions) {
            taskDescriptions[taskTag].LastDone = new Date();
            resp.send(200);
        } else resp.send(400);
    } else resp.send(403);
});

module.exports = app;