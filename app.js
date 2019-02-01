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
        Time: 0.8,
        LastDone: "2019-01-27T12:00:00.000Z"
    },
    coffee: {
        Tag: 'coffee',
        Title: 'Coffee Machine',
        Description: 'Wash the coffee machine and capsule dispenser.',
        Time: 1.8,
        LastDone: "2019-01-30T12:00:00.000Z"
    },
    mop: {
        Tag: 'mop',
        Title: 'Mop',
        Description: 'Mop the floor. Add one pump from the wall-mounted detergent dispenser to a bucket 1/3rd full of water.',
        Time: 0.8,
        LastDone: "2019-01-29T12:00:00.000Z"
    },
    probe: {
        Tag: 'probe',
        Title: 'Probe Toasties',
        Description: 'Probe 2 toasties (or reach closing time having made at most 1 toastie).',
        Time: 0.2,
        LastDone: "2019-01-30T12:00:00.000Z"
    },
    dishes: {
        Tag: 'dishes',
        Title: 'Dishes',
        Description: 'Remove all clean dishes from the drying rack, ensure the cutlery box is closed. Wash dishes from shift with soap and hot water, leave to dry on rack',
        Time: 0.2,
        LastDone: "2019-01-30T12:00:00.000Z"
    },
    microwave: {
        Tag: 'microwave',
        Title: 'Microwave',
        Description: 'Clean inside microwave with detergent, wipe down with wet sponge. Don\'t forget the top!',
        Time: 4,
        LastDone: "2019-01-23T12:00:00.000Z"
    },
    counter: {
        Tag: 'counter',
        Title: 'Counter',
        Description: 'Clear and wipe down the counters(customer facing and coffee machine)',
        Time: 7,
        LastDone: "2019-01-29T12:00:00.000Z"
    }
};
let tasks = ["veg", "coffee", "probe", "dishes", "mop", "microwave", "counter"];
let afternoon = ["veg", "coffee", "probe", "dishes", "microwave", "counter"];
let evening = ["probe", "dishes", "mop", "counter", "microwave"];

function redact(username) {
    let person = people[username];
    return {surname: person.surname, forename: person.forename};


}


app.get('/test', function (req, res) {
    console.log("Test called by app.test.js");
    res.send("32");
});

// authenticate a user
app.get('/auth', function (requ, resp) {
    let userName = requ.query.userName;
    let password = requ.query.password;
    if (people[userName] === undefined) {
        resp.send(false);
    } else if (people[userName]['password'] === password) {
        //console.log("Verified.");
        resp.send(people[userName].access_token);
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
});

app.get('/evening', function (request, response) {
    let eveningTasks = [];
    tasks.forEach(function (taskName) {
        if (evening.includes(taskName)) eveningTasks.push(taskDescriptions[taskName]);
    });
    let responseJSON = JSON.stringify(eveningTasks);
    response.send(responseJSON);
});

app.get('/people/:username', function (request, response) {
    let username = request.params.username;
    response.send(redact(username));
});

app.get('/people/', function (requ, resp) {
    if (admin_tokens.includes(requ.query.access_token)) {
        resp.send(people);
    } else {
        // strip out passwords and emails - sensitive data
        let redactedPeople = {};
        Object.keys(people).map(function (username) {
            redactedPeople[username] = redact(username);
        });
        resp.send(redactedPeople);
    }
});

app.get('/tasks', function (request, response) {
    response.send(JSON.stringify(taskDescriptions));
});

app.post('/removePeople', function (requ, resp) {
    console.log("removePeople POST called");
    if (admin_tokens.includes(requ.body.access_token)) {
        let username = requ.body.username;
        if (username) {
            if (Object.keys(people).includes(username)) {
                //delete user from set of people
                delete people[username];
                resp.sendStatus(200);
                console.log("Successfully removed user: " + username);

            } else {
                console.log("Username provided didn't exist in people:" + username);
                resp.sendStatus(400);
            }
        }
    } else {
        console.log("invalid auth token");
        resp.sendStatus(403);
    }
});

app.post('/removeTask', function (requ, resp) {
    console.log("removeTask POST called");
    if (admin_tokens.includes(requ.body.access_token)) {
        let taskTag = requ.body.Tag;
        if (taskTag) {
            delete taskDescriptions[taskTag];
            // ujeenator https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript
            afternoon = afternoon.filter(item => item !== taskTag);
            evening = evening.filter(item => item !== taskTag);
            tasks = tasks.filter(item => item !== taskTag);
            resp.sendStatus(200);
            console.log("Successfully removed task: " + taskTag);
        }
        console.log("Issue raised:");
        console.log(requ.body);
    } else {
        console.log("invalid auth token");
        resp.sendStatus(403);
    }
});

app.post('/people', function (requ, resp) {
    console.log("People POST called");
    if (admin_tokens.includes(requ.body.access_token)) {
        let forename = requ.body.forename;
        let surname = requ.body.surname;
        let username = requ.body.username;
        let email = requ.body.email;
        let password = requ.body.password;
        if (forename && surname && username && email && password) {
            if (Object.keys(people).includes(username)) {
                //duplicate username not allowed
                resp.sendStatus(400);
                console.log("Rejected duplicate username");

            } else {
                people[username] = {
                    forename: forename,
                    surname: surname,
                    email: email,
                    password: password
                };
                console.log("Successfully added person:" + people[username]);
                resp.sendStatus(200);
            }
        }
    } else {
        console.log("invalid auth token");
        resp.sendStatus(403);
    }
});

app.post('/task', function (requ, resp) {
    console.log("Task POST called");
    if (admin_tokens.includes(requ.body.access_token)) {
        let taskTag = requ.body.Tag;
        let taskTitle = requ.body.Title;
        let taskDescription = requ.body.Description;
        let taskTime = requ.body.Time;
        let afternoonBool = requ.body.Afternoon;
        let eveningBool = requ.body.Evening;
        console.log("Add task: " + taskTag);
        if (taskTag && taskTitle && taskDescription && taskTime) {
            if (Object.keys(taskDescription).includes(taskTag)) {
                //duplicate tag not allowed
                resp.sendStatus(400);
                console.log("Rejected duplicate task tag");
            } else {
                taskDescriptions[taskTag] = {
                    Tag: taskTag,
                    Title: taskTitle,
                    Description: taskDescription,
                    Time: taskTime,
                    LastDone: "2000-01-30T12:00:00.000Z"
                };
                tasks.push(taskTag);
                if (afternoonBool){
                    afternoon.push(taskTag);
                }
                if (eveningBool){
                    evening.push(taskTag);
                }
                console.log("Successfully added task:" + taskTag);
                resp.sendStatus(200);
            }
        }
    } else {
        console.log("invalid auth token");
        resp.sendStatus(403);
    }
    console.log("Task POST handled.")
});

app.post('/done', function (requ, resp) {
    if (staff_tokens.includes(requ.body.access_token)) {
        let taskTag = requ.body.task;
        if (taskTag in taskDescriptions) {
            taskDescriptions[taskTag].LastDone = new Date();
            resp.send(200);
        } else {
            resp.send(400);
        }
    } else {
        resp.send(403);
    }
});

module.exports = app;