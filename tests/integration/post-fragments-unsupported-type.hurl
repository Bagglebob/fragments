# Confirm that posting an unsupported Content-Type produces a 415 error (no longer image/png because it's now supported)
POST http://localhost:8080/v1/fragments
Content-Type: image/sss
[BasicAuth]
user1@email.com:password1
`This is a fragment!`
HTTP/1.1 415
