const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const login_page = fs.readFileSync('./login.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

const max_num = 10;
const filename = 'mydata.txt';
var message_data;
readFromFile(filename);

var server = http.createServer(getFromClient);
server.listen(3000);
console.log("start");

function getFromClient(req,res){
    var url_parts = url.parse(req.url, true);
    switch(url_parts.pathname) {
        case '/':
            response_index(req, res);
            break;
        case '/login':
            response_login(req, res);
            break;
        default:
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('no page...');
            break;
    }
}

function response_index(req, res){
    if(req.method == 'POST'){
        var body = '';

        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => {
            data = qs.parse(body);
            addToData(data.id, data.msg, filename, req);
            write_index(req,res);
        });
     } else {
        write_index(req,res);
    }
}

function write_index(req, res) {
    var msg = "※何かメッセージを書いてください。"
    var content = ejs.render(index_page, {
        title: "Index",
        content: msg,
        data: message_data,
        filename: 'data_item',
    });    
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    res.write(content);
    res.end();
}

function readFromFile(fname) {
    fs.readFile(fname, 'utf8', (err, data) => {
        message_data = data.split('\n');
    })
}

function addToData(id, msg, fname, req) {
    var obj = {'id': id, 'msg': msg};
    var obj_str = JSON.stringify(obj);
    console.log('add data: ' + obj_str);
    message_data.unshift(obj_str);
    if (message_data.length > max_num) {
        message_data.pop();
    }
    saveToFile(fname);
}

function saveToFile(fname) {
    var data_str = message_data.join('\n');
    fs.writeFile (fname, data_str, (err) => {
        if (err) { throw err; }
    });
}

function setCookie(key, value, res) {
    var cookie = escape(value);
    res.setHeader('Set-Cookie', [key + '=' + cookie]);
}

function getCookie(key, req) {
    var cookie_data = req.headers.cookie != undefined ? req.headers.cookie : '';
    var data = cookie_data.split(';');
    for (var i in data) {
        if (data[i].trim().startsWith(key + '=')) {
            var result = data[i].trim().substring(key.length + 1);
            return unescape(result);
        }
    }
    return '';
}

function response_login(req, res) {
    var content = ejs.render(login_page, {});
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(content);
    res.end();
}