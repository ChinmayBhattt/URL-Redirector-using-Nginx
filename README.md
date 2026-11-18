# Mini URL Redirector: Hands-on Nginx Educational Project

A minimal, beginner-friendly DevOps project designed to teach the core concepts of **Nginx** practically.

---

## 🎯 Architecture Overview

```
                      +---------------------------------------+
                      |             Client Browser            |
                      +---------------------------------------+
                                          |
                                          | HTTP (Port 80)
                                          v
                      +---------------------------------------+
                      |                 NGINX                 |
                      +---------------------------------------+
                                  /       |       \
                                 /        |        \
        Static Files (root & index)       |         Custom Redirect (302)
                               /          |          \
                              v           |           v
    +---------------------------+         |    +-------------------------+
    | frontend/                 |         |    | https://www.google.com  |
    |  ├── index.html           |         |    +-------------------------+
    |  ├── style.css            |         |
    |  └── 404.html (error_page)|         | Reverse Proxy (proxy_pass)
    +---------------------------+         | (Forward /api/* & /redirect)
                                          v
                      +---------------------------------------+
                      |         Node.js Express Backend       |
                      |               (Port 3000)             |
                      +---------------------------------------+
```

---

## 📂 Project Structure

```
mini-nginx-project/
├── frontend/
│   ├── index.html      # User interface (URL input form & testing dashboard)
│   ├── style.css       # Clean, modern styling
│   └── 404.html        # Custom 404 error page served by Nginx
├── backend/
│   ├── server.js       # Express server handling /api/hello, /api/time, /redirect
│   └── package.json    # Minimal Node.js dependency (express only)
├── nginx/
│   └── nginx.conf      # Heavily documented Nginx configuration
└── README.md           # Educational guide and documentation
```

---

## 🚀 Quick Start Guide

### Step 1: Start the Node.js Express Backend
Open your terminal and run:
```bash
cd /Users/chinmaybhatt/ngix/mini-nginx-project/backend
node server.js
```
The backend will start on `http://127.0.0.1:3000`.

### Step 2: Validate the Nginx Configuration
Always test your Nginx configuration syntax before starting:
```bash
nginx -t -c /Users/chinmaybhatt/ngix/mini-nginx-project/nginx/nginx.conf
```
*Expected output:*
```
nginx: the configuration file .../nginx.conf syntax is ok
nginx: configuration file .../nginx.conf test is successful
```

### Step 3: Run Nginx on Port 80
> **Note on Port 80 (Privileged Port):**
> On Unix systems (macOS and Linux), ports below 1024 require elevated privileges (`sudo`).

To start Nginx on port 80:
```bash
sudo nginx -c /Users/chinmaybhatt/ngix/mini-nginx-project/nginx/nginx.conf
```

*(Optional Tip: If you prefer to test without `sudo`, you can change `listen 80;` to `listen 8080;` in `nginx.conf` and visit `http://localhost:8080`.)*

### Step 4: Open in Your Browser
Open your browser and visit:
👉 **`http://localhost`**

---

## 🧪 Testing the Routes

You can test all routes via your browser UI or using `curl`:

| Feature | Method & URL | Handled By | Expected Behavior |
| :--- | :--- | :--- | :--- |
| **Static Frontend** | `GET /` | Nginx | Serves `frontend/index.html` directly from disk |
| **Static CSS** | `GET /style.css` | Nginx | Serves `frontend/style.css` directly from disk |
| **Reverse Proxy Hello** | `GET /api/hello` | Node.js via Nginx | Returns JSON: `{"status":"success","message":"Hello..."}` |
| **Reverse Proxy Time** | `GET /api/time` | Node.js via Nginx | Returns dynamic server time JSON |
| **Dynamic URL Redirect** | `GET /redirect?url=https://github.com` | Node.js via Nginx | Validates URL and redirects (HTTP 302) to GitHub |
| **Nginx Edge Redirect** | `GET /google` | Nginx | Instantly redirects (HTTP 302) to `https://www.google.com` (bypasses Node.js) |
| **Custom 404 Page** | `GET /unknown-path` | Nginx | Serves custom `frontend/404.html` with HTTP 404 status |

### Testing with `curl` in Terminal:

```bash
# 1. Test Static Homepage
curl -I http://localhost/

# 2. Test Reverse Proxy to /api/hello
curl -i http://localhost/api/hello

# 3. Test Reverse Proxy to /api/time
curl -i http://localhost/api/time

# 4. Test URL Redirect through Backend
curl -I "http://localhost/redirect?url=https://github.com"

# 5. Test Edge Redirect to Google
curl -I http://localhost/google

# 6. Test Custom 404 Page
curl -i http://localhost/non-existent-page
```

---

## 📚 Core Nginx Educational Concepts

### 1. What is Nginx?
**Nginx** (pronounced "engine-x") is a high-performance HTTP web server, reverse proxy, load balancer, and HTTP cache. Unlike traditional threaded servers (such as Apache mpm_prefork) which create a new operating system thread or process for every connection, Nginx uses an **asynchronous, non-blocking, event-driven architecture**. This enables Nginx to handle tens of thousands of concurrent connections with extremely low memory usage.

---

### 2. How Does a Web Server Work?
A web server is a software process listening on a specific network port (typically port 80 for HTTP or 443 for HTTPS). When a client (like Chrome or curl) sends an HTTP GET request for a file (e.g. `/style.css`), the web server:
1. Receives the TCP packet and parses the HTTP request string.
2. Maps the request URI to a file on disk (using directives like `root`).
3. Determines the file's MIME type (e.g. `text/css` from `mime.types`).
4. Reads the file and writes the HTTP response headers and body back over the network socket to the client.

---

### 3. What is a Reverse Proxy?
- **Forward Proxy:** Sits in front of clients (e.g., in a corporate office). Clients send requests through the forward proxy to reach the public internet. The server only sees the proxy's IP.
- **Reverse Proxy:** Sits in front of **backend servers** (e.g., Node.js, Python, Go). Clients contact the reverse proxy (Nginx), and Nginx invisibly forwards the request to the internal backend, receives the backend's response, and returns it to the client.

**Why use a reverse proxy in front of Node.js?**
1. **Security & Isolation:** Node.js doesn't need to run as root to bind port 80/443; it stays safe behind Nginx on port 3000.
2. **Performance:** Nginx serves static assets (HTML, CSS, images) significantly faster than Node.js, freeing Node.js to focus purely on business logic.
3. **SSL/TLS Termination:** Nginx handles HTTPS decryption, relieving the backend application from cryptographic CPU overhead.
4. **Load Balancing & Caching:** Nginx can distribute traffic across multiple Node.js instances and cache frequent API responses.

---

### 4. What is `proxy_pass`?
The `proxy_pass` directive instructs Nginx where to forward an incoming HTTP request.

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

#### Why are `proxy_set_header` directives critical?
When Nginx proxies a request to Node.js, from Node.js's perspective, the connection originated from `127.0.0.1` (localhost). The original client IP, original host header, and original scheme (http/https) would be lost unless Nginx explicitly copies them into HTTP headers:
- `proxy_set_header Host $host;` : Keeps the domain or hostname requested by the client.
- `proxy_set_header X-Real-IP $remote_addr;` : Sends the client's actual IP address to the backend.
- `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` : Preserves the chain of IP addresses if multiple proxies are involved.
- `proxy_set_header X-Forwarded-Proto $scheme;` : Informs the backend whether the user connected via `http` or `https`.

---

### 5. What are `server` and `location` Blocks?
- **`server` block (Virtual Host):** Defines a virtual server. It defines which port to listen on (`listen 80;`) and which domain name to match (`server_name localhost;`). A single Nginx instance can host hundreds of different domains using multiple server blocks.
- **`location` block (Routing):** Defines how to handle requests for specific URI paths within a server block.
  - Prefix matching: `location /api/ { ... }` matches any URI starting with `/api/`.
  - Exact matching: `location = /404.html { ... }` matches only `/404.html`.

---

### 6. What is `root` vs `alias`?
This is one of the most common points of confusion in Nginx configuration:

#### A. `root` (Appends URI to path)
With `root`, Nginx **appends the full request URI** to the root path:
```nginx
location /static/ {
    root /var/www/app;
}
```
If a request comes for `/static/image.png`, Nginx looks on disk at:
`/var/www/app/static/image.png`

#### B. `alias` (Replaces matched location prefix)
With `alias`, Nginx **replaces the matched location path** with the alias path:
```nginx
location /static/ {
    alias /var/www/app/assets/;
}
```
If a request comes for `/static/image.png`, Nginx looks on disk at:
`/var/www/app/assets/image.png`

---

### 7. What is `return 301` vs `return 302`?
Both status codes tell the client browser to visit a different URL, but their caching and semantics differ:

| Code | Name | Browser Caching | Use Case |
| :--- | :--- | :--- | :--- |
| **301** | **Moved Permanently** | **Aggressively cached** by browsers and search engines. | HTTP to HTTPS redirection; permanent domain migration. |
| **302** | **Found (Temporary)** | **Not cached** by default; browser queries the server again next time. | Dynamic URL shorteners/redirectors; temporary maintenance; campaign links. |

In this project, we use:
```nginx
location /google {
    return 302 https://www.google.com;
}
```
Because it is a temporary redirection that should not be permanently cached.

---

### 8. What is `error_page`?
The `error_page` directive allows you to define custom HTML pages for specific HTTP error status codes (e.g., 404, 500, 502, 503).
```nginx
error_page 404 /404.html;

location = /404.html {
    root /Users/chinmaybhatt/ngix/mini-nginx-project/frontend;
    internal;
}
```
- When a 404 occurs, Nginx serves `/404.html` instead of the browser's generic error page.
- The `internal;` directive ensures that users cannot directly type `http://localhost/404.html` in their URL bar; it can only be invoked internally by Nginx error handling.

---

## 🛠️ Essential Nginx Commands

| Command | Description |
| :--- | :--- |
| `nginx -v` | Displays the installed Nginx version. |
| `nginx -V` | Displays Nginx version, compiler version, and configured compile flags/modules. |
| `nginx -t -c <path_to_conf>` | Tests configuration file syntax without starting or affecting the server. |
| `sudo nginx -c <path_to_conf>` | Starts Nginx using the specified configuration file. |
| `sudo nginx -s reload` | **Gracefully reloads** configuration with zero downtime (existing connections finish on old workers). |
| `sudo nginx -s stop` | Immediately stops the running Nginx processes. |
| `sudo nginx -s quit` | Gracefully shuts down Nginx after finishing current client requests. |

---

## 🔍 Troubleshooting Guide

### 1. `bind() to 0.0.0.0:80 failed (13: Permission denied)`
- **Cause:** Ports below 1024 are privileged on macOS and Linux.
- **Fix:** Prefix the command with `sudo`:
  ```bash
  sudo nginx -c /Users/chinmaybhatt/ngix/mini-nginx-project/nginx/nginx.conf
  ```
  Or change `listen 80;` to `listen 8080;` in `nginx.conf` to run unprivileged.

### 2. `bind() to 0.0.0.0:80 failed (48: Address already in use)`
- **Cause:** Another process (such as Apache, another Nginx instance, or Docker) is already using port 80.
- **Fix:** Find and stop the process:
  ```bash
  sudo lsof -i :80
  sudo nginx -s stop
  ```

### 3. `502 Bad Gateway` on `/api/hello`
- **Cause:** Nginx received the request, but the upstream Node.js server on `http://127.0.0.1:3000` is not running.
- **Fix:** Start the Express server:
  ```bash
  cd /Users/chinmaybhatt/ngix/mini-nginx-project/backend
  node server.js
  ```

### 4. Viewing Logs for Real-Time Debugging
Logs are configured in `/tmp` for easy inspection:
```bash
# View real-time access logs
tail -f /tmp/nginx_mini_project_access.log

# View real-time error logs
tail -f /tmp/nginx_mini_project_error.log
```
# URL-Redirector-using-Nginx
