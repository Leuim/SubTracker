passFlashMessageToView = (req, res, next) => {
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  next();
}
module.exports = passFlashMessageToView
