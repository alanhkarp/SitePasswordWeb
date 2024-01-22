// Set localStorage.test = true to run tests
// Some tests may fail due to small timing changes. Run them again.
function runTests() {
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
        console.log("Restarting test " + restart);
    } else {
        alert("Starting tests");
    }
    // setTimeout needed to allow previous test to complete
    if (!restart) {
        testCalculation();
        let delay = 1000;
        setTimeout(testExtreme, delay); delay += 1000;
        setTimeout(testRememberForm, delay); delay += 1000;
        setTimeout(testProvidedpw, delay); delay += 1000;
        setTimeout(testForget, delay); delay += 1000;
        setTimeout(testPhishing, delay); delay += 1000;
        setTimeout(testBookmark, delay); delay += 1000;
        setTimeout(testSaveAsDefault, delay); delay += 1000;
    } else {
        if (restart === "testSaveAsDefault2") {
            testSaveAsDefault2();
        } else {
            console.error("Unknown test", restart);
        }
    }
    // Test password calculation
    function testCalculation() {
        const expected = "UG1qIyn6mSuJ";
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $superpw.onblur();
        setTimeout(() => {
            actual = $sitepw.value;
            if (actual === expected) {
                console.log("Passed: Test calculation")
            } else {
                console.warn("Failed: Test calculation", expected, "|" + actual + "|");
            }
        }, 500);                
    }
    // Test extreme settings
    function testExtreme() {
        const expected = "z?!6GH-!C-_$";
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $allowspecialcheckbox.checked = true;
        $minspecial.value = 7;
        SitePassword.settings.allowspecial = true;
        SitePassword.settings.minspecial = 7;
        $superpw.onblur();
        setTimeout(() => {
            actual = $sitepw.value;
            if (actual === expected) {
                console.log("Passed: Test extreme settings")
            } else {
                console.warn("Failed: Test calculation", expected, "|" + actual + "|");
            }
        }, 900);  
    }
    function testRememberForm() {
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $remember.onclick();
        clearForm();
        // See if it remembers
        $domainname.value = "https://alantheguru.alanhkarp.com";
        $domainname.onblur();
        let tests = $sitename.value.trim().toLowerCase() === "guru";
        tests = tests && $username.value === "alan";
        if (tests) {
            console.log("Passed: Test remember form");
        } else {
            console.warn("Failed: Test remember form", "Guru", "alan", "|" + $sitename.value + "|");
        }
    }
    function testProvidedpw() {
        resetState();
        const sitepw = "MyStrongPassword";
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $providesitepw.click();
        $sitepw.value = sitepw;
        setTimeout(() => {
            $sitepw.onblur();
            $remember.onclick();
            clearForm();
            // See if it remembers
            $superpw.value = "qwerty";
            $superpw.onkeyup();
            setTimeout(() => {
                $domainname.value = "https://alantheguru.alanhkarp.com";
                $domainname.onpaste();
                if ($sitepw.value === sitepw) {
                    console.log("Passed: Test provided pw");
                } else {
                    console.warn("Failed: Test provided pw", sitepw, "|" + $sitepw.value + "|");    
                }
            }, 500);
        }, 0);
    }
    // Test forget
    function testForget() {
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $remember.onclick();
        $domainname3bluedots.onmouseover();
        $domainnamemenuforget.onclick();
        $forgetbutton.onclick();
        // See if it forgot
        clearForm();
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "", "");
        let db = JSON.parse(localStorage.SitePasswordDataTest);
        // Check the database directly since the form doesn't act the same programatically
        let test = !db.domains["alantheguru.alanhkarp.com"] && !db.sites["guru"];
        if (!test) {
            console.warn("Failed: Test forget when site name is supposed to be empty");
        }
        // See if database still has site name if it should
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $remember.onclick();
        phishingSetup();
        $warningbutton.onclick();
        $domainname3bluedots.onmouseover();
        $domainnamemenuforget.onclick();
        $forgetbutton.onclick();
        db = JSON.parse(localStorage.SitePasswordDataTest);
        test = test && !db.domains["allantheguru.alanhkarp.com"] && db.sites["guru"];
        // See if forget by site name works
        phishingSetup();
        $warningbutton.onclick(); // Now I have two domain names pointing to the same site name
        $sitename3bluedots.onmouseover();
        $sitenamemenuforget.onclick();
        $forgetbutton.onclick();
        db = JSON.parse(localStorage.SitePasswordDataTest);
        test = test && !db.domains["alantheguru.alanhkarp.com"] && !db.sites["guru"];
        test = test && !db.domains["allantheguru.alanhkarp.com"];
        // See if forget by username works
        phishingSetup();
        $warningbutton.onclick(); // Now I have two domain names pointing to the same site name
        $username3bluedots.onmouseover();
        $usernamemenuforget.onclick();
        $forgetbutton.onclick();
        db = JSON.parse(localStorage.SitePasswordDataTest);
        test = test && !db.domains["alantheguru.alanhkarp.com"] && !db.sites["guru"];
        test = test && !db.domains["allantheguru.alanhkarp.com"];
        if (test) {
            console.log("Passed: Test forget");
        } else {
            console.warn("Failed: Test forget");
        } 
    }
    // Test phishing
    function testPhishing() {
        phishingSetup();
        // Does warning appear?
        let test = $phishing.style.display === "block";
        // Does warning go away leaving form cleared?
        $cancelwarning.onclick();
        test = test && $phishing.style.display === "none" && $sitename.value === "";
        // Does setting new site name work?
        phishingSetup();
        $nicknamebutton.onclick();
        test = test && $phishing.style.display === "none" && $sitename.value === "Guru";
        // Does same account option work?
        phishingSetup();
        $warningbutton.onclick();
        test = test && $phishing.style.display === "none" && $sitename.value === "Guru";
        test = test && $username.value === "alan";
        $remember.onclick();
        test = test && SitePassword.database.domains["allantheguru.alanhkarp.com"] === "guru";
         if (test) {
            console.log("Passed: Test phishing");
        } else {    
            console.warn("Failed: Test phishing");
        }
    }
    function testBookmark() {
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "", "");
        let bookmark = "https://sitepassword.info/index.html?bkmk=ssp://{%22sitename%22:%22Guru%22,%22username%22:%22alan%22,%22providesitepw%22:false,%22xor%22:[0,0,0,0,0,0,0,0,0,0,0,0],%22pwlength%22:12,%22domainname%22:%22alantheguru.alanhkarp.com%22,%22pwdomainname%22:%22alantheguru.alanhkarp.com%22,%22startwithletter%22:true,%22allowlower%22:true,%22allowupper%22:true,%22allownumber%22:true,%22allowspecial%22:false,%22minlower%22:1,%22minupper%22:1,%22minnumber%22:1,%22minspecial%22:1,%22specials%22:[47,33,61,64,63,46,95,45],%22characters%22:%220123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz%22}";
        $bookmark.value = bookmark;
        $bookmark.onpaste();
        setTimeout(() => {
            $superpw.onblur();
            setTimeout(() => {
                let tests = $sitename.value === "Guru";
                tests = tests && $username.value === "alan";
                tests = tests && $sitepw.value === "UG1qIyn6mSuJ";
                if (tests) {
                    console.log("Passed: Test bookmark");
                } else {    
                    console.warn("Failed: Test bookmark: Guru, alan, UG1qIyn6mSuJ", 
                    "|" + $sitename.value + "|", "|" + $username.value + "|", "|" + $sitepw.value + "|");
                }
            }, 500);    
        }, 0);
     }
    // Test save as default
    function testSaveAsDefault() {
        resetState();
        localStorage.restart = "testSaveAsDefault2";
        $pwlength.value = 15;
        $pwlength.blur();
        $allowspecialcheckbox.click();
        $specials.value = "%^&";
        $specials.onblur();
        $makedefaultbutton.click();
        location.reload();
        // Test is in testSaveAsDefault2
    }
    function testSaveAsDefault2() {
        localStorage.restart = "";
        let tests = $pwlength.value === "15";
        tests = tests && $allowspecialcheckbox.checked;
        tests = tests && $specials.value === "%^&";
        if (tests) {
            console.log("Passed: Test save as default");
        } else {
            console.warn("Failed: Test save as default", "15", "|" + $pwlength.value + "|");
        }
        $pwlength.value = 12;
        $specials.value = "/!=@?._-";
        $specials.onblur();
        $allowspecialcheckbox.click();
    }
    // Utility functions
    function fillForm(superpw, domainname, sitename, username) {
        clearForm();
        if (superpw) {
            $superpw.value = superpw;
        }
        if (domainname) {
            $domainname.value = domainname;
            $domainname.onblur();
        }
        if (sitename) {
            $sitename.value = sitename;
        }
        if (username) {
            $username.value = username;
        }
        SitePassword.settings.sitename = $sitename.value;
        SitePassword.settings.username = $username.value;
        SitePasswordWeb.saveSettingControls(SitePassword.settings);
    }
    function phishingSetup() {
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        $remember.onclick();
        clearForm();
        $domainname.value = "https://allantheguru.alanhkarp.com";
        $domainname.onblur();
        $sitename.value = "Guru";
        $sitename.onblur();    
    }
    function resetState() {
        clearForm();
        if (!localStorage.restart) {
            localStorage.SitePasswordDataTest = JSON.stringify({domains: {}, sites: {}});
            localStorage.SitePasswordDefaultsTest = JSON.stringify(SitePassword.defaultsettings);
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