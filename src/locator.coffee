for lib in ['http', 'fs', 'sys']
  this[lib] = require lib
db = require('riak-js').getClient({debug: false})

host = "ipinfodb.com"
client = http.createClient 80, host

http.createServer (request, response) ->
  response.writeHead 200, {'Content-Type': 'image/gif'}
  response.end()
  
  origin = /\/(.*)\.gif/.exec request.url
  if origin then log origin[1], request.connection.remoteAddress, request.headers['user-agent']

.listen 8080

log = (origin, ip, browser) ->
  req = client.request "GET", "/ip_query.php?ip=#{ip}&timezone=false", {host: host}
  
  req.on 'response', (resp) ->
    buffer = ""
    resp.on 'data', (chunk) ->
      buffer += chunk
    resp.on 'end', () ->
      if resp.statusCode < 300
        country = /<CountryCode>(\w\w)<\/CountryCode>/.exec(buffer)
        city = /<City>(.*)<\/City>/.exec(buffer)
        obj = {
          origin: origin,
          date: new Date().toString(),
          ip: ip,
          country: if country then country[1] else "XX",
          city: if city then escape city[1] else "Unknown",
          browser: browser
        }
        
        db.save('location', undefined, obj)()
  req.end()