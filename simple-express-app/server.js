const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3000;
const app = express();

app.listen(PORT);

app.use(bodyParser.urlencoded({ extended: true }));

let LoggedIn = false;

function mainPage(req, res) {
    res.sendFile(path.join(__dirname, "/static/main.html"));
}

app.get("/", mainPage);
app.get("/main", mainPage);
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "/static/login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "/static/register.html")));

const templateTop = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User info</title>
    <link rel="stylesheet" href="css/userinfo.css">
</head>

<body>
    <div class="main">
        <div class="nav">
            <a href="/sort">Sort</a>
            <a href="/gender">Gender</a>
            <a href="/show">Show</a>
        </div class="content">`;

const templateBottom = `
</div>
</div>
</body>

</html>`;

const sortAscForm = `
    <form onchange="submit()" method="POST">
        <input type="radio" id="ascending" name="sorttype" value="asc" checked>
        <label for="ascending">Ascending</label>

        <input type="radio" id="descending" name="sorttype" value="desc">
        <label for="descending">Descending</label>
    </form>
`;

const sortDescForm = `
    <form onchange="submit()" method="POST">
        <input type="radio" id="ascending" name="sorttype" value="asc">
        <label for="ascending">Ascending</label>

        <input type="radio" id="descending" name="sorttype" value="desc" checked>
        <label for="descending">Descending</label>
    </form>
`;

app.get("/admin", (req, res) => {
    if (LoggedIn) {
        res.sendFile(path.join(__dirname, "/static/admin.html"));
    } else {
        res.status(401).sendFile(path.join(__dirname, "/static/access_denied.html"));
    }
});

app.get("/sort", (req, res) => {
    if (LoggedIn) {
        users.sort((a, b) => a.age - b.age);
        let htmlForm = sortAscForm;
        let htmlTable = createSortTable();
        let document = templateTop + htmlForm + htmlTable + templateBottom;
        res.send(document);
    } else {
        res.status(401).sendFile(path.join(__dirname, "/static/access_denied.html"));
    }
});

app.post("/sort", (req, res) => {
    if (LoggedIn) {
        let htmlForm;
        if (req.body.sorttype === "asc") {
            users.sort((a, b) => a.age - b.age);
            htmlForm = sortAscForm;
        } else {
            users.sort((a, b) => b.age - a.age);
            htmlForm = sortDescForm;
        }
        let htmlTable = createSortTable();
        let document = templateTop + htmlForm + htmlTable + templateBottom;
        res.send(document);
    } else {
        res.status(401).sendFile(path.join(__dirname, "/static/access_denied.html"));
    }
});

app.get("/gender", (req, res) => {
    if (LoggedIn) {
        users.sort((a, b) => a.gender.localeCompare(b.gender));
        let htmlTable = createGenderTables();
        let document = templateTop + htmlTable + templateBottom;
        res.send(document);
    } else {
        res.status(401).sendFile(path.join(__dirname, "/static/access_denied.html"));
    }
});

app.get("/show", (req, res) => {
    if (LoggedIn) {
        users.sort((a, b) => a.id - b.id);
        let htmlTable = createShowTable();
        let document = templateTop + htmlTable + templateBottom;
        res.send(document);
    } else {
        res.status(401).sendFile(path.join(__dirname, "/static/access_denied.html"));
    }
});

app.get("/logout", (req, res) => {
    if (LoggedIn) {
        LoggedIn = false;
        res.redirect("/");
    } else {
        res.status(401).send("You aren't logged in! You can't log out");
    }
});

function createShowTable() {
    let tableStr = "";
    tableStr += "<table>";
    users.forEach((user) => {
        tableStr += `
            <tr>
                <td>Id: ${user.id}</td>
                <td>User: ${user.login} - ${user.password}</td>
                <td>Student: <input type="checkbox" disabled ${(() => { if (user.student) return "checked"; return ""; })()}></td>
                <td>Age: ${user.age}</td>
                <td>Gender: ${user.gender}</td>
            </tr>
        `;
    });
    tableStr += "</table>";
    return tableStr;
}

function createGenderTables() {
    let tableStr = "";
    let lastGender = "";
    tableStr += "<table>";
    tableStr += '<col style="width: 40%">';
    tableStr += '<col style="width: 60%">';
    users.forEach((user) => {
        if (lastGender && lastGender !== user.gender) {
            tableStr += "</table>";
            tableStr += "<table>";
            tableStr += '<col style="width: 40%">';
            tableStr += '<col style="width: 60%">';
        }
        lastGender = user.gender;
        tableStr += `
            <tr>
                <td>Id: ${user.id}</td>
                <td>Gender: ${user.gender}</td>
            </tr>
        `;
    });
    tableStr += "</table>";
    return tableStr;
}

function createSortTable() {
    let tableStr = "";
    tableStr += "<table>";
    tableStr += '<col style="width: 26%">';
    tableStr += '<col style="width: 48%">';
    tableStr += '<col style="width: 26%">';
    users.forEach((user) => {
        tableStr += `
            <tr>
                <td>Id: ${user.id}</td>
                <td>User: ${user.login} - ${user.password}</td>
                <td>Age: ${user.age}</td>
            </tr>
        `;
    });
    tableStr += "</table>";
    return tableStr;
}

let id = 6;

let users = [
    {
        id: 1, login: "AAA", password: "PASS1", age: 10, student: true, gender: "male",
    },
    {
        id: 2, login: "BBB", password: "PASS2", age: 12, student: false, gender: "female",
    },
    {
        id: 3, login: "CCC", password: "PASS3", age: 9, student: true, gender: "male",
    },
    {
        id: 4, login: "DDD", password: "PASS4", age: 14, student: false, gender: "female",
    },
    {
        id: 5, login: "EEE", password: "PASS5", age: 3, student: true, gender: "male",
    },
];

app.post("/registerForm", (req, res) => {
    let { body } = req;
    let { login } = body;
    if (users.some((obj) => obj.login === login)) {
        res.send("Sorry, user with this nickname already exists");
    } else {
        users.push({
            id: id++,
            login,
            password: body.password,
            age: parseInt(body.age),
            student: body.student === "on",
            gender: body.gender,
        });
        res.send(`${login}, registration completed succesfuly!`);
    }
});
app.post("/loginForm", (req, res) => {
    let { body } = req;
    let { login } = body;
    let userObj = users.find((obj) => obj.login === login);
    if (userObj) {
        if (body.password === userObj.password) {
            LoggedIn = true;
            res.redirect("/admin");
        } else {
            res.send(`Incorrect password!`);
        }
    } else {
        res.send(`No user found for username ${login}`);
    }
});

app.use(express.static("static"));

app.use((req, res) => {
    res.sendStatus(404);
});
