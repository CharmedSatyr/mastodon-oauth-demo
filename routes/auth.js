const { Router } = require('express');

const { authorize, revoke } = require('./oauth/mastodon');

const router = Router();

/* GET login - redirects to OAuth endpoint with query string. */
router.get('/login', (req, res) => {
  const authEndpoint = `${process.env.MASTODON_INSTANCE_URI}/oauth/authorize`;

  // Set up parameters for the query string
  const options = {
    client_id: process.env.MASTODON_CLIENT_ID,
    redirect_uri: process.env.MASTODON_REDIRECT_URI,
    response_type: 'code',
    scope: process.env.MASTODON_SCOPES
  };

  // Generate the query string
  const queryString = Object.keys(options)
    .map(key => `${key}=${encodeURIComponent(options[key])}`)
    .join('&');

  // Redirect the user with app credentials to instance sign in
  const loginURI = `${authEndpoint}?${queryString}`;
  res.redirect(loginURI);
});

/* GET OAuth callback */
router.get('/callback', (req, res) => {
  authorize(req)
    .then((user) => {
      req.session.user = user;
      res.redirect('/user');
    })
    .catch((err) => {
      console.error(err);
      res.redirect('/');
    });
});

/* GET logout - destroys local session and revokes API token. */
router.get('/logout', (req, res) => {
  revoke(req)
    .then((response) => {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect('/');
      });
    })
    .catch(console.error);
});

module.exports = router;
