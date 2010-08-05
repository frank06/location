var sys = require('sys'),
  http = require('http'),
  fs = require('fs'),
  Riak = require('../riak-js/lib/riak-node'),
  file = __dirname + '/' + "visits2";
  
var db = new Riak.Client();

Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
}
  
var decode_utf = function(s) { return decodeURIComponent( escape( s ) ) }
 
db.removeAll("location")(function(){});
  
fs.readFile(file, function (err, data) {
  if (err) throw err;
  data = String(data)
  arr = data.split("\n")
  
  arr.forEach(function(object, index) {
    try {
      var o = JSON.parse(object),
        d = new Date();
      d.setISO8601(o.date);
      o.date = d.toString();
      sys.puts(o.city + " /// " + decode_utf(o.city))
      o.city = escape(o.city)
     
      sys.puts(o.date)

      db.save('location', undefined, o)()
    } catch(e) {
      sys.puts("probleempje: " + e + " -- " + index)
    }
    
  })

});