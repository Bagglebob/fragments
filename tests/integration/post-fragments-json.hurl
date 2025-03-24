# Confirm that posting a JSON fragment works, 
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{"name":"John", "age":30, "car":null}
HTTP/1.1 201

[Captures]
location_url: header "Location"



# doing a GET for the same fragment returns the expected result
GET {{location_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
Content-Type: application/json; charset=utf-8
Content-Length: 35
[Asserts]
jsonpath "$.name" == "John"
jsonpath "$.age" == 30
jsonpath "$.car" == null

