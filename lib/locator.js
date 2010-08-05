(function() {
  var _a, _b, _c, client, db, host, lib, log, server;
  _b = ['http', 'fs', 'sys'];
  for (_a = 0, _c = _b.length; _a < _c; _a++) {
    lib = _b[_a];
    this[lib] = require(lib);
  }
  db = require('riak-js').getClient({
    debug: false
  });
  host = "ipinfodb.com";
  client = http.createClient(80, host);
  server = http.createServer(function(request, response) {
    var origin;
    response.writeHead(200, {
      'Content-Type': 'image/gif'
    });
    response.end();
    origin = /\/(.*)\.gif/.exec(request.url);
    return origin ? log(origin[1], request.connection.remoteAddress, request.headers['user-agent']) : null;
  });
  server.listen(8080);
  log = function(origin, ip, browser) {
    var req;
    req = client.request("GET", ("/ip_query.php?ip=" + (ip) + "&timezone=false"), {
      host: host
    });
    req.on('response', function(resp) {
      var buffer;
      buffer = "";
      resp.on('data', function(chunk) {
        return buffer += chunk;
      });
      return resp.on('end', function() {
        var city, country, obj;
        if (resp.statusCode < 300) {
          country = /<CountryCode>(\w\w)<\/CountryCode>/.exec(buffer);
          city = /<City>(.*)<\/City>/.exec(buffer);
          obj = {
            origin: origin,
            date: new Date().toString(),
            ip: ip,
            country: country ? country[1] : "XX",
            city: city ? escape(city[1]) : "Unknown",
            browser: browser
          };
          return db.save('location', undefined, obj)();
        }
      });
    });
    return req.end();
  };
})();
