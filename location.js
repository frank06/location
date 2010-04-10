var sys = require('sys'),
  http = require('http'),
  fs = require('fs'),
  file = __dirname + '/' + "visits";

sys.exec("touch " + file);
var hostip = http.createClient(80, "api.hostip.info");

http.createServer(function (request, response) {
  response.sendHeader('Content-Type: image/gif');
  if (request.url === '/s.gif')
    log(request.connection.remoteAddress, request.headers['user-agent']);
  response.close();
}).listen(8080);

function log(ip, browser) {
  var req = hostip.request("GET", "/get_html.php?ip=" + ip, {host: "api.hostip.info"});
  req.addListener('response', function (resp) {
    var buffer = "";
    resp.addListener("data", function (chunk) {
      buffer += chunk;
    });
    resp.addListener("end", function () {
      if (resp.statusCode < 300) {
        var cc = buffer.split('\n');
        var country = /Country\:\s(.*)\((\w\w)\)/g.exec(cc[0]);
        var city = /City\:\s(.*)/g.exec(cc[1]);
        var obj = { date: new Date(), ip: ip, country: country[1].trim(), code: country[2].trim(), city: city[1].trim(), browser: browser }
        fs.readFile(file, function(err, data) {
          if (!err) fs.writeFile(file, JSON.stringify(obj) + "\n" + data);
        });
      }
    });
  });
  req.close();
}