const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    require: [true, "Please add the user name"]
  },
  email: {
    type: String,
    require: [true, "Please add the user email address"],
    unique: [true, "Email address already taken"]
  },
  password: {
    type: String,
    require: [true, "Please add the user password"]
  },
  role:{
    type: String,
    required: true,
    enum: ["admin", "manager", "user"],
    default: "user"
  }
}, {
  timestamps: true,
}
);

module.exports = mongoose.model("User", userSchema);