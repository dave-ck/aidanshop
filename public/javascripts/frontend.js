let loggedInAs = null;
let access_token = "";
$('#failedLoginText').hide();
$('#failedAddPeople').hide();
$('.loggedIn').hide();

// thanks to Nico Tejera at https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
// returns something like "access_token=concertina&username=bobthebuilder"
function serialise(obj) {
    return Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
}

function updateNames(names) {
    let nameList = "<ul>";
    let fLen = names.length;
    for (i = 0; i < fLen; i++) {
        nameList += "<li>" + names[i] + "</li>";
    }
    nameList += "</ul>";
    $('#namesSpan').html(nameList);
}

function afternoon() {
    $.get("./afternoon", function (jsonTaskList) {
        let taskList = JSON.parse(jsonTaskList);
        console.log(taskList);
        updateTasks($('#afternoonPills'), $('#afternoonContents'), taskList, "afternoon");
    });
}

function evening() {
    $.get("./evening", function (jsonTaskList) {
        let taskList = JSON.parse(jsonTaskList);
        updateTasks($('#eveningPills'), $('#eveningContents'), taskList, "evening");
    });
}

function refreshLoggedIn(uName) {
    // log in button
    let text = " Log in";
    let classes = "glyphicon glyphicon-log-in";
    if (uName != null) {
        text = " " + loggedInAs;
        classes = "glyphicon glyphicon-user";
    }
    $('#loginLink').html(`<span class="${classes}"></span> ${text}`);
}

function updateTasks(pillDiv, contentDiv, taskList, afteve) {
    let pillHTML = "";
    let contentHTML = "";
    let listLen = taskList.length;
    console.log(taskList[0]);
    let now = new Date();
    for (i = 0; i < listLen; i++) {
        let task = taskList[i];
        let taskName = task.Title;
        let pill = `<li><a id="${afteve}Pill${i}" data-toggle=\"tab\" href=\"#${afteve}${i}\"> Item: ${taskName} </a></li>`;
        let lastDone = new Date(task.LastDone);
        let timeDelta = now - lastDone;
        let daysDelta = timeDelta / (1000 * 60 * 60 * 24);
        let btnStyle = "btn-success";
        let urgencyCaption = "Task has been done.";
        if (daysDelta > 0.2) {
            btnStyle = "btn-warning";
            urgencyCaption = "Not yet done this shift."
        }
        if (daysDelta > task.Time) {
            btnStyle = "btn-danger";
            urgencyCaption = "Task must be done this shift."
        }
        let taskDiv = `<h4>${taskName}</h4><p>${task.Description}</p><p>${urgencyCaption}</p><button id="${afteve + i}Done" type="button" class="btn ${btnStyle}">Done!</button>`;
        let content = `<div id=\"${afteve}${i}\" class=\"tab-pane fade\">${taskDiv}</div>`;
        pillHTML += pill;
        contentHTML += content;
    }
    pillDiv.html(pillHTML);
    contentDiv.html(contentHTML);
    for (i = 0; i < listLen; i++) {
        let task = taskList[i];
        $(`#${afteve + i}Done`).on('click', function () {
            let button = this;
            $.post("./done", serialise({
                access_token: access_token,
                task: task.Tag
            }), function (status) {
                console.log(typeof this);
                console.log(this);
                button.classList.add("btn-success");
                button.classList.remove("btn-warning", "btn-danger");
                console.log("Task accepted as done:" + status);
            });

        });
        console.log("Button linked: " + i);
    }
}


function peopleTable(people) {
    let tableHTML = "";
    Object.keys(people).forEach(function (username) {
        let forename = people[username].forename;
        let surname = people[username].surname;
        let email = people[username].email;
        let password = people[username].password;
        tableHTML += `<tr><td>${username}</td><td>${forename}</td><td>${surname}</td><td>${email}</td><td>${password}</td></tr>`;
    });
    $('#userTableBody').html(tableHTML);
}

function taskTable(tasks) {
    let tableHTML = "";
    Object.keys(tasks).forEach(function (taskTag) {
        let taskTitle = tasks[taskTag].Title;
        let taskDescription = tasks[taskTag].Description;
        let taskFrequency = tasks[taskTag].Time;
        tableHTML += `<tr><td>${taskTag}</td><td>${taskTitle}</td><td>${taskDescription}</td><td>${taskFrequency}</td></tr>`;
    });
    $('#taskTableBody').html(tableHTML);
}



$('#afternoonLink').on('click', afternoon);
$('#eveningLink').on('click', evening);
$('#deleteAccountForm').on('submit', function (formOut) {
    formOut.preventDefault();
    let username = this.elements[0].value;
    console.log("Deleting: " + username);
    if (username === loggedInAs) {
        alert("You can't delete the account you are currently logged in as!");
        return false;
    }
    $.post("./removePeople", serialise({
        access_token: access_token,
        username: username
    }), function (status) {
        console.log("Remove person status: " + status);
    });
    return false;
});

$('#deleteTaskForm').on('submit', function (formOut) {
    formOut.preventDefault();
    let taskTag = this.elements[0].value;
    console.log("Deleting: " + taskTag);
    $.post("./removeTask", serialise({
        access_token: access_token,
        Tag: taskTag
    }), function (status) {
        console.log("Remove task status: " + status);
    });
    return false;
});


$('#loginForm').on('submit', function (formOut) {
    formOut.preventDefault();
    $('.loggedOut').hide();
    $('.loggedIn').show();

    let username = this.elements[0].value;
    let password = this.elements[1].value;
    $.get("./auth", "userName=" + username + "&password=" + password,
        function (authenticated) {
            if (authenticated) {
                loggedInAs = username;
                access_token = authenticated;
                console.log("Access token granted: " + access_token);
                $('#failedLoginText').hide();
            } else {
                console.log("Failed to log in");
                $('#failedLoginText').show();
            }
            refreshLoggedIn(loggedInAs);
        });
    return false;
});

$('#createAccount').on('submit', function (formOut) {
    formOut.preventDefault();
    let username = this.elements[0].value;
    let password = this.elements[1].value;
    let confirmPassword = this.elements[2].value;
    if (password !== confirmPassword) return false;
    let forename = this.elements[3].value;
    let surname = this.elements[4].value;
    let email = this.elements[5].value;
    $.post("./people", serialise({
        access_token: access_token,
        username: username,
        forename: forename,
        surname: surname,
        email: email,
        password: password
    }), function (status) {
        console.log("Add person status:" + status);
    });
});

$('#addTask').on('submit', function (formOut) {
    formOut.preventDefault();
    let taskTag = this.elements[0].value;
    let taskName = this.elements[1].value;
    let taskDescription = this.elements[2].value;
    let taskTime = this.elements[3].value;
    console.log(taskTag);
    let afternoon = true;
    let evening = true;
    $.post("./task", serialise({
        access_token: access_token,
        Tag: taskTag,
        Title: taskName,
        Description: taskDescription,
        Time: taskTime,
        Afternoon: afternoon,
        Evening: evening
    }), function (status) {
        console.log("Add task status:" + status);
    });
    return false;
});

$('#manageAccountsPill').on('click', function () {
    $.get("./people", serialise({access_token: access_token}), function (people) {
        console.log(people);
        peopleTable(people);
    });
});

$('#manageTasksPill').on('click', function () {
    $.get("./tasks", function (tasks) {
        console.log(tasks);
        taskTable(JSON.parse(tasks));
    });
});
