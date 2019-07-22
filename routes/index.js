const { Router } = require('express');

const router = Router();

/* GET index page. */
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Mastodon OAuth Demo',
    instance: process.env.MASTODON_INSTANCE_NAME
  });
});

module.exports = router;
