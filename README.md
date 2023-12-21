[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=58F9TDDRBND4L)

## NodeJS Selenium Webdriver Session Login with TOTP POC
This POC shows how Selenium Webdriver can be used to login to a web app asking for TOTP in a second page, save the session in a local file and login again just using the cookie.

## Finding the TOTP secret key
If you only have the QR code you can scan it to get the key by taking a picture of it and processing it with zbarimg
```
sudo apt-get install zbar-tools
zbarimg ~/totp.jpeg 
```

## Install
```
git clone https://github.com/nestoru/selenium-webdriver-session-login-poc.git
cd selenium-webdriver-session-login-poc
npm install
```

## Start the sample server (TODO: Add TOTP second page)
```
node login-form-server.js 
```
## Setup env vars (replace with proper vars as the below values are only provided as example
```
export SITE_LOGIN_URL='' && \
export SITE_LOGGED_URL='' && \
export SITE_USER_FIELD='email-form-field' && \
export SITE_USER_VALUE='' && \
export SITE_PASSWORD_FIELD='password-form-field' && \
export SITE_PASSWORD_VALUE='' && \
export SITE_TOTP_FIELD='one-time password' && \
export SITE_TOTP_KEY='' && \
export LOGIN_XPATH_SELECTOR="//form/div/div[1]/div/div[5]/button" && \
export TOTP_SUBMIT_XPATH_SELECTOR="//button"
```

## Run the test script simulating no saved cookie and again with cookie to confirm it always shows the logged in view
```
rm -f cookies.json && node automate-user-login.js
node automate-user-login.js
cat cookies.json
```

## Equivalent curl commands
```
rm cookies.txt && curl -c cookies.txt -d "username=user1&password=password1" http://localhost:3000/login
curl -b cookies.txt http://localhost:3000
cat cookies.txt
rm cookies
```

