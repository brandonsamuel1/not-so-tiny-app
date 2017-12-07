const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
//app.use = express();
app.use(cookieParser());

// Get currentUser
app.use((req, res, next) => {

  var cookieUser = req.cookies["newUser"];

  res.locals.currentUser = users[cookieUser] || null;

  next();

});

// app.use((req, res, next) => {
//   app.locals.email = req.cookies["user_id"] ? users[req.cookies["user_id"]].email : null;
//   next();
// });

app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2"
  }
};

var users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



function generateRandomString() {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUWVXYZ';
  alphabet = alphabet + alphabet.toLowerCase() + '0123456789';
  let randomString = '';
  for (var i = 0 ; i < 6; i++) {
    var index = Math.floor(Math.random() * alphabet.length);
    randomString += alphabet[index];
  }
  return randomString;
}

function findUser (userId) {
  return users[userId];
}

function findUserByEmail(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
}

function checkUserLogin(email, password){
  for(var k in users){
    if(users[k].email === email && users[k].password === password){
      return (users[k]);
    }
  }
}

app.get("/", (request, response) => {
  response.redirect("/registration");
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/registration", (request, response) => {
  response.render("registration");
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.get("/error", (request, response) => {
  console.log("about to render error page");
  response.render("error");
});

app.get("/urls", (request, response) => {

  const templateVars = {
    urls: urlDatabase
  };

  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let user = findUser(request.cookies["newUser"])
  let templateVars = {
    urls: urlDatabase
  };

  if(!user) {
    //response.send("You are not logged in.\nIf you don't have an account, click here to register. Otherwise, click her to log in!");
    response.redirect("/error");
    return;
  }

  response.render("urls_new", templateVars);
});

app.get("/urls/:id", (request, response) => {
  //console.log(typeof request.params.id)

  // let username = undefined

  // if (request.cookies["username"]) {
  //   username = request.cookies["username"]
  // }

  let templateVars = {
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id]
  };
  // response.redirect(longURL);
  response.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  const longURL = urlDatabase[shortURL];
  response.redirect(longURL);
});

app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body.longURL;

  urlDatabase[shortURL] = longURL;
  response.redirect("/urls");
});

app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
  delete urlDatabase[shortURL];
  response.redirect("/urls");
});

app.post("/urls/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL = urlDatabase[shortURL];
  urlDatabase[shortURL] = request.body.newUrl;
  response.redirect("/urls");
})

app.post("/login", (request, response) => {
  //let userCookie = request.cookies["newUser"];
  let userEmail = request.body.email;
  let userPassword = request.body.password;
  //1 condition to check that user enters both
  if(!userEmail || !userPassword){
    response.send("You forgot to enter your email and password!");
  } else { //if they enter both then we check for username and password combination
    //check for the user and password matches
    var user = checkUserLogin(userEmail, userPassword);
    if(user){ //if its true
      response.cookie("newUser", user.id);
      response.redirect("/urls")
    } else { //username and password were wrong.
      response.send("Email and password don't match!");
    }
  }
});

app.post("/logout", (request, response) => {
  response.clearCookie("newUser")
  response.redirect("/login");
});

app.post("/registration", (request, response) => {
  let id = generateRandomString();
  let email = request.body.email;
  let password = request.body.password;

  if(email == '' || password == '') {
    response.status(400).send('Bad Request: Please fill in email and password');
    return;
  }

  for (let id in users) {
    if (users[id].email === email) {
      response.status(400).send('User already exists!');
      return;
    }
  };

  users[id] = {
    id: id,
    email: email,
    password: password
  };

  response.cookie("newUser", id);
  response.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
















