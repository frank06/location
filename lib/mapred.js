// This file is provided to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file
// except in compliance with the License.  You may obtain
// a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

var Riak = require('../riak-js/lib/riak-node'),
  assert = require('assert');

var db = new Riak.Client();

db.mixin(GLOBAL, require('sys'));

// querying

var map = function(v, keydata, args) {
  if (v.values) {
    var ret = [], doc = Riak.mapValuesJson(v)[0];
    //  && (new Date(doc.date) < new Date(args.date))
    if (doc.country.match(new RegExp(args.country))) {
      ret.push(doc);
    }
    return ret;
  } else {
    return [];
  }
};

var reduce = function(arr, arg){
  return arr.sort(function(a,b) {
    return a.city > b.city
  })  
}

var query = {
    inputs: "location",
    query: [ { map: {source: map, arg: {country: "AR|ES|BR|CL" }} },
             { reduce: { source: reduce } }
    ]
  };

db.mapReduce(query)(function(results) {
  results.forEach(function(result) {
    if (result.city) puts("=> " + decodeURIComponent(result.city))
  })
});

// db.get('location')(function(bucket) {
//   bucket.keys.forEach(function(key) {
//     db.get('location', key)(function(l) {
//       if (l.country === "AR")
//         puts(JSON.stringify(l))
//     })
//   })
// })