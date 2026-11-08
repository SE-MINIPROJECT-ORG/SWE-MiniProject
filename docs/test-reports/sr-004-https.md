# EVT-SR-004: HTTPS With TLS 1.2 or Higher

**Requirement:** all communication between the browser and the server shall use HTTPS with TLS 1.2 or higher, and plain HTTP requests shall be redirected or refused.
**Test case:** TC-SEC-04. **Owner:** Vishruta.

## Implementation

- The nginx reverse proxy in the frontend container serves the app on **https://localhost:8443** (`frontend/nginx.conf`).
- `ssl_protocols TLSv1.2 TLSv1.3` allows only TLS 1.2 and 1.3.
- Plain HTTP on port 8080 answers with `301` to the HTTPS address.
- Security headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
- For local use the certificate is self-signed and is created when the image is built. The browser warns once because no certificate authority signed it; the connection is still encrypted. A real deployment would use a certificate from a certificate authority.
- The backend port 5000 is bound to the local computer only (`127.0.0.1`) for test tools. Browsers reach the API only through HTTPS.

## How to check

```
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}" http://localhost:8080/
curl.exe -sk --tlsv1.2 --tls-max 1.2 -o NUL -w "%{http_code}" https://localhost:8443/
curl.exe -sk --tls-max 1.1 https://localhost:8443/
```

## Result

| Check | Expected | Result |
|-------|----------|--------|
| `http://localhost:8080/...` | 301 redirect to `https://localhost:8443/...` | PASS |
| TLS 1.2 connection | Page loads (200) | PASS |
| TLS 1.3 connection | Page loads (200) | PASS |
| TLS 1.0 and 1.1 connections | Refused by the server (`protocol version` alert) | PASS |
| Security headers | All four present | PASS |
| API through HTTPS (`/health`, `/api/categories`) | Works | PASS |
