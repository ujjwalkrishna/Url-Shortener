const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const shortId = require('shortid');
require('dotenv').config()

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://admin-ujjwal:'+process.env.DB_PASS+'@cluster0.zoxc4.mongodb.net/shortenerDB', {useNewUrlParser: true, useUnifiedTopology: true});

const urlSchema = mongoose.Schema({
    urlCode: String,
    longUrl: String,
    shortUrl: String,
    clicks: Number 
});

const Url = mongoose.model('Url', urlSchema);

app.get('/', (req, res)=>{
      Url.find({}, (err, foundUrls)=>{
          if(err){
              console.log(err);
          }else{
              res.render('form', {foundUrls: foundUrls})
          }
      })
});
app.post('/fullUrl', (req, res)=>{
   const longUrl = req.body.longUrl;
   if(validUrl.isUri(longUrl)){
       Url.findOne({longUrl: longUrl}, (err, foundUrl)=>{
           if(err){
               console.log(err);
           }else{
               if(foundUrl==null){
                   const urlCode = shortId.generate();
                   const shortUrl = 'uj.lk/'+urlCode;
                   const url = new Url({
                       urlCode: urlCode,
                       longUrl: longUrl,
                       shortUrl: shortUrl,
                       clicks: 0
                    })
                    url.save();
                    res.redirect('/');
               }else{
                   res.redirect('/');
               }
           }
       })
   }else{
       res.sendStatus(404);
   }
});
app.get('/uj.lk/:shorturl', (req, res)=>{
    const shortUrl = 'uj.lk/'+req.params.shorturl;
    Url.findOne({shortUrl: shortUrl}, (err, foundUrl)=>{
        if(err){
            console.log(err);
        }else{
            if(foundUrl==null){
                res.sendStatus(404);
            }else{
                foundUrl.clicks++;
                foundUrl.save();
                res.redirect(foundUrl.longUrl);
            }
        }
    })
})
app.listen(process.env.PORT || 3000, ()=>{
    console.log('Server started on port 3000');
})