const { Builder, Browser, By, until } = require('selenium-webdriver');

async function addAMember(driver, lastName, firstName, numberOfMembersInTheGroup) {
    await driver.findElement(By.id("lastname")).sendKeys(lastName);
    await driver.findElement(By.id("firstname")).sendKeys(firstName);
    
    let groupSize = await driver.findElement(By.id("GroupSize"));
    groupSize.clear();
    groupSize.sendKeys(numberOfMembersInTheGroup);
        
    await driver.findElement(By.id("addMemberBtn")).click();

    await driver.manage().setTimeouts({ implicit: 10000 });

    let addedMember = `${lastName}, ${firstName}`;

    return addAMember;
}

module.exports = {
    addAMember,
};

