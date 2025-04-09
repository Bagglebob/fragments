# POST a new Text fragment to http://localhost:8080 as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Testing PUT functionality`
HTTP/1.1 201


[Captures]
fragment1_url : header "Location"
fragment1_id : jsonpath "$.fragment.id"


PUT {{fragment1_url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Updated Fragment Data`
HTTP/1.1 200



GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

[Asserts]
body == "Updated Fragment Data"
header "Content-Type" contains "text/plain"
