// Set localStorage.test = true to run tests
// Some tests may fail due to small timing changes. Run them again.
async function runTests() {
// Fields needed for tests
    const $domainname = get("domainname");
    const $bookmark = get("bookmark");
    const $sitename = get("sitename");
    const $username = get("username");
    const $remember = get("remember");
    const $superpw = get("superpw");
    const $sitepw = get("sitepw");
    const $providesitepw = get("providesitepw");
    const $code = get("code");
    const $pwlength = get("pwlength");
    const $allowspecialcheckbox = get("allowspecialcheckbox");
    const $minspecial = get("minspecial");
    const $specials = get("specials");
    const $makedefaultbutton = get("makedefaultbutton");
    const $cancelbutton = get("cancelbutton");
    const $warningbutton = get("warningbutton");
    const $cancelwarning = get("cancelwarning");
    const $forgetbutton = get("forgetbutton");
    const $domainname3bluedots = get("domainname3bluedots");
    const $domainnamemenuforget = get("domainnamemenuforget");
    const $nicknamebutton = get("nicknamebutton");
    const $phishing = get("phishing");
    const $sitename3bluedots = get("sitename3bluedots");
    const $sitenamemenuforget = get("sitenamemenuforget");
    const $username3bluedots = get("username3bluedots");
    const $usernamemenuforget = get("usernamemenuforget");
    
    let restart = localStorage.restart;
    if (restart) {
        alert("Restarting test " + restart);
        console.log("Restarting test " + restart);
    } else {
        alert("Starting tests");
    }
    let passed = 0;
    let failed = 0;
    // setTimeout needed to allow previous test to complete
    if (!restart) {
        await testCalculation();
        await testExtreme();
        await testRememberForm();
        await testProvidedpw()
        await testForget();
        await testPhishing();
        await testBookmark();
        console.log("Tests complete: " + passed + " passed, " + failed + " failed, ");
        alert("Tests restart complete: " + passed + " passed, " + failed + " failed, ");
        await testSaveAsDefault();
    } else {
        if (restart === "testSaveAsDefault2") {
            await testSaveAsDefault2();
        } else {
            console.error("Unknown test", restart);
        }
    }
    // Test password calculation
    async function testCalculation() {
        const expected = "UG1qIyn6mSuJ";
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        await triggerEvent("blur", $superpw);
        actual = $sitepw.value;
        if (actual === expected) {
            passed++;
            console.log("Passed: Test calculation");
        } else {
            failed++;
            console.warn("Failed: Test calculation", expected, "|" + actual + "|");
        }
    }
    // Test extreme settings
    async function testExtreme() {
        const expected = "z?!6GH-!C-_$";
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        await triggerEvent("click", $allowspecialcheckbox);
        $minspecial.value = 7;
        await triggerEvent("blur", $minspecial);
        SitePassword.settings.allowspecial = true;
        SitePassword.settings.minspecial = 7;
        actual = $sitepw.value;
        if (actual === expected) {
            passed++;
            console.log("Passed: Test extreme settings");
        } else {
            failed++;
            console.warn("Failed: Test calculation", expected, "|" + actual + "|");
        }
    }
    async function testRememberForm() {
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $remember.onclick();
        clearForm();
        // See if it remembers
        $domainname.value = "https://alantheguru.alanhkarp.com";
        triggerEvent("blur", $domainname);
        let tests = $sitename.value.trim().toLowerCase() === "guru";
        tests = tests && $username.value === "alan";
        if (tests) {
            passed++;
            console.log("Passed: Test remember form");
        } else {
            failed++;
            console.warn("Failed: Test remember form", "Guru", "alan", "|" + $sitename.value + "|");
        }
    }
    async function testProvidedpw() {
        resetState();
        const sitepw = "MyStrongPassword";
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        await triggerEvent("click", $providesitepw);
        $sitepw.value = sitepw;
        await triggerEvent("blur", $sitepw);
        $remember.onclick();
        clearForm();
        // See if it remembers
        $superpw.value = "qwerty";
        await triggerEvent("keyup", $superpw);
        $domainname.value = "https://alantheguru.alanhkarp.com";
        await triggerEvent("paste", $domainname);
        if ($sitepw.value === sitepw) {
            passed++;
            console.log("Passed: Test provided pw");
        } else {
            failed++;
            console.warn("Failed: Test provided pw", sitepw, "|" + $sitepw.value + "|");    
        }
   }
    // Test forget
    async function testForget() {
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $remember.onclick();
        $domainname3bluedots.onmouseover();
        $domainnamemenuforget.onclick();
        $forgetbutton.onclick();
        // See if it forgot
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "", "");
        let test = $sitename.value === "" && $username.value === "";
        // See if database still has site name if it should
        await phishingSetup();
        $warningbutton.onclick();
        $domainname3bluedots.onmouseover();
        $domainnamemenuforget.onclick();
        $forgetbutton.onclick();
        db = JSON.parse(localStorage.SitePasswordDataTest);
        test = test && !db.domains["allantheguru.alanhkarp.com"] && db.sites["guru"];
        // See if forget by site name works
        await phishingSetup();
        $warningbutton.onclick(); // Now I have two domain names pointing to the same site name
        $sitename3bluedots.onmouseover();
        $sitenamemenuforget.onclick();
        $forgetbutton.onclick();
        db = JSON.parse(localStorage.SitePasswordDataTest);
        test = test && !db.domains["alantheguru.alanhkarp.com"] && !db.sites["guru"];
        test = test && !db.domains["allantheguru.alanhkarp.com"];
        // See if forget by username works
        await phishingSetup();
        $warningbutton.onclick(); // Now I have two domain names pointing to the same site name
        $username3bluedots.onmouseover();
        $usernamemenuforget.onclick();
        $forgetbutton.onclick();
        db = JSON.parse(localStorage.SitePasswordDataTest);
        test = test && !db.domains["alantheguru.alanhkarp.com"] && !db.sites["guru"];
        test = test && !db.domains["allantheguru.alanhkarp.com"];
        if (test) {
            passed++;
            console.log("Passed: Test forget");
        } else {
            failed++;
            console.warn("Failed: Test forget");
        } 
    }
    // Test phishing
    async function testPhishing() {
        await phishingSetup();
        // Does warning appear?
        let test = $phishing.style.display === "block";
        // Does warning go away leaving form cleared?
        $cancelwarning.onclick();
        test = test && $phishing.style.display === "none" && $sitename.value === "";
        // Does setting new site name work?
        await phishingSetup();
        $nicknamebutton.onclick();
        test = test && $phishing.style.display === "none" && $sitename.value === "Guru";
        // Does same account option work?
        await phishingSetup();
        $warningbutton.onclick();
        test = test && $phishing.style.display === "none" && $sitename.value === "Guru";
        test = test && $username.value === "alan";
        $remember.onclick();
        test = test && SitePassword.database.domains["allantheguru.alanhkarp.com"] === "guru";
         if (test) {
            passed++;
            console.log("Passed: Test phishing");
        } else {
            failed++;ß
            console.warn("Failed: Test phishing");
        }
    }
    async function testBookmark() {
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "", "");
        let bookmark = "https://sitepassword.info/index.html?bkmk=ssp://{%22sitename%22:%22Guru%22,%22username%22:%22alan%22,%22providesitepw%22:false,%22xor%22:[0,0,0,0,0,0,0,0,0,0,0,0],%22pwlength%22:12,%22domainname%22:%22alantheguru.alanhkarp.com%22,%22pwdomainname%22:%22alantheguru.alanhkarp.com%22,%22startwithletter%22:true,%22allowlower%22:true,%22allowupper%22:true,%22allownumber%22:true,%22allowspecial%22:false,%22minlower%22:1,%22minupper%22:1,%22minnumber%22:1,%22minspecial%22:1,%22specials%22:[47,33,61,64,63,46,95,45],%22characters%22:%220123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz%22}";
        $bookmark.value = bookmark;
        await triggerEvent("paste", $bookmark);
        let tests = $sitename.value === "Guru";
        tests = tests && $username.value === "alan";
        tests = tests && $sitepw.value === "UG1qIyn6mSuJ";
        if (tests) {
            passed++;
            console.log("Passed: Test bookmark");
        } else {
            failed++;
            console.warn("Failed: Test bookmark: Guru, alan, UG1qIyn6mSuJ", 
            "|" + $sitename.value + "|", "|" + $username.value + "|", "|" + $sitepw.value + "|");
        }
     }
    // Test save as default
    async function testSaveAsDefault() {
        resetState();
        localStorage.restart = "testSaveAsDefault2";
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $pwlength.value = 15;
        await triggerEvent("blur", $pwlength);
        await triggerEvent("click", $allowspecialcheckbox);
        $specials.value = "%^&";
        triggerEvent("blur", $specials);
        $makedefaultbutton.click();
        location.reload();
        // Test is in testSaveAsDefault2
    }
    async function testSaveAsDefault2() {
        localStorage.restart = "";
        let tests = $pwlength.value === "15";
        tests = tests && $allowspecialcheckbox.checked;
        tests = tests && $specials.value === "%^&";
        if (tests) {
            passed++;
            console.log("Passed: Test save as default");
        } else {
            
            console.warn("Failed: Test save as default", "15", "|" + $pwlength.value + "|");
        }
        $pwlength.value = 12;
        $specials.value = "/!=@?._-";
        await triggerEvent("blur", $specials);
        await triggerEvent("click", $allowspecialcheckbox);
    }
    // Utility functions
    async function fillForm(superpw, domainname, sitename, username) {
        clearForm();
        if (superpw) {
            $superpw.value = superpw;
            await triggerEvent("blur", $superpw);
        }
        if (domainname) {
            $domainname.value = domainname;
            await triggerEvent("blur", $domainname);
        }
        if (sitename) {
            $sitename.value = sitename;
            await triggerEvent("blur", $sitename);
        }
        if (username) {
            $username.value = username;
            await triggerEvent("blur", $username);
        }
        SitePassword.settings.sitename = $sitename.value;
        SitePassword.settings.username = $username.value;
        SitePasswordWeb.saveSettingControls(SitePassword.settings);
    }
    async function phishingSetup() {
        await fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $remember.onclick();
        clearForm();
        $domainname.value = "https://allantheguru.alanhkarp.com";
        await triggerEvent("blur", $domainname);
        $sitename.value = "Guru";
        await triggerEvent("blur", $sitename);
    }
    async function triggerEvent(event, element) {
        let promise = wrapHandler(event, element);
        if (event === "click") element.checked = !element.checked;
        element.dispatchEvent(new Event(event));
        await promise
    }
    function wrapHandler(event, element) {
        return new Promise((resolve, reject) => {
            resolvers[element.id + event + "Resolver"] = resolve;
        });
    }
    function resetState() {
        clearForm();
        if (!localStorage.restart) {
            localStorage.SitePasswordDataTest = JSON.stringify({domains: {}, sites: {}});
            localStorage.SitePasswordDefaultsTest = JSON.stringify(SitePassword.defaultsettings);
            SitePassword.settings = SitePassword.defaultsettings;
        }
    }
    function clearForm() {
        $superpw.value = "";
        $domainname.value = "";
        $sitename.value = "";
        $username.value = "";
        $sitepw.value = "";
        $code.value = "";
    }
    function get(id) {
        return document.getElementById(id);
    }
}