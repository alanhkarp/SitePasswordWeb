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
    const $specials = get("specials");
    const $makedefaultbutton = get("makedefaultbutton");
    let restart = localStorage.restart;
    if (restart) {
        console.log("Restarting test " + restart);
    } else {
        alert("Starting tests");
    }
    if (!restart) {
        testCalculation();
        testRememberForm();
        testProvidedpw();
        testForget();
        testSaveAsDefault();
    } else {
        if (restart === "testSaveAsDefault2") {
            testSaveAsDefault2();
        } else {
            console.error("Unknown test", restart);
        }
    }
    // Test password calculation
    function testCalculation() {
        const expected = "to3X9g55EK8C";
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        actual = $sitepw.value;
        if (actual === expected) {
            console.log("Passed: Test calculation")
        } else {
            console.warn("Failed: Test calculation", expected, "|" + actual + "|");
        }
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
        $sitepw.onblur();
        $remember.onclick();
        clearForm();
        // See if it remembers
        $superpw.value = "qwerty";
        $superpw.onkeyup();
        $domainname.value = "https://alantheguru.alanhkarp.com";
        $domainname.onpaste();
        if ($sitepw.value === sitepw) {
            console.log("Passed: Test provided pw");
        } else {
            console.warn("Failed: Test provided pw", sitepw, "|" + $sitepw.value + "|");
        }
    }
    // Test forget
    function testForget() {
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "Guru", "alan");
        get("domainname3bluedots").onmouseover();
        get("domainnamemenuforget").onclick();
        $remember.onclick();
        get("forgetbutton").onclick();
        // See if it forgot
        fillForm("qwerty", "https://alantheguru.alanhkarp.com", "", "");
        let db = JSON.parse(localStorage.SitePasswordDataTest);
        // Check the database directly since the form doesn't act the same programatically
        if (!db.domains["alantheguru.alanhkarp.com"] && !db.sites["guru"]) {
            console.log("Passed: Test forget");
        } else {
            console.warn("Failed: Test forget", db.domains["alantheguru.alanhkarp.com"], db.sites["guru"].sitename);
        } 
    }
    // Test save as default
    function testSaveAsDefault() {
        resetState();
        localStorage.restart = "testSaveAsDefault2";
        $pwlength.value = 15;
        $pwlength.onkeyup();
        $allowspecialcheckbox.click();
        $specials.value = "%^&";
        $specials.onkeyup();
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
        $specials.onkeyup();
        $allowspecialcheckbox.click();
    }
    // Utility functions
    function fillForm(superpw, domainname, sitename, username) {
        if (superpw) {
            $superpw.value = superpw;
            $superpw.onkeyup();
        }
        if (domainname) {
            $domainname.value = domainname;
            $domainname.onblur();
        }
        if (sitename) {
            $sitename.value = sitename;
            $sitename.onkeyup();
        }
        if (username) {
            $username.value = username;
            $username.onkeyup();
        }
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
        $superpw.onkeyup();
    }
    function get(id) {
        return document.getElementById(id);
    }
}