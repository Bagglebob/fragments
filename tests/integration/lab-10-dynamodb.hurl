# 5.1 POST a new JSON fragment to http://localhost:8080 as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{ "service": "DynamoDB" }
HTTP/1.1 201

# 5.2
[Captures]
fragment1_url : header "Location"
fragment1_id : jsonpath "$.fragment.id"

# 5.3
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

# confirm all of the metadata properties match what you expect
[Asserts]
jsonpath "$.id" == {{fragment1_id}}
header "Location" == {{fragment1_url}}


# 5.4 POST a Markdown fragment to http://localhost:8080 as the same authorized user
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**`
HTTP/1.1 201

# 5.5
[Captures]
fragment2_url : header "Location"
fragment2_id : jsonpath "$.fragment.id"



# 5.6
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

[Asserts]
header "Location" == {{fragment2_url}}
jsonpath "$.status" == "ok"
jsonpath "$.id" == {{fragment2_id}}


# 5.7
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[*]" contains {{fragment1_id}}
jsonpath "$.fragments[*]" contains {{fragment2_id}}


# 5.8, 5.9 Delete first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200


# 5.10 GET the first fragment again after deletion, confirm 404
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404


# 5.12 GET all of the fragments, confirm fragment1 doesn't exist
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200


[Asserts]
jsonpath "$.fragments[*]" contains {{fragment2_id}}
jsonpath "$.fragments[*]" not contains {{fragment1_id}}
