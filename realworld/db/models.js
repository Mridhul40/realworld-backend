const Sequelize = require('sequelize')
const DT = Sequelize.DataTypes

module.exports = {
    user: {
        firstname: {
            type: DT.STRING,
            unique: true,
            allowNull: false,
            required: [true, "cannot be blank"]
        },
        lastname: {
            type: DT.STRING,
            unique: true,
            allowNull: false,
            required: [true, "cannot be blank"]
        },
        email: {
            type: DT.STRING,
            unique: true,
            allowNull: false,
            required: [true, "cannot be blank"],
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DT.STRING,
            allowNull: false,
            required: [true, "cannot be blank"]
        },
        token: {
            type: DT.STRING,
            allowNull: false,
            unique: true,
            required: [true, "cannot be blank"]
        },
        bio: {
            type: DT.STRING,

        },
        image: {
            type: DT.STRING
        }
    },
    article: {
        slug: {
            type: DT.STRING,
            lowercase: true,
            unique: true
        },
        title: {
            type: DT.STRING
        },
        description: {
            type: DT.STRING
        },
        body: {
            type: DT.STRING
        }
    },
    comment: {
        body: {
            type: DT.STRING
        }
    },
    tag: {
        name: {
            type: DT.STRING
        }
    }
}