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
        alert("Restarting test " + restart);
    } else {
        alert("Starting tests");
    }
    if (!restart) {
        testCalculation();
        testRememberForm();
        testProvidedpw();
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
        const password = "qwerty";
        const expected = "pvQhUS2xVu0I";
        $superpw.value = password;
        $superpw.onkeyup();
        actual = $sitepw.value;
        if (actual === expected) {
            console.log("Passed: Test calculation")
        } else {
            console.warn("Failed: Test calculation", expected, "|" + actual + "|");
        }
        resetState();
    }
    function testRememberForm() {
        $domainname.value = "https://alantheguru.alanhkarp.com";
        $domainname.onpaste();
        $sitename.value = "Guru";
        $sitename.onkeyup();
        $username.value = "alan";
        $username.onkeyup();
        $remember.onclick();
        clearForm();
        // See if it remembers
        $domainname.value = "https://alantheguru.alanhkarp.com";
        $domainname.onpaste();
        let tests = $sitename.value === "Guru";
        tests = tests && $username.value === "alan";
        if (tests) {
            console.log("Passed: Test remember form");
        } else {
            console.warn("Failed: Test remember form", "Guru", "alan", "|" + $sitename.value + "|");
        }
        clearForm();
    }
    function testProvidedpw() {
        const sitepw = "MyStrongPassword";
        $superpw.value = "qwerty";
        $superpw.onkeyup();
        $domainname.value = "https://alantheguru.alanhkarp.com";
        $domainname.onpaste();
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
        resetState();
    }
    // Test save as default
    function testSaveAsDefault() {
        localStorage.restart = "testSaveAsDefault2";
        $pwlength.value = 15;
        $pwlength.onkeyup();
        $allowspecialcheckbox.click();
        $specials.value = "%^&";
        $specials.onkeyup();
        $makedefaultbutton.click();
        console.log("Pending: Test save as default");
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
        resetState();
    }
     // Utility functions
    function resetState() {
        clearForm();
        if (!localStorage.restart) {
            localStorage.removeItem("SitePasswordDataTest");
            localStorage.removeItem("SitePasswordDefaultsTest");
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