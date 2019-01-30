let loggedInAs = null;
$('#failedLoginText').hide();
$('#failedAddPeople').hide();

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
        updateTasks($('#afternoonPills'), $('#afternoonContents'), taskList);
    });
}

function refreshLoggedIn(uName) {
    // log in button
    let text = " Log in";
    let classes = "glyphicon glyphicon-log-in"
    if (uName != null) {
        text = " " + loggedInAs;
        classes = "glyphicon glyphicon-user";
    }
    $('#loginLink').html(`<span class="${classes}"></span> ${text}`);
}

function updateTasks(pillDiv, contentDiv, taskList) {
    let pillHTML = "";
    let contentHTML = "";
    let listLen = taskList.length;
    console.log(taskList);
    console.log(taskList[0]);
    for (i = 0; i < listLen; i++) {
        let task = taskList[i];
        let taskName = task.Title;
        let pill = `<li><a id="afternoonPill${i}" data-toggle=\"tab\" href=\"#afternoon${i}\"> Item: ${taskName} </a></li>`;
        let taskDiv = `<h4>${taskName}</h4>
                       <p>${task.Description}</p>`;
        let content = `<div id=\"afternoon${i}\" class=\"tab-pane fade\">${taskDiv}</div>`;
        pillHTML += pill;
        contentHTML += content;
        console.log("Content generated.")
    }
    pillDiv.html(pillHTML);
    contentDiv.html(contentHTML);
    for (i = 0; i < listLen; i++) {
        $(`#afternoonPill${i}`).on('click', function () {
            console.log("Attempting to load dynamic content.");
        });
        console.log("Pill linked: " + i);
    }
    console.log("Content loaded.")
}


$('#afternoonLink').on('click', afternoon);

// logging in
$('#loginForm').on('submit', function (formOut) {
    formOut.preventDefault();
    let uname = this.elements[0].value;
    let pwd = this.elements[1].value;
    $.get("./auth", "userName=" + uname + "&password=" + pwd,
        function (authenticated) {
            if (authenticated) {
                loggedInAs = uname;
                $('#failedLoginText').hide();
            } else {
                console.log("Failed to log in");
                $('#failedLoginText').show();
            }
            refreshLoggedIn(loggedInAs);
        });
    return false;
});