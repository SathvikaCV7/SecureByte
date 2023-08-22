const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const cookieParser = require('cookie-parser');
app.use(cookieParser('secure_bytes'));
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const secretKey = 'YourSecretKey';
const NodeCache = require('node-cache');
const cache = new NodeCache();
const accountSid ="AC166a0c005f3235c840198ce089fac81d";
const authToken = process.env.authToken;
const verifySid = process.env.verifySid;
const client1 = require("twilio")(accountSid, authToken);
const request=require('request')
const multer = require('multer');
const { MongoClient, Binary } = require('mongodb');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const FormData = require('form-data');
const qrcode = require('qrcode');
var mime = require('mime-to-extensions')
const axios=require('axios')
const crypto = require("crypto");
const upload = multer({
  dest: path.join(__dirname, '/uploads') // Set the destination folder for uploaded files
});


app.use(express.static(__dirname));

function encryptData(data) {
  const encryptedData = jwt.sign(data, secretKey);
  return encryptedData;
}


function decryptData(encryptedData) {
  const decryptedData = jwt.verify(encryptedData, secretKey);
  return decryptedData;
}

const uri = "mongodb+srv://admin:admin@cluster0.dbot6fn.mongodb.net/bhargav?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const port=process.env.PORT||3000

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

client.connect((err) => {
  if (err) {
    console.log('Error connecting to MongoDB Atlas', err);
    return;
  }
  console.log('Connected to MongoDB Atlas');
  db = client.db("myproject").collection("project1");
});





app.use(session({
  secret: 'hellllloooo',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: '234673302290-ic1oma4gm5cqkh33esukoej7tgpdnq43.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://securebyte.onrender.com/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/signup.html'));
});



function googleotp(email,name){
  function generateOTP() {
    var digits = '0123456789';
    let OTP = '';

    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
const otp=generateOTP()
console.log(otp);
  const transporter = nodemailer.createTransport({
    service : 'Gmail',
    auth : {
      user : 'securebyte.sb@gmail.com',
      pass : 'qybnhpwhwnectjku'
    }
  });
  const htmlTemplate=fs.readFileSync('email.html','utf8');
  const dynamicData={
    otp:otp,
    username:name
  }
  const emailBody = htmlTemplate.replace(/\$\{(\w+)\}/g, (_, key) => dynamicData[key]);
        const text1={text:otp}
        const mail_option = {
          from : 'securebyte.sb@gmail.com' ,
          to : email,
          subject: 'Welcome to Secure Byte',
          html: emailBody
        };
  

  transporter.sendMail(mail_option, (error, info) => {
    if(error)
    {
      console.log(error);
    }
    else
    {
      return otp
    }
  });
  return otp;
}

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async(req, res) => {
    const cache1 = cache.get('dataKey');
    const body = decryptData(cache1);
    cache.del('dataKey');
    if(body['form2CheckboxStatus']=='checked'){
      const doc=await db.findOne({Email:req.user._json["email"]})



      if(!doc && body['verificationType1']=='sms'){
        const encryptedData1 = encryptData('sms');
        cache.set(process.env.encryptedData1, encryptedData1);
        res.sendFile(path.join(__dirname+'/signupimgnum.html'));      
      }



      else if(!doc && body['verificationType1']=='email'){
        const Email=req.user._json["email"];
        const name=req.user._json['name'];
        const encryptedData1 = encryptData('email');
        cache.set(process.env.encryptedData1, encryptedData1);
        const k=googleotp(Email,name);
        console.log(k);
        res.send(`
    <form action="/check-gmailotp" method="post">
      <label for="otp">Enter the OTP:</label>
      <input type="text" id="otp" name="otp" />
      <button type="submit">Verify</button>
    </form>
  `);

  
  app.post('/check-gmailotp',(req,res)=>{
    if(req.body.otp==k){
      const encryptedData1 = encryptData('email');
      cache.set(process.env.encryptedData1, encryptedData1);
      res.sendFile(path.join(__dirname+'/signupimg.html')); 
    }
  })
        }

      else{
        res.send("User already exists");
      }
      



    }
    else if(body=='signin'){
      res.redirect('/signinauth');
    }



    else{
      const doc=await db.findOne({Email:req.user._json["email"]})
      if(!doc){
        const encryptedData1 = encryptData('nil');
        cache.set(process.env.encryptedData1, encryptedData1);
        res.sendFile(path.join(__dirname+'/signupimg.html')); 
      }
      else{
        res.send("User already exists");
      }
    }
  });

app.post('/', async (req, res) => {
  console.log(req.body);
  const objectLength = Object.keys(req.body).length;
  if (objectLength==2) {
    const body=req.body;
    const encryptedData = encryptData(body);
    cache.set(process.env.encryptedData, encryptedData);
    res.redirect('/auth/google');
  }



  else if(req.body.form1CheckboxStatus=='checked' && req.body.verificationType=='email'){
    const body=req.body;
    const encryptedData = encryptData(body);
    cache.set(process.env.encryptedData, encryptedData);
    const Email=req.body.Email;
    const name=req.body.Name;
    const doc=await db.findOne({Email:Email})
    if(!doc){
      const encryptedData2 = encryptData('email');
      cache.set(process.env.encryptedData1, encryptedData2);
      const k=googleotp(Email,name);
      res.send(`
  <form action="/check-gmailotp" method="post">
    <label for="otp">Enter the OTP:</label>
    <input type="text" id="otp" name="otp" />
    <button type="submit">Verify</button>
  </form>
`);


app.post('/check-gmailotp',(req,res)=>{
  if(req.body.otp==k){
    res.sendFile(path.join(__dirname+'/signupimg.html')); 
  }
})
  const encryptedData1 = encryptData('email');
  cache.set(process.env.encryptedData1, encryptedData1);
  
} 
    }
        


  else if(req.body.form1CheckboxStatus=='checked' && req.body.verificationType=='sms'){
        const encryptedData1 = encryptData('sms');
        cache.set(process.env.encryptedData1, encryptedData1);
        const encryptedData2 = encryptData(req.body);
        cache.set(process.env.encryptedData2, encryptedData2);
        res.sendFile(path.join(__dirname+'/signupimgnum.html'));
  }


  else{
    const body=req.body;
    console.log("this is executed");
    const encryptedData = encryptData(body);
    cache.set(process.env.encryptedData, encryptedData);
    const encryptedData1 = encryptData('nil');
    cache.set(process.env.encryptedData1, encryptedData1);
    res.sendFile(path.join(__dirname+'/signupimg.html'));
  }
  });



app.post('/signupimg', async(req, res) => {
  const objectLength = Object.keys(req.body).length;
  const cache1 = cache.get('verification');
  const verification = decryptData(cache1);
  var newUser={};
  if(objectLength==1 && req.user && verification=='email'){
    console.log("this is signup with google without phone");
    const Name=req.user._json['name'];
    const Email=req.user._json["email"];
    const Password=req.user._json["sub"];
    newUser = {
      Name: Name,
      Email: Email,
      Password:Password,
      Base64Image:req.body.base64Image,
      verification: 'email'
    };
  }
  else if(objectLength==1 && req.user && verification=='nil'){
    console.log("this is signup with google without phone");
    const Name=req.user._json['name'];
    const Email=req.user._json["email"];
    const Password=req.user._json["sub"];
    newUser = {
      Name: Name,
      Email: Email,
      Password:Password,
      Base64Image:req.body.base64Image,
      verification: 'nil'
    };
  }
  else if(!req.user && verification=='email'){
    console.log("this is signup without phone")
    console.log("hi1");
    const cache1 = cache.get('dataKey');
    const body = decryptData(cache1);
    cache.del('dataKey')
    const Name=body.Name;
    const Email=body.Email;
    const Password=body.Password;
    newUser = {
      Name: Name,
      Email: Email,
      Password:Password,
      Base64Image:req.body.base64Image,
      verification:'email'
    };
  }
  else if(!req.user && verification=='nil'){
    const cache1 = cache.get('dataKey');
    const body = decryptData(cache1);
    cache.del('dataKey')
    const Name=body.Name;
    const Email=body.Email;
    const Password=body.Password;
    newUser = {
      Name: Name,
      Email: Email,
      Password:Password,
      Base64Image:req.body.base64Image,
      verification:'nil'
    };
  }
  const mail=newUser.Email;
  const result = await db.findOne({Email:mail});
  if(!result){
    db.insertOne(newUser, function(err, result) {
      if (err) {
        console.log('Error inserting user into database', err);
        return res.status(500).json({ error: 'Internal server error' });
      } else {
        res.redirect('/signin');}
    });
  }
  else{
    res.send("The user already exists")
  }
  });


app.post('/signupnum',(req,res)=>{
  const phone="+91"+req.body.phone;
  const Base64Image=req.body.imageData;
  client1.verify.v2
  .services(verifySid)
  .verifications.create({ to: phone, channel: "sms" })
  .then((verification) => {
    console.log(verification.status);
    const encryptedData1 = encryptData(phone);
    cache.set(process.env.encryptedData1_p, encryptedData1);
    const encryptedData2 = encryptData(Base64Image);
    cache.set(process.env.encryptedData2_b, encryptedData2);
    res.redirect('/verify');
  })
  .catch((error) => {
    console.error(error);
    res.send("Error occurred while sending OTP");
  });
})


app.get("/verify", (req, res) => {
  res.send(`
    <form action="/check-otp" method="post">
      <label for="otp">Enter the OTP:</label>
      <input type="text" id="otp" name="otp" />
      <button type="submit">Verify</button>
    </form>
  `);
});
    
app.post("/check-otp", (req, res) => {
  const otpCode = req.body.otp;
  const cache1 = cache.get('phone');
  const phoneNumber = decryptData(cache1);
  client1.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phoneNumber, code: otpCode })
    .then((verification_check) => {
      if(verification_check.status=='approved'){
        res.redirect('/signupimgnumdata')
      }
    })
    .catch((error) => {
      console.error(error);
      res.send("Error occurred during verification");
    });
});

app.get('/signupimgnumdata',async(req,res)=>{
    const cache1 = cache.get('phone');
    const phone = decryptData(cache1);
    const cache3 = cache.get('verification');
    const verification = decryptData(cache3);
    cache.del('phone');
    const cache2 = cache.get('Base64Image');
    const Base64Image = decryptData(cache2);
    cache.del('Base64Image');
    newUser={};
    if(req.user && verification=='email'){
      const Name=req.user._json['name'];
      const Email=req.user._json["email"];
      const Password=req.user._json["sub"];
      newUser = {
        Name: Name,
        Email: Email,
        phone:phone,
        Password:Password,
        Base64Image:Base64Image,
        verification:'email'
      }
    }
    else if(req.user && verification=='sms'){
      console.log("this is signup with google with phone")
      const Name=req.user._json['name'];
      const Email=req.user._json["email"];
      const Password=req.user._json["sub"];
      newUser = {
        Name: Name,
        Email: Email,
        phone:phone,
        Password:Password,
        Base64Image:Base64Image,
        verification:'sms'
      }
    }
    else if(req.user){
      console.log("this is signup with google with phone")
      const Name=req.user._json['name'];
      const Email=req.user._json["email"];
      const Password=req.user._json["sub"];
      newUser = {
        Name: Name,
        Email: Email,
        phone:phone,
        Password:Password,
        Base64Image:Base64Image,
        verification:'nil'
      }
    }
    else{
      console.log("this is signup with phone")
      const cache3 = cache.get('signupnumwithoutgoogle');
      cache.del('signupnumwithoutgoogle');
      const body = decryptData(cache3);
      const Name=body.Name;
      const Email=body.Email;
      const Password=body.Password;
      newUser = {
      Name: Name,
      Email: Email,
      Password:Password,
      phone:phone,
      Base64Image:Base64Image,
      verification:'sms'
    };
    }
    const mail=newUser.Email
    const result = await db.findOne({Email:mail});
  if(!result){
    db.insertOne(newUser, function(err, result) {
      if (err) {
        console.log('Error inserting user into database', err);
        return res.status(500).json({ error: 'Internal server error' });
      } else {
        res.redirect('/signin');}
    });
  }
  else{
    res.send("The user already exists")
  }
  });


app.get('/signin',(req,res)=>{
  res.sendFile(path.join(__dirname+'/signin.html'));
})


app.post('/signin',(req,res)=>{
  const objectLength = Object.keys(req.body).length;
  if (objectLength==0 || objectLength==1) {
    const body="signin";
    const encryptedData = encryptData(body);
    cache.set(process.env.encryptedData, encryptedData);
    res.redirect('/auth/google');
  }
  else{
    const body =req.body;
    const encryptedData = encryptData(body);
    cache.set(process.env.encryptedData_s, encryptedData);
    res.redirect('/signinauth');
  }
})


app.get('/invalid', (req, res) => {
  const data = { message: 'Hello from the backend!' };
  res.send(data);
});

app.get('/signinauth',async(req,res)=>{
  var newUser={};
  if(req.user){
    const Name=req.user._json["name"];
    const Email=req.user._json["email"];
    const Password=req.user._json["sub"];
    newUser = {
      Name: Name,
      Email: Email,
      Password:Password,
    }
   
}
else{
  const cache1 = cache.get('signinauth');
    const body = decryptData(cache1);
    cache.del('signinauth')
    const Name=body.Name;
    const Email=body.Email;
    const Password=body.Password;
    newUser = {
      Name: Name,
      Email: Email,
      Password:Password,
    };
}
try {
  const result = await db.findOne(newUser);
  if (!result) {
    res.redirect(307, '/invalid');

  }
  if(result.verification=='sms'){
    const encryptedData = encryptData(result.phone);
    const body = encryptData(result.Base64Image);
    cache.set(process.env.encryptSign, encryptedData);
    cache.set(process.env.body, body);
    const objectId = new ObjectId(result._id);
    const idString = objectId.toString();
    const body1 = encryptData(idString);
    cache.set(process.env.body1, body1);
    //res.sendFile(path.join(__dirname+'/signinimgnum.html'));
    res.redirect('/signinnum');
  }
  else if(result.verification=='email'){
    const k=googleotp(result.Email,result.Name);
      res.send(`
  <form action="/check-gmailotp" method="post">
    <label for="otp">Enter the OTP:</label>
    <input type="text" id="otp" name="otp" />
    <button type="submit">Verify</button>
  </form>
`);


app.post('/check-gmailotp',(req,res)=>{
  if(req.body.otp==k){const body = encryptData(result.Base64Image);
    cache.set(process.env.body, body);
    const objectId = new ObjectId(result._id);
    const idString = objectId.toString();
    console.log(idString)
    const body1 = encryptData(idString);
    cache.set(process.env.body1, body1);
    res.sendFile(path.join(__dirname+'/signinimgnum.html')); 
  }
})
  }
  else{
    const body = encryptData(result.Base64Image);
    cache.set(process.env.body, body);
    const objectId = new ObjectId(result._id);
    const idString = objectId.toString();
    console.log(idString)
    const body1 = encryptData(idString);
    cache.set(process.env.body1, body1);
    res.sendFile(path.join(__dirname+'/signinimgnum.html'));
  }
}
  catch (error) {
    console.log(error)
  }})
  

app.get('/signinnum',(req,res)=>{
  const cache1 = cache.get('signinphone');
  const phone = decryptData(cache1);
  client1.verify.v2
  .services(verifySid)
  .verifications.create({ to: phone, channel: "sms" })
  .then((verification) => {
    console.log(verification.status);
    const encryptedData1 = encryptData(phone);
    cache.set(process.env.encryptedData1_p, encryptedData1);
    res.redirect('/verifysignin');
  })
  .catch((error) => {
    console.error(error);
    res.send("Error occurred while sending OTP");
  });

})


app.get("/verifysignin", (req, res) => {
  res.send(`
    <form action="/check-otpsignin" method="post">
      <label for="otp">Enter the OTP:</label>
      <input type="text" id="otp" name="otp" />
      <button type="submit">Verify</button>
    </form>
  `);
});

app.post('/check-otpsignin',(req,res)=>{
  const otpCode = req.body.otp;
  const cache1 = cache.get('signinphone');
  const phoneNumber = decryptData(cache1);
  cache.del('singinphone')
  client1.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phoneNumber, code: otpCode })
    .then((verification_check) => {
      if(verification_check.status=='approved'){
        res.sendFile(path.join(__dirname+'/signinimgnum.html'));
      }
    })
    .catch((error) => {
      console.error(error);
      res.send("Error occurred during verification");
    });
})


app.post('/compare',async(req,res)=>{
  const cache1 = cache.get('result');
  const Base64Image1 = decryptData(cache1);
  const Base64Image2 = req.body.imageData;
  try {
    const options = {
      url: 'https://api-us.faceplusplus.com/facepp/v3/compare',
      method: 'POST',
      formData: {
        api_key:'-igC8YvCt61f5jqKR75VwYYz1c8BX3yD',
        api_secret: 'Xqe2t6he_Zck2y1m0C6o8JfsKtucVEIw',
        image_base64_1: Base64Image1,
        image_base64_2: Base64Image2
      }
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error('Error comparing images:', error);
        return res.status(500).json({ error: 'Error comparing images' });
      }
      
      const result = JSON.parse(body);
      if(result.confidence>85){
        res.sendFile(path.join(__dirname+'/account.html'));
      }
      else{
        res.send("FACE IS NOT MATCHED")
      }
     })}
     catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error comparing images' });
  }
})





app.post('/Add',(req,res)=>{
    res.sendFile(__dirname + '/pdfup.html');
})

app.post('/upload', upload.array('data'),async (req, res) => {
  try {
    const cache1 = cache.get('some');
    const id = decryptData(cache1);

    const numRecords = parseInt(req.body.numRecords, 10);
    let records = [];
    let record = {};
    const bodyLength = Object.keys(req.body).length;
    const filter = { _id: ObjectId(id)}
    const keys1=await db.findOne(filter);
    const keys = Object.keys(keys1);
    const lastKey = keys[keys.length - 1];
    if(lastKey=='verification'){
      var number=0;
    }
    else{
      const match = lastKey.match(/\d+/);
      var number = parseInt(match[0]);
    }
    
    const isFileInput = req.files && req.files.length > 0
      const files=req.files;
      if (isFileInput) {
        for (let i = 0; i <files.length ; i++) {
        const k=files[i];
        var filePath = k.path;
        const fileData = fs.readFileSync(filePath);
        const base64FileData = fileData.toString('base64');
        number=number+1;
        fs.unlinkSync(filePath);
        record["data"+(number)] = {
          filename: k.originalname,
          contentType: k.mimetype,
          data: fileData
        };
      } 
    }

    if(bodyLength>2){
      const dataKeys = Object.keys(req.body).filter(key => key.startsWith('data'));
      var temp=1;
      dataKeys.forEach(key => {
        const dataValue = req.body[key];
        record["data"+temp]=dataValue;
        temp=temp+1
      });
    }
    records.push(record);
    const update = { $set: {} };
    for (const item of records) {
      const field = Object.keys(item)[0];
      const value = item[field];
      update.$set[field] = value;
    }
    const result = await db.updateOne(filter, update);
    res.sendFile(path.join(__dirname + '/success.html'));  
  }
  catch(err){
    console.log(err);
  }
});

app.post('/retreive',async(req,res)=>{
  try {
    const cache1 = cache.get('some');
    const id = decryptData(cache1);
    cache.del('some')
    const fileId = id;

    if (!fileId) {
      res.status(400).send('File ID is missing');
      return;
    }




    const document = await db.findOne({ _id: new ObjectId(fileId) });

    const dataKeys = Object.keys(document).filter(key => key.startsWith('data'));

    const dataUrl = [];
    const qrCodes=[];
    const data=[];
    var cnt=0;
    const dataUrl1=[]
    const path = require('path')
    const dataUrl2=[]
    const promises = dataKeys.map(async key => {
      if (Object.keys(document[key]).length == 3) {
        const k = document[key];
        cnt=cnt+1
        const r = k.contentType;
const fileExtension = mime.extension(r);
const pa = path.extname(k.filename);
if (fileExtension == false) {
  const button=`${k.filename}`
  dataUrl2.push(button);
} else {
  const button=`${k.filename}`
  dataUrl2.push(button);
}
var cnt2=0;
var id = crypto.randomBytes(20).toString('hex');
  
app.get(`/${id}`, (req1, res1) => {
  if(cnt2>=1){
    res1.send("the link has expired")
  }
  else{
  cnt2+=1;
  res1.setHeader('Content-Type', k.contentType);
  res1.setHeader('Content-Disposition', `attachment; filename="${k.filename}"`);
  res1.send(k.data.buffer);
  }
      })
  var downloadUrl;
  if(process.env.PORT){
    downloadUrl =`${process.env.PORT}/${id}`;
  }
  else{
    downloadUrl =`localhost:3000/${id}`;
  }
  console.log(downloadUrl);
  dataUrl.push(downloadUrl);
  const downloadUrl1 = `data:${k.contentType};base64,${k.data.buffer.toString('base64')}`;
  dataUrl1.push(downloadUrl1);
        const qrCodeImage = await qrcode.toDataURL(downloadUrl);
        qrCodes.push(qrCodeImage);
    }
  })
        

    // Wait for all promises to resolve
    await Promise.all(promises);
    var html=`<html>
    <body>
      <h2>File Download</h2>`;

    for(var i=0;i<data.length;i++){
        html+=`<p>Your Data is:   ${data[i]}</p>`
    }
    
    for(var i=0;i<dataUrl.length;i++){
        html+=`<a href="${dataUrl1[i]}" download="${dataUrl2[i]}"><button>Click to Download</button></a><br>`;
        html += `<img src="${qrCodes[i]}" alt="QR Code"><br>`
    }

    html+=`</body>
    </html>`
    res.send(html)
    
    // Close the MongoDB connection
    client.close();
    console.log('Disconnected from MongoDB server');
 } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});



app.listen(port, () => {
  console.log('Server started on port 3000!');
});




