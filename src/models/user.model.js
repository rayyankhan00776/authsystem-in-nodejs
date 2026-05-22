import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      validate : {
        validator: function(value) {
          // Username must be at least 3 characters long and contain only letters, numbers, and underscores
          return /^[A-Za-z0-9_]{3,}$/.test(value);
        },
        message: props => `${props.value} is not a valid username! Username must be at least 3 characters long and contain only letters, numbers, and underscores.`
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate : {
        validator: function(value) {
          // Email must be a valid email address
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    password: {
      type: String,
      required: true,
      validate : {
        validator: function(value) {
          // Password must be at least 8 characters long and contain at least one letter and one number
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
        },
        message: props => `${props.value} is not a valid password! Password must be at least 8 characters long and contain at least one letter and one number.`
      }
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;