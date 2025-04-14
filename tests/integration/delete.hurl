# POST a new JSON fragment to http://localhost:8080 as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{ "service": "DynamoDB" }
HTTP/1.1 201


[Captures]
fragment1_url : header "Location"
fragment1_id : jsonpath "$.fragment.id"

# Delete fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200


# Try to get Deleted fragment
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404
