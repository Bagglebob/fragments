POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`
HTTP/1.1 201

[Captures]
location_url: header "Location"


GET {{location_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

[Asserts]
body == "Hello S3!"
header "Content-Type" contains "text/plain"

DELETE {{location_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

# Try to GET the fragment again using the url as an authorized user.
GET {{location_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404
# comment for new tag
