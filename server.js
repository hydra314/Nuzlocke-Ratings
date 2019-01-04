const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const { homePage } = require('./routes/index');
const {
  registerPage,
  register,
  loginPage,
  login,
  deletePlayer,
  editPlayer,
  editPlayerPage
} = require('./routes/player');
const { 
  addRunPage, 
  addRun, 
  displayRuns 
} = require('./routes/run');
const {
  overallInfo,
  basegameInfo,
  ruleInfo,
  titleInfo,
  viabilityInfo
} = require('./routes/info');
const db = require('./db');
const logger = require('./logger');

const port = process.env.PORT || 3000;

const app = express();
app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
// session for maintaining logins
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'allhailgoomy',
    store: db.sessionStore,
    resave: false,
    saveUninitialized: false
  })
);

// helper function to render a page, useful for standardizing all pages
app.locals.render = (req, res, page, data) => {
  res.render('template-page.ejs', {
    player: req.session.player,
    page,
    ...data
  });
};

// helper function to show an error page if an error occurs
app.locals.error = (req, res, err) => {
  app.locals.render(req, res.status(500), 'error.ejs', {
    title: 'Nuzlocke Ratings | Error'
  });
  logger.error(err);
};

// helper function to show access denied page
app.locals.forbidden = (req, res) => {
  app.locals.render(req, res.status(403), 'forbidden.ejs', {
    title: 'Nuzlocke Ratings | Access Denied'
  });
  logger.log(
    'Access denied for ' +
      req.session.player.username +
      ' accessing ' +
      req.path
  );
};

app.get('/', homePage);

app
  .route('/register')
  .get(registerPage)
  .post(register);

app
  .route('/login')
  .get(loginPage)
  .post(login);

app.get('/logout', (req, res) => {
  delete req.session.player;
  res.redirect('/');
});

app
  .route('/add-run')
  .get(addRunPage)
  .post(addRun);

app
  .route('/edit/:username')
  .get(editPlayerPage)
  .post(editPlayer);

app.get('/delete/:username', deletePlayer);
app.get('/:username/runs', displayRuns);
app.get('/info', overallInfo);
app.get('/info/basegames', basegameInfo);
app.get('/info/rules', ruleInfo);
app.get('/info/titles', titleInfo);
app.get('/info/viability', viabilityInfo);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
