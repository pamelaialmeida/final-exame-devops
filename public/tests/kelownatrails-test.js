const { Builder, Browser, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { describe, it } = require('mocha');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const utils = require('./utils.js');

describe("Kelowna trails tests", function() {
    let baseUrl; 
    switch(process.env.ENV) {
        case 'test':
            baseUrl = process.env.TESTING_ENV_IP; 
            break;
        case 'staging': 
            baseUrl = process.env.STAGING_ENV_IP; 
            break; 
        case 'production1': 
            baseUrl = process.env.PROD1_ENV_IP; 
            break; 
	case 'production2': 
            baseUrl = process.env.PROD2_ENV_IP; 
            break;
        default: 
            throw new Error('Invalid environment specified');
    }
    
    this.timeout(10000);

    let driver;

    before(async function() {
	const chromeOptions = new chrome.Options();
	chromeOptions.addArguments('headless');
	chromeOptions.addArguments('disable-gpu');
	chromeOptions.addArguments('no-sandbox');

        driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
    });

    beforeEach(async function () {
      await driver.get(baseUrl); 
      await driver.manage().window().maximize();
    });

    it("Should not add Member when no data is provided", async function() {
        await driver.findElement(By.id("addMemberBtn")).click();
        let alert = await driver.wait(until.alertIsPresent());
        let message = await alert.getText();
        expect(message).to.be.equal("Please first enter a group member's name");

        await alert.accept();
    });

    it("Should not add member when no group size is provided", async function() {
        let lastName = faker.person.lastName();
        let firstName = faker.person.firstName();

        await driver.findElement(By.id("lastname")).sendKeys(lastName);
        await driver.findElement(By.id("firstname")).sendKeys(firstName);

        await driver.findElement(By.id("addMemberBtn")).click();

        let alert = await driver.wait(until.alertIsPresent());
        let message = await alert.getText();
        expect(message).to.be.equal("Size must be greater than 0");

        await alert.accept();
    });

    it("Should add a member to the list", async function() {
        let lastName = faker.person.lastName();
        let firstName = faker.person.firstName();
        
        await driver.findElement(By.id("lastname")).sendKeys(lastName);
        await driver.findElement(By.id("firstname")).sendKeys(firstName);
        let groupSize = await driver.findElement(By.id("GroupSize"));
        groupSize.clear();
        groupSize.sendKeys("2");
        
        await driver.findElement(By.id("addMemberBtn")).click();

        await driver.manage().setTimeouts({ implicit: 10000 });

        let options = await driver.findElements(By.css('#members option'));

        let optionTexts = await Promise.all(options.map(async (option) => { 
            return await option.getText(); 
        })); 

        let addedMember = `${lastName}, ${firstName}`;

        expect(optionTexts).to.include(addedMember, `The member "${addedMember}" is not added to the list of members.`);
    });

    it("Should display an error message when trying to delete a member when the list of members is empty", async function () {
       await driver.findElement(By.id("deleteMemberBtn")).click();
       let alert = await driver.wait(until.alertIsPresent());
       let message = await alert.getText();
       expect(message).to.be.equal("There are no members in the list.");
       
       await alert.accept();
    });

    it("Should display an error message when trying to delete a member without selecting any member on the list", async function () {
        let lastName = faker.person.lastName();
        let firstName = faker.person.firstName();

        await utils.addAMember(driver, lastName, firstName, "15");

        await driver.findElement(By.id("deleteMemberBtn")).click();
        let alert = await driver.wait(until.alertIsPresent());
        let message = await alert.getText();
        expect(message).to.be.equal("Please, select a member to delete from the list.");
        
       await alert.accept();
    })

    it("Should delete the member from the list", async function () {
        let lastName = faker.person.lastName();
        let firstName = faker.person.firstName();

        await utils.addAMember(driver, lastName, firstName, "10");

        let listOfMembers = await driver.wait(until.elementLocated(By.id('members')), 10000); 
        let nameToSelect = `${lastName}, ${firstName}`;
        let memberToSelect = await listOfMembers.findElement(By.xpath(`//option[text()='${nameToSelect}']`));
        await memberToSelect.click();

        await driver.findElement(By.id("deleteMemberBtn")).click();
        let alert = await driver.wait(until.alertIsPresent());
        let message = await alert.getText();
        expect(message).to.be.equal(`The member ${nameToSelect} was removed from the list.`);
        
        await alert.accept();

        await driver.manage().setTimeouts({ implicit: 10000 });

        let membersInList = await listOfMembers.getText();
        expect(membersInList).to.not.include(nameToSelect, `The member "${nameToSelect}" should not be in the list of members.`);
    })

    after( async function() {
        await driver.quit();
    });

    afterEach(function() {
        driver.manage().deleteAllCookies();
    });

});


