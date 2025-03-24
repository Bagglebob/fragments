POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment 2!`
HTTP/1.1 201

[Captures]
location_url: header "Location"

# Confirm that posting a fragment Content-Type that includes a charset 
# (e.g., text/plain; charset=utf-8) works, 
# and is returned as the fragment's type when doing a GET
# 2. Try to GET the fragment we just posted by its URL
GET {{location_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 21
[Asserts]
body == "This is a fragment 2!"
