const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const assert = require('assert');

describe('Login Test SauceDemo', function () {
  let driver;

  this.timeout(60000);

  // pengaturan driver
  before(async function () {
    console.log("🚀 Starting Chrome...");

    const service = new chrome.ServiceBuilder(chromedriver.path);

    const options = new chrome.Options();
    options.setChromeBinaryPath('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');

    options.addArguments('--start-maximized');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeService(service)
      .setChromeOptions(options)
      .build();

    console.log("✅ Chrome started");
  });

//buka halaman
  beforeEach(async function () {
    await driver.get('https://www.saucedemo.com/');

    await driver.wait(
      until.elementLocated(By.id('login-button')),
      15000
    );
  });

  //cleanup
  after(async function () {
    if (driver) {
      await driver.quit();
      console.log("🛑 Browser closed");
    }
  });

 // helper
  async function login(username, password) {
    const user = await driver.findElement(By.id('user-name'));
    const pass = await driver.findElement(By.id('password'));
    const btn = await driver.findElement(By.id('login-button'));

    await user.clear();
    await pass.clear();

    if (username) await user.sendKeys(username);
    if (password) await pass.sendKeys(password);

    await btn.click();
  }

 
  async function getError() {
    const el = await driver.wait(
      until.elementLocated(By.css('[data-test="error"]')),
      10000
    );

    // tunggu sampai benar-benar terlihat
    await driver.wait(until.elementIsVisible(el), 10000);

    return await el.getText();
  }

 //test case

  it('Login sukses dengan user valid', async function () {
    await login('standard_user', 'secret_sauce');

    await driver.wait(until.urlContains('inventory'), 15000);

    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('inventory'));
  });

  it('Login gagal - password salah', async function () {
    await login('standard_user', 'salah');

    const error = await getError();
    assert.ok(error.includes('Username and password do not match'));
  });

  it('Login gagal - username kosong', async function () {
    await login('', 'secret_sauce');

    const error = await getError();
    assert.ok(error.includes('Username is required'));
  });

  it('Login gagal - password kosong', async function () {
    await login('standard_user', '');

    const error = await getError();
    assert.ok(error.includes('Password is required'));
  });

  it('Login gagal - user terkunci', async function () {
    await login('locked_out_user', 'secret_sauce');

    const error = await getError();
    assert.ok(error.toLowerCase().includes('locked out'));
  });
});