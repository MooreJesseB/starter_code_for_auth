var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  , env       = process.env.NODE_ENV || 'development'
  , config    = require(__dirname + '/../config/config.json')[env]
  , sequelize = new Sequelize(config.database, config.username, config.password, config)
  , db        = {}

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

// saving this stuff for sequelize syntax purposes

// db.user.find(4).success(function(user) {
//   var post = db.post.build({title: "Here comes the sun.", body: "Lorem ipsum dolor"});
//   user.addPost(post).success(function(post) {
//       console.log("TRYING TO ADD A SECOND POST", post);
//   });
// });

// db.user.findOrCreate({username: "mangoman", password: "mangoman"}).success(function(user) {
//   var post = db.post.build({title: "Here comes the sun.", body: "Lorem ipsum dolor"});
//   user.addPost(post).success(function(post) {
//       console.log(post);
//     })
// });


module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db)
