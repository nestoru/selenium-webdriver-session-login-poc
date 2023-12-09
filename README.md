== NodeJS Selenium Webdriver Session Login POC
This POC shows how Selenium Webdriver can be used to login to a web app, save the session in a local file and login again just using the cookie.

== Start the sample server
```
node login-form-server.js 
```

== Run the test script simulating no saved cookie and again with cookie to confirm it always shows the logged in view
```
rm cookies.json && node automate-user-login.js
node automate-user-login.js
cat cookies.json
```

== Equivalent curl commands
```
rm cookies.txt && curl -c cookies.txt -d "username=user1&password=password1" http://localhost:3000/login
curl -b cookies.txt http://localhost:3000
cat cookies.txt
```

== Use it in external unprotected form authentication websites
```
export SITE_URL=''; \
export SITE_USER_FIELD=''; \
export SITE_PASSWORD_FIELD=''; \
export SITE_USER_VALUE=''; \
export SITE_PASSWORD_VALUE=''; \
export COOKIES_FILE_PATH=''; \
export LOGIN_CSS_SELECTOR=''; \
node automate-user-login.js
```
