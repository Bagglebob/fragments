# Confirm that posting a JSON fragment works, 
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{"name":"John", "age":30, "car":null}
HTTP/1.1 201

[Captures]
location_url: header "Location"


# Update JSON fragment using a string instead of object (results in error)
PUT {{location_url}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`Hello my name is John`
HTTP/1.1 500
