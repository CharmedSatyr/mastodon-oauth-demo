// routes/oauth/mastodon.js

const superagent = require('superagent');

const authorize = (req) => {
  // The authorization code returned from Mastodon on a successful login
  const { code } = req.query;
  console.log('(1) AUTHORIZATION CODE:', code);

  // Token endpoint
  const tokenURI = `${process.env.MASTODON_INSTANCE_URI}/oauth/token`;

  // Profile endpoint
  const profileURI = `${process.env.MASTODON_INSTANCE_URI}/api/v1/accounts/verify_credentials`;

  // Parameters to send for a token
  const params = {
    client_id: process.env.MASTODON_CLIENT_ID,
    client_secret: process.env.MASTODON_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.MASTODON_REDIRECT_URI,
    scopes: 'read:accounts'
  };

  // Post the `params` as form data to the `tokenURI` endpoint
  // to retrieve an access token.
  // `superagent` returns a Promise by default.
  return superagent
    .post(tokenURI)
    .type('form')
    .send(params)
    .then((tokenResponse) => {
      // Access the token in the response body
      const token = tokenResponse.body.access_token;
      console.log('(2) ACCESS TOKEN:', token);

      // Use the token to GET the user's profile
      return superagent
        .get(profileURI)
        .set('Authorization', `Bearer ${token}`)
        .then((profileResponse) => {
          // The response body contains the profile information needed
          // for the app. Log `p` to see all the data included.
          const p = profileResponse.body;

          // Normalize the profile.
          const profile = {
            created_at: p.created_at,
            picture: p.avatar,
            nickname: p.display_name,
            user_id: p.id,
            username: p.username
          };
          console.log('(3) USER PROFILE:', profile);

          return profile;
        })
        .catch(err => err);
    });
};

const revoke = (req) => {
  const params = {
    client_id: process.env.MASTODON_CLIENT_ID,
    client_secret: process.env.MASTODON_CLIENT_SECRET
  };
  const logoutURI = `${process.env.MASTODON_INSTANCE_URI}/oauth/revoke`;
  return superagent
    .post(logoutURI)
    .type('form')
    .send(params)
    .then(response => response)
    .catch(err => err);
};

module.exports = { authorize, revoke };
