var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var bodyParser = require('body-parser')
var fs = require('fs')
var exec = require('child_process').exec;

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var cnvSchema = new Schema({
    time: Date,
    sample: {
        type: String,
        index: true,
        unique: true,
    },
    path: {
        type: String,
        index: true,
        unique: true,
    },
    cut: String,
    status: String,
    result_path: String,
    image: String,
})

var db = mongoose.createConnection('mongodb://127.0.0.1:27017/test');
db.on('error', function(error) {
    console.log(error);
})
var cnvModel = db.model('mongoose', cnvSchema);

var router = express.Router()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/static', express.static('public'));

router.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

router.get('/add', function(req, res){
    res.send({msg : "add new"})
})

router.get('/hello', function(req, res){
    res.send({msg : "hello world"})
})

router.get('/data_list', function (req, res) {
    cnvModel.find({}, function (err, docs) {
        if(err){
            res.send({A:1, B:2})
        } else {
            res.send(docs)
        }
    })
})

router.post('/add_path', urlencodedParser, function (req, res) {
    var info = req.body
    info.path = info.path.trim()
    info.sample = info.sample.trim().replace(/[\'\\\\/\b\f\n\r\t\ ]/g, '').replace('-','_')
    console.log(info)
    if(parseInt(info.cutlength)){
    } else {
        info.cutlength = "0"
    }
    fs.stat(info.path, (err, stats)=>{
        if(err){
            res.send("Your File Do Not Exists!")
        } else{
            cnvModel.create({
                time: Date.now(),
                sample: info.sample,
                path: info.path,
                cut: info.cutlength,
                status: "Added",
                result_path: "",
                image:""
            }, function(error){
                if(error){
                    res.send("Submit Error, probably duplicated Sample Name or File Path!")
                    return
                }
                else{
                    exec('bash ./run_cnv_qsub.sh '+info.sample+' '+info.path+' '+info.cutlength, {}, function (err, stdout, stderr) {
                        if(err){
                            res.send("Run Qsub Error!")
                            console.log(stdout, stderr)
                            return
                        } else{
                            res.send("Run Qsub Successfully!")
                            console.log(stdout, stderr)
                            return
                        }
                    })
                }
            })
        }
    })
})

router.get('/change_state', function (req, res) {
    var { sample, action, info} = req.query
    cnvModel.update({sample: sample},
        {$set:{[action]: info}}, function (error) {
            if(error){
                res.send("Update Error!!!")
            }
            else{
                res.send("Update Success!!!")
            }
        }
    )

})

app.use("/",router);
server.listen(3000)


