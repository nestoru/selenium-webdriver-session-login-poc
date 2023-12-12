const otplib = require('otplib');
const base32 = require('base32');
const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const url = require('url');

const SITE_LOGIN_URL = process.env.SITE_LOGIN_URL || 'http://localhost:3000';
const SITE_LOGGED_URL = process.env.SITE_LOGGED_URL || 'http://localhost:3000/home';
const SITE_USER_FIELD = process.env.SITE_USER_FIELD || 'username';
const SITE_PASSWORD_FIELD = process.env.SITE_PASSWORD_FIELD || 'password';
const SITE_USER_VALUE = process.env.SITE_USER_VALUE || 'user1';
const SITE_PASSWORD_VALUE = process.env.SITE_PASSWORD_VALUE || 'password1';
const COOKIES_FILE_PATH = 'cookies.json';
const LOGIN_XPATH_SELECTOR = process.env.LOGIN_XPATH_SELECTOR || 'body > form > button';
const SITE_TOTP_FIELD = process.env.SITE_TOTP_FIELD || 'one-time-password';
const SITE_TOTP_KEY = process.env.SITE_TOTP_KEY || '***';
const TOTP_SUBMIT_XPATH_SELECTOR = process.env.TOTP_SUBMIT_XPATH_SELECTOR || 'button';

console.log(SITE_LOGIN_URL, SITE_LOGGED_URL, SITE_USER_FIELD, SITE_PASSWORD_FIELD, COOKIES_FILE_PATH, LOGIN_XPATH_SELECTOR, SITE_TOTP_FIELD, TOTP_SUBMIT_XPATH_SELECTOR);

// Function to wait for page loaded
async function waitForPageLoaded(driver) {
  // Wait for page completely loaded (document ready)
  await driver.wait(function() {
    return driver.executeScript('return document.readyState').then(function(readyState) {
      return readyState === 'complete';
    });
  });
}

// Function to generate TOTP token from TOTP secret key
function otpFromKey(secretKey, algo) {
  // Set the number of digits for the TOTP (usually 6 or 8)
  const digits = 6;

  // Generate the TOTP
  const otp = otplib.authenticator.generate(secretKey, { algo, digits });

  return otp;
}

async function main() {
  // Check if a local COOKIES_FILE_PATH file exists
  let cookiesExist = fs.existsSync(COOKIES_FILE_PATH);

  // Set up the WebDriver
  const driver = new Builder().forBrowser('chrome').build();
  await driver.manage().setTimeouts({ implicit: 60000 });

  try {
    if (cookiesExist) {
      // If cookies exist, load them for the driver
      console.log('Using existing cookies');
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE_PATH));
      console.log('Loaded cookies:', cookies);

      // Extract domain from SITE_LOGIN_URL
      const siteDomain = url.parse(SITE_LOGIN_URL).hostname;

      // Navigate to the SITE_LOGIN_URL before adding cookies
      await driver.get(SITE_LOGIN_URL);

      for (const cookie of cookies) {
        // Ensure the domain is set correctly
        cookie.domain = cookie.domain || siteDomain;
        await driver.manage().addCookie(cookie);
        //console.log('Added cookie:', cookie);
      }

      // Navigate to the SITE_LOGIN_URL after adding cookies
      await driver.get(SITE_LOGGED_URL);
    } else {
      // If no cookies, perform login
      console.log('No cookies found, performing login');
      await driver.get(SITE_LOGIN_URL);

      await waitForPageLoaded(driver);

      // Wait for username field to be visible
      let el = await driver.findElement(By.name(SITE_USER_FIELD));
      await driver.wait(until.elementIsVisible(el),100);

      // Locate and fill in username and password fields
      await driver.findElement(By.name(SITE_USER_FIELD)).sendKeys(SITE_USER_VALUE);
      await driver.findElement(By.name(SITE_PASSWORD_FIELD)).sendKeys(SITE_PASSWORD_VALUE);

      // Click the login button
      await driver.findElement(By.xpath(LOGIN_XPATH_SELECTOR)).click();
      
      console.log('Waiting for TOTP page to load');
      await waitForPageLoaded(driver);
      console.log('TOTP page loaded');

      // Wait for TOTP field to be visible
      el = await driver.findElement(By.name(SITE_TOTP_FIELD));
      await driver.wait(until.elementIsVisible(el),10000);

      // Locate and fill in TOTP
      await driver.findElement(By.name(SITE_TOTP_FIELD)).sendKeys(otpFromKey(SITE_TOTP_KEY, 'sha1'));

      // Click the TOTP button
      await driver.findElement(By.xpath(TOTP_SUBMIT_XPATH_SELECTOR)).click();

      console.log('Logged in successfully');

      // Save the cookies to a file
      const cookies = await driver.manage().getCookies();
      fs.writeFileSync(COOKIES_FILE_PATH, JSON.stringify(cookies));
      console.log('Cookies saved to ' + COOKIES_FILE_PATH);

    }

    // Assert that SITE_USER_FIELD and SITE_PASSWORD_FIELD do not exist
    await driver.wait(until.elementIsNotVisible(driver.findElement(By.name(SITE_USER_FIELD))), 10000).catch(() => {});
    await driver.wait(until.elementIsNotVisible(driver.findElement(By.name(SITE_PASSWORD_FIELD))), 10000).catch(() => {});

    // Go to the logged URL
    await driver.get(SITE_LOGGED_URL);

    // Wait for 5 seconds before closing
    await driver.sleep(5000);
  } finally {
    // Close the browser
    await driver.quit();
  }
}

// Set the algorithm (can be 'sha1', 'sha256', or 'sha512')
//let algo = 'sha1';
//let token = otpFromKey(SITE_TOTP_KEY, algo);
//console.log("TOTP secret key", SITE_TOTP_KEY);
//console.log(algo, token);
//console.log(otplib.authenticator.check(token, SITE_TOTP_KEY));
main();

