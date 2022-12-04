const File = require("../models/file")

checkIfOwner = async (req, res, next) => {
  const user = req.user
  const file_id = req.body.file_id

  if (!user || !file_id)
    return res.status(400).send({ message: "No file ID provided!" });

  let file
  try {
    file = await File.findById(file_id)
  } catch (err) {
    return res.status(400).send({ message: "Incorrect file ID" })
  }

  if (file && file.user_id.equals(user._id)) {
    next()
  } else
    return res.status(401).send({ message: "Unauthorized" })
}


const fileHelpers = {
  checkIfOwner,
}

module.exports = fileHelpers