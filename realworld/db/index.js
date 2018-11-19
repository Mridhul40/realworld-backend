const Sequelize = require('sequelize')
const { user, article, comment, tag } = require("./models")


const db = new Sequelize({
    dialect: 'sqlite',
    storage: __dirname + '/store.db'
})

const User = db.define('user', user)
const Article = db.define('article', article)
const Comment = db.define('comment', comment)
const Tag = db.define('tag', tag)

//Relationship (foreign key)
Article.belongsTo(User)
User.hasMany(Article)

Comment.belongsTo(User)
User.hasMany(Comment)

Comment.belongsTo(Article)
Article.hasMany(Comment)

Tag.belongsTo(Article)
Article.hasMany(Tag)

module.exports = {
    db,
    User,
    Article,
    Comment,
    Tag
}