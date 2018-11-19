const { Router } = require('express')
const { Article, User, Tag, Comment } = require('../db/index')
const slugify = require('slugify')
const route = Router()

route.get('/', async(req, res) => {
    try {
        const articles = await Article.findAll({
            include: [Tag, User, Comment]
        })
        res.status(200).json({ articles: articles })
    } catch (e) {
        res.status(500).json({ message: 'Error in processing request' })
    }
})

route.get('/:slug', async(req, res) => {
    try {
        const articles = await Article.findAll({
            where: {
                slug: req.params.slug
            }
        })
        res.status(200).json({ articles: articles })
    } catch (e) {
        res.status(500).json({ message: 'Error in processing request' })
    }
})

route.post('/', async(req, res) => {
    try {
        const jwtToken = req.header('Authorization')

        const payload = {
            title: req.body.title,
            description: req.body.description,
            body: req.body.body,
            username: req.body.username,
            tags: req.body.tags.split(',')
        }


        const user = await User.findOne({
            where: {
                username: payload.username
            }
        })

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }



        if (user.token !== jwtToken) {
            return res.status(401).json({ message: "Authentication failed" })
        }

        const slug = slugify(payload.title, {
                replacement: '-', // replace spaces with replacement
                remove: null, // regex to remove characters
                lower: true // result in lower case
            })
            // console.log(slug)

        const newArticle = await Article.create({
            slug: slug,
            title: payload.title,
            description: payload.description,
            body: payload.body,
            userId: user.id
        })

        payload.tags.forEach(async tag => {
            const newTag = await Tag.create({
                name: tag,
                articleId: newArticle.id
            })

        });

        res.status(200).json({ article: newArticle })

    } catch (e) {
        res.status(500).json({ message: e })
    }

})

route.delete("/:slug", async(req, res) => {
    try {
        const article = await Article.findOne({
            where: {
                slug: req.params.slug
            }
        })

        if (!article) {
            return res.status(404).json({ message: "Article not found" })
        }

        const user = await User.findOne({
            where: {
                id: article.userId
            }
        })
        const jwtToken = req.header("Authorization")
        if (user.token !== jwtToken) {
            return res.status(401).json({ message: "Authentication failed" })
        }

        const deleted = await Article.destroy({
            where: {
                slug: req.params.slug
            }
        })
        res.status(200).json({ message: "Article deleted" })
    } catch (e) {
        res.status(500).json(e.errors[0].message)
    }
})

route.put("/:slug", async(req, res) => {
    const jwtToken = req.header("Authorization")
    const article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })
    if (!article) {
        return res.status(400).json({ message: "Article not found" })
    }
    const payload = {}
    payload.username = req.body.username
    if (req.body.title) {
        payload.title = req.body.title
    }
    if (req.body.description) {
        payload.description = req.body.description
    }
    if (req.body.body) {
        payload.body = req.body.body
    }
    if (!req.body.username) {
        return res.status(400).json({ message: "Username must be present" })
    }

    if (payload.title) {
        const slug = slugify(payload.title, {
            replacement: '-', // replace spaces with replacement
            remove: null, // regex to remove characters
            lower: true // result in lower case
        })
        payload.slug = slug
    }

    const user = await User.findOne({
        where: {
            username: payload.username
        }
    })

    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    if (user.token !== jwtToken) {
        return res.status(401).json({ message: "Authentication failed" })
    }
    const updated = await Article.update(payload, {
        where: {
            slug: req.params.slug
        }
    })

    const updatedArticle = await Article.findOne({
        where: {
            slug: payload.slug
        }
    })

    if (req.body.tags) {
        payload.tags = req.body.tags.split(',')
    }

    payload.tags.forEach(async tag => {
        const newTag = await Tag.create({
            name: tag,
            articleId: updatedArticle.id
        })

    });

    res.status(201).json({ article: updatedArticle })
})

route.get('/:slug/comments', async(req, res) => {
    const article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })

    if (!article) {
        return res.status(404).json({ message: "Article not found" })
    }
    const comments = await Comment.findAll({
        include: [Article, User],
        where: {
            articleId: article.id
        }
    })
    res.status(200).json({ comments: comments })
})

route.delete('/:slug/comments/:id', async(req, res) => {
    const jwtToken = req.header("Authorization")
    const article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })

    if (!article) {
        return res.status(404).json({ message: "Article not found" })
    }

    const comment = await Comment.findOne({
        where: {
            id: req.params.id,
            articleId: article.id
        }
    })
    if (!comment) {
        return res.status(404).json({ message: "Comment not found" })
    }
    const user = await User.findOne({
        where: {
            id: comment.userId
        }
    })

    if (user.token !== jwtToken) {
        return res.status(401).json({ message: "Authentication failed" })
    }

    const deleteComment = await Comment.destroy({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({ message: "Comment deleted" })
})

route.post('/:slug/comments', async(req, res) => {
    const jwtToken = req.header("Authorization")
    const user = await User.findOne({
        where: {
            token: jwtToken
        }
    })

    if (!user) {
        res.status(404).json({ message: "User not found" })
    }

    const article = await Article.findOne({
        where: {
            slug: req.params.slug
        }
    })
    if (!article) {
        return res.status(400).json({ message: "Article not found" })
    }
    const payload = {
        body: req.body.body
    }

    const newComment = await Comment.create({
        body: payload.body,
        articleId: article.id,
        userId: user.id
    })

    res.status(200).json({ comment: newComment })

})

module.exports = route