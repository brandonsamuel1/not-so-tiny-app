const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

// Get currentUser
app.use((req, res, next) => {
  var cookieUser = req.session.newUser;
  res.locals.currentUser = users[cookieUser] || null;
  next();
});


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
    //password: "purple-monkey-dinosaur"
    password: "$2a$10$4EMS7aLyrN71l9HV7igC9eG9pU1mJOzUPme6JzMsnWfyGX5AwcIWK"
  },
 "user2": {
    id: "user2",
    email: "user2@example.com",
    //password: "dishwasher-funk"
    password: "$2a$10$HjnbCvHTr6UqRQy9g6Ec7.WTupfeBHRUFs4ciz//GzVE3/DH6FCGW"
  }
}

function getUrlsOfUser(userId) {
  const urls = {};
  for(key in urlDatabase) {
    const entry = urlDatabase[key];
    if(entry.userID === userId) {
      urls[key] = {
        userID: userId,
        longURL: entry.longURL
      }
    }
  }
  return urls;
}

function generateRandomString() {
  let alphabet = 'ABCDEFGHIJKLMNOPQRSTUWVXYZ';
  alphabet = alphabet + alphabet.toLowerCase() + '0123456789';
  let randomString = '';
  for(var i = 0 ; i < 6; i++) {
    var index = Math.floor(Math.random() * alphabet.length);
    randomString += alphabet[index];
  }
  return randomString;
}

function findUser(userId) {
  return users[userId];
}

function findUserByEmail(email) {
  for(let id in users) {
    if(users[id].email === email) {
      return users[id];
    }
  }
}

function checkUserLogin(email, password){
  for(var k in users){
    if(users[k].email === email){
      if(bcrypt.compareSync(password, users[k].password)) {
        return (users[k]);
      }
    }
  }
}

function addhttp(url) {
  if(!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "http://" + url;
  }
  return url;
}

app.get("/", (request, response) => {
  response.redirect("/registration");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/users.json", (request, response) => {
  response.json(users);
});

app.get("/registration", (request, response) => {
  response.render("registration");
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.get("/error", (request, response) => {
  response.render("error");
});

app.get("/urls/:id/delete", (request, response) => {
  response.send("Excuse me, you do not own this URL")
})

// Front page of Tiny App when user logs in to see all their urls

app.get("/urls", (request, response) => {
  const uid = request.session.newUser;
  let user = findUser(uid);
// Checks to see if user is logged in before showing urls page
  if(!user) {
    response.redirect("/error");
    return;
  }

  const urls = getUrlsOfUser(uid);
  const templateVars = {
    urls: urls
  };
  response.render("urls_index", templateVars);
});



app.get("/urls/new", (request, response) => {
  const uid = request.session.newUser;
  let user = findUser(uid);
  let templateVars = {
    urls: urlDatabase
  };
// Checks to see if user is logged in before being able to create a new url
  if(!user) {
    response.redirect("/error");
    return;
  }
  response.render("urls_new", templateVars);
});



app.get("/urls/:id", (request, response) => {
  const uid = request.session.newUser;
  let user = findUser(uid);
  let templateVars = {
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id]
  };
// Checks to see if user is logged in before update that url
  if(!user) {
    response.redirect("/error");
    return;
  }
  response.render("urls_show", templateVars);
});


// Redirect page to the long url
app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  const url = urlDatabase[shortURL];
// Checks to see if url is a valid url
  if(!url) {
    response.send("The shortURL you are trying to reach does not exist!");
    return;
  }
  const longURL = url.longURL;
// If user did not include  http:// when creating a short url, this function will add append it to the url
// so the url can redirect without issues
  response.redirect(addhttp(longURL));
});



app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body.longURL;
  const uid = request.session.newUser;
  let user = findUser(uid);

  if(!user) {
    response.redirect("/error");
    return;
  }

  urlDatabase[shortURL] = {
    longURL,
    userID: request.session.newUser
  };
  response.redirect("/urls");
});



app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
// Checks database to see if the user owns that url they are trying to delete
  if(request.session.newUser !== urlDatabase[shortURL]["userID"]) {
    return response.send("Excuse me, you do not own this URL!")
  }
  delete urlDatabase[shortURL];
  response.redirect("/urls");
});



app.post("/urls/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL = request.body.newUrl;
// Checks to see if the user owns the url they are trying to update
  if(request.session.newUser !== urlDatabase[shortURL]["userID"]) {
    return response.send("Excuse me, you do not own this URL!")
  }
  urlDatabase[shortURL].longURL = longURL

  response.redirect("/urls");
})



app.post("/login", (request, response) => {
  let userEmail = request.body.email;
  let userPassword = request.body.password;
// Checks to see if there is something in the textbox during log in. Also checks if email and password match
  if(!userEmail || !userPassword){
    response.send("You forgot to enter your email and password!");
    return;
  }

  var user = checkUserLogin(userEmail, userPassword);

  if(user) {
    request.session.newUser = user.id;
    response.redirect("/urls")
    return;
  }

  response.send("Email and password don't match!");
});



app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/login");
});



app.post("/registration", (request, response) => {
  let id = generateRandomString();
  let email = request.body.email;
  let password = request.body.password;
// Checks to see if any inputs are present
  if(email == '' || password == '') {
    response.status(400).send('Bad Request: Please fill in email and password');
    return;
  }
// Checks to see if an email exists already in the "database"
  for (let id in users) {
    if (users[id].email === email) {
      response.status(400).send('User already exists!');
      return;
    }
  };
// Gives users a secured password
  let hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };

  request.session.newUser = id;
  response.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
















