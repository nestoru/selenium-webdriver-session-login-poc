const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const url = require('url');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_USER_FIELD = process.env.SITE_USER_FIELD || 'username';
const SITE_PASSWORD_FIELD = process.env.SITE_PASSWORD_FIELD || 'password';
const SITE_USER_VALUE = process.env.SITE_USER_VALUE || 'user1';
const SITE_PASSWORD_VALUE = process.env.SITE_PASSWORD_VALUE || 'password1';
const COOKIES_FILE_PATH = 'cookies.json';
const LOGIN_CSS_SELECTOR = process.env.LOGGED_CSS_SELECTOR || 'body > form > button';

async function main() {
  // Check if a local COOKIES_FILE_PATH file exists
  let cookiesExist = fs.existsSync(COOKIES_FILE_PATH);

  // Set up the WebDriver
  const driver = new Builder().forBrowser('chrome').build();

  try {
    if (cookiesExist) {
      // If cookies exist, load them for the driver
      console.log('Using existing cookies');
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE_PATH));
      console.log('Loaded cookies:', cookies);

      // Extract domain from SITE_URL
      const siteDomain = url.parse(SITE_URL).hostname;

      // Navigate to the SITE_URL before adding cookies
      await driver.get(SITE_URL);

      for (const cookie of cookies) {
        // Ensure the domain is set correctly
        cookie.domain = cookie.domain || siteDomain;
        await driver.manage().addCookie(cookie);
        //console.log('Added cookie:', cookie);
      }

      // Navigate to the SITE_URL after adding cookies
      await driver.get(SITE_URL);
    } else {
      // If no cookies, perform login
      console.log('No cookies found, performing login');
      await driver.get(SITE_URL);

      // Locate and fill in username and password fields
      await driver.findElement(By.name(SITE_USER_FIELD)).sendKeys(SITE_USER_VALUE);
      await driver.findElement(By.name(SITE_PASSWORD_FIELD)).sendKeys(SITE_PASSWORD_VALUE);

      // Click the login button
      await driver.findElement(By.css(LOGIN_CSS_SELECTOR)).click();
      console.log('Logged in successfully');

      // Save the cookies to a file
      const cookies = await driver.manage().getCookies();
      fs.writeFileSync(COOKIES_FILE_PATH, JSON.stringify(cookies));
      console.log('Cookies saved to ' + COOKIES_FILE_PATH);

      // Navigate to the SITE_URL after saving cookies
      await driver.get(SITE_URL);
    }

    // Assert that SITE_USER_FIELD and SITE_PASSWORD_FIELD do not exist
    await driver.wait(until.elementIsNotVisible(driver.findElement(By.name(SITE_USER_FIELD))), 10000).catch(() => {});
    await driver.wait(until.elementIsNotVisible(driver.findElement(By.name(SITE_PASSWORD_FIELD))), 10000).catch(() => {});

    // Wait for 5 seconds before closing
    await driver.sleep(5000);
  } finally {
    // Close the browser
    await driver.quit();
  }
}

main();

