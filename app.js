const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const sql = require('mssql');
const { connect } = require('http2');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

const config = {
  user: 'library',
  password: 'L!braries',
  server: 'mongodb://localhost:27017',
  database: 'ArpeggioLessons',
}

sql.connect(config).catch((err) => {
  debug(err);
});
app.use(morgan('combined'));
app .use((req, res, next) => {
  debug('my middleware');
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(session({secret: 'library'}));

require('./src/config/passport.js')(app);

app.use(express.static(path.join(__dirname, '/public')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const nav = [
  { link: '/books', title: 'Book' },
  { link: '/authors', title: 'Author' }
];

const bookRouter = require('./src/routes/bookRoutes')(nav);
const adminRouter = require('./src/routes/adminRoutes')(nav);

app.use('/books', bookRouter);
app.use('/admin', adminRouter);
app.get('/', (req, res) => {
  res.render(
    'index',
    {
      nav: [{ link: '/books', title: 'Books' },
      { link: '/authors', title: 'Authors' }],
      title: 'Arpeggio'
    }
  );
});

app.listen(3000, () => {
  debug(`listening on port ${chalk.cyan(port)}`);
});
