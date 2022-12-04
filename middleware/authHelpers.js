require('dotenv').config()

const jwt = require("jsonwebtoken")
const User = require('../models/user')

verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token)
    return res.status(400).send({ message: "No token provided!" });


  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).send({ message: "Provided token is not valid" })

    let user = User.findById(decoded.id).then((user) => {
      if (!user)
        return res.status(401).send({ message: "Provided token is not valid" })

      if (user.logoutTime != decoded.logoutTime)
        return res.status(401).send({ message: "Provided token is not valid" })

      res.user = user
      next()
    })
  })
}

checkDuplicateUsers = (req, res, next) => {
  User.findOne({
    username: req.body.username
  }).exec((err, user) => {
    if (err) {
        res.status(500).send({ message: err })
        return
    }

    if (user) {
        res.status(400).json({ message: "Username already exists" })
        return
    }

    let emailNormalized = req.body.email
    // emailNormalized = emailNormalized.toLowerCase()
    User.findOne({
        email: emailNormalized
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err })
            return
        }

        if (user && user.active) {
            res.status(400).json({ message: "Email already exists" })
            return
        }

        next()
    })
  })
}

const authHelpers = {
  verifyToken,
  checkDuplicateUsers
}

module.exports = authHelpers