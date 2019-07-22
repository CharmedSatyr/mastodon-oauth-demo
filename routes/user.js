const { Router } = require('express');

const router = Router();

/* GET user profile. */
router.get('/user', (req, res) => {
  res.render('user', {
    instance: process.env.MASTODON_INSTANCE_NAME,
    title: 'User Profile',
    user: req.session.user
  });
});

module.exports = router;
