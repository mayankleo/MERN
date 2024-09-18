const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(fileUpload());
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const mongoURI = process.env.MONGO_DATABASE_URI;
const port = process.env.PORT;
const key = process.env.SECRET_API_KEY;

mongoose.connect(mongoURI).then(() => console.log('MongoDB connected')).catch(err => console.log('MongoDB connection error:', err));

const LoginSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Login = mongoose.model('Login', LoginSchema);

const UserSchema = new mongoose.Schema({
  image: String,
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  mobile_no: { type: String, required: [true, 'Mobile No. is required'], unique: true },
  designation: { type: String, enum: { values: ['HR', 'Sales', 'Manager'], message: 'Designation should be HR, Sales or Manager' }, required: [true, 'Designation is required'] },
  gender: { type: String, enum: { values: ['Male', 'Female', 'Other'], message: 'Gender should be Male, Female or Other' }, required: [true, 'Gender is required'] },
  course: { type: String, enum: { values: ['MCA', 'BCA', 'BSC'], message: 'Course should be MCA, BCA or BSC' }, required: [true, 'Course is required'] },
  create_date: { type: Date, default: Date.now },
});
const User = mongoose.model('Employee', UserSchema);

app.listen(port, () => console.log("Server started at", `http://localhost:${port}`));

app.post("/login", (req, res) => {
  Login.findOne({ username: req.body.username, password: req.body.password }).then(user => {
    if (user) {
      usertoken = { username: req.body.username, password: req.body.password, useragent: req.headers["user-agent"] };
      token = jwt.sign(usertoken, key, { expiresIn: "30d" });
      return res.cookie("access_token", token, { httpOnly: true, secure: false }).json({ auth: true, name: req.body.username });
    } else {
      return res.status(401).json({ auth: false });
    }
  }).catch(err => {
    return res.status(401).json({ auth: false });
  });
});

app.get("/logout", authenticator, (req, res) => {
  return res.clearCookie("access_token").json({ message: "logout successfully" });
});

async function authenticator(req, res, next) {
  try {
    let data = jwt.verify(req.cookies.access_token, key);
    let getuser = await Login.findOne({ username: data.username })
    if (getuser && data.useragent == req.headers["user-agent"] && data.username == getuser.username && data.password == getuser.password) {
      return next();
    }
    throw new Error()
  } catch (err) {
    return res.clearCookie("access_token").redirect(`/login?cf=${Buffer.from(req.originalUrl).toString("hex")}`);
  }
}

app.get("/users", authenticator, (req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ message: err.message }));
});

app.get("/user/:id", authenticator, (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then(user => res.json(user))
    .catch(err => res.status(500).json({ message: err.message }));
});

app.post('/user', authenticator, (req, res) => {
  const { name, email, mobile_no, designation, gender, course } = req.body;
  const imageFile = req.files.image;
  if (!imageFile) {
    return res.status(400).json({ message: 'Image file is required' });
  }
  let imageFileName = generateRandomFileName(imageFile.name)
  const imagePath = path.join(uploadDir, imageFileName);
  imageFile.mv(imagePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to upload image' });
    }
    const userData = {
      name,
      email,
      mobile_no,
      designation,
      gender,
      course,
      image: imageFileName,
    };

    User.create(userData)
      .then(user => res.json(user))
      .catch(err => res.status(500).json({ message: err.message })
      );
  });
});

app.patch('/user/:id', authenticator, async (req, res) => {
  const { name, email, mobile_no, designation, gender, course } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let imageFileName = user.image;

    if (req.files && req.files.image) {
      const oldImagePath = path.join(uploadDir, imageFileName);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error('Failed to delete old image:', err);
      });
      const imageFile = req.files.image;
      imageFileName = generateRandomFileName(imageFile.name);
      const imagePath = path.join(uploadDir, imageFileName);

      imageFile.mv(imagePath, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to upload image' });
        }


      });
    }

    const updatedUserData = {
      name: name || user.name,
      email: email || user.email,
      mobile_no: mobile_no || user.mobile_no,
      designation: designation || user.designation,
      gender: gender || user.gender,
      course: course || user.course,
      image: imageFileName,
    };
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedUserData, { new: true });
    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.delete('/user/:id', authenticator, (req, res) => {
  const { id } = req.params;
  User.findByIdAndDelete(id)
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    })
    .catch(err => res.status(500).json({ message: err.message }));
})

app.get('/images/:filename', authenticator, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.sendFile(filePath);
  });
});

function generateRandomFileName(fileName) {
  const extension = fileName.split('.').pop();
  const randomString = Math.random().toString(36).substring(2);
  return `${randomString}.${extension}`;
}