# Health Check Test
GET http://localhost:8080

# We should get back an HTTP 1.1 200 response
HTTP/1.1 200

# We should get back a non-cacheable response (cache-control header)
Cache-Control: no-cache

# Extra checks to perform against the response
[Asserts]

# We expect to get back a JSON response with { "status": "ok", ... }
# == for equality checking
jsonpath "$.status" == "ok"

# We expect to get back a JSON response with { "author": "Fawad Arshad", ... }
# isString, to check if value type is string
jsonpath "$.author" == "Fawad Arshad"

# We expect to get back a JSON response with { ..., "githubUrl": "..." }
# matches /.../ to check for regular expressions
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/

# We expect to get back a JSON response with { ..., "version": "x.y.z" }
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/

# HTTP 404 response if you request a route that doesn't exist
GET http://localhost:8080/no-such-route
HTTP/1.1 404

