# Backward Compatibility Matrix (v1.1)

Date: 2026-02-17

| Area | v1.0 behavior | v1.1 behavior | Compatibility |
|---|---|---|---|
| Auth login | `POST /auth/login` returns access token | unchanged | Backward compatible |
| Auth me | `GET /auth/me` returns principal | unchanged | Backward compatible |
| Customer core flows | discovery/quote/checkout/history | unchanged | Backward compatible |
| Partner queue transitions | confirm/start/complete endpoints | unchanged | Backward compatible |
| Admin analytics controls | zone/economics/advanced/pricing | unchanged | Backward compatible |
| User profile endpoint | not available | `GET /auth/me/profile` added | Additive |
| User settings endpoint | not available | `GET/PUT /auth/me/settings` added | Additive |

## Conclusion

v1.1 is additive and does not remove or rename any existing v1 paths.
