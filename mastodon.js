// routes/oauth/mastodon.js

const request = require('request');

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
    scopes: 'read:accounts',
  };

  // `request` does not return a Promise, but our `/callback` route handler expects a Promise.
  // We'd better make one.
  return new Promise((resolve, reject) => {
    // Post the `params` as form data to the `tokenURI` endpoint to retrieve an access token.
    request.post({ url: tokenURI, formData: params }, (err, h, b) => {
      if (err) {
        reject(err);
      }

      // Parse the response body for the token
      const token = JSON.parse(b).access_token;
      console.log('(2) ACCESS TOKEN:', token);

      // Use the token to GET the user's profile
      return request.get(
        profileURI,
        { headers: { Authorization: `Bearer ${token}` } },
        (e, res, body) => {
          if (e) {
            reject(e);
          }

          if (res.statusCode !== 200) {
            reject(`statusCode: ${res.statusCode}`);
          }

          // Here, the response body contains the profile information
          // we need for our app. You can log `parsed` to see all the data included.
          const parsed = JSON.parse(body);
          // normalize profile
          const profile = {
            created_at: parsed.created_at,
            picture: parsed.avatar,
            nickname: parsed.display_name,
            user_id: parsed.id,
            username: parsed.username,
          };
          console.log('(3) USER PROFILE:', profile);

          resolve(profile);
        }
      );
    });
  });
};

// Right now, just leave `revoke` as a placeholder
const revoke = (req) => {
  const opts = {
    client_id: process.env.MASTODON_CLIENT_ID,
    client_secret: process.env.MASTODON_CLIENT_SECRET,
  };
  const logoutURI = `${process.env.MASTODON_INSTANCE_URI}/oauth/revoke`;

  return new Promise((resolve, reject) => {
    request.post({ url: logoutURI, formData: opts }, (err, h, b) => {
      if (err) {
        reject(err);
      }
      const result = JSON.parse(b);
      resolve(result);
    });
  });
};

module.exports = { authorize, revoke };
