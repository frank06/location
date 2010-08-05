# location

A small server written in CoffeeScript that responds with a bogus 1x1 gif image but sniffs interesting request info (like IP geolocation) and saves it to Riak.

I assume I am the only one using it. If you find it useful or inspirational, well, good.

Compile with `coffee -wc -o lib src/*.coffee`