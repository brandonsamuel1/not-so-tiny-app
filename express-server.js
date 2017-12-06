const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
//app.use = express();
app.use(cookieParser());

app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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

app.get("/", (request, response) => {
  response.end("Hello!!");
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/urls", (request, response) => {
  let username = request.body.username
  let templateVars = {
    urls: urlDatabase,
    username: request.cookies["newUser"]
  };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/:id", (request, response) => {
  //console.log(typeof request.params.id)

  // let username = undefined

  // if (request.cookies["username"]) {
  //   username = request.cookies["username"]
  // }

  let templateVars = {
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id],
    username: request.cookies["newUser"]
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
  response.cookie("newUser", request.body.username);
  response.redirect("/urls");
});

app.post("/logout", (request, response) => {
  response.clearCookie("newUser")
  response.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});