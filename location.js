var sys = require('sys'),
  http = require('http'),
  fs = require('fs'),
  file = __dirname + '/' + "visits";

sys.exec("touch " + file);
var host = "ipinfodb.com",
	server = http.createClient(80, host);

http.createServer(function (request, response) {
  response.sendHeader('Content-Type: image/gif');
  if (request.url === '/s.gif')
    log(request.connection.remoteAddress, request.headers['user-agent']);
  response.close();
}).listen(8080);

function log(ip, browser) {
  var req = server.request("GET", "/ip_query.php?ip=" + ip + "&timezone=false", {host: host});
  req.addListener('response', function (resp) {
    var buffer = "";
    resp.addListener("data", function (chunk) {
      buffer += chunk;
    });
    resp.addListener("end", function () {
      if (resp.statusCode < 300) {
		var country = /<CountryCode>(\w\w)<\/CountryCode>/.exec(buffer),
			city = /<City>(.*)<\/City>/.exec(buffer),
			obj = { date: new Date(), ip: ip, country: country ? country[1] : "XX", city: city ? city[1] : "Unknown", browser: browser };
		fs.open(file, 'a+', 0666, function(err, fd) {
			if (!err) fs.write(fd, JSON.stringify(obj) + '\n', null, 'utf8');
		})
      }
    });
  });
  req.close();
}