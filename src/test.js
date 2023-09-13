// Fields needed for tests
const $domainname = get("domainname");
const $bookmark = get("bookmark");
const $sitename = get("sitename");
const $username = get("username");
const $remember = get("remember");
const $superpw = get("superpw");
const $sitepw = get("sitepw");
const $code = get("code");
const $pwlength = get("pwlength");
const $allowspecialcheckbox = get("allowspecialcheckbox");
const $specials = get("specials");
const $makedefaultbutton = get("makedefaultbutton");

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
        console.error("Failed: Test calculation", expected, "|" + actual + "|");
    }
}
// Test save as default
function testSaveAsDefault() {
    localStorage.restart = "testSaveAsDefault2";
    $pwlength.value = 15;
    $allowspecialcheckbox.click();
    $specials.value = "%^&";
    $makedefaultbutton.click();
}
function testSaveAsDefault2() {
    localStorage.restart = "";
    let tests = $pwlength.value === "15";
    tests = tests && $allowspecialcheckbox.checked;
    tests = tests && $specials.value === "%^&";
    if (tests) {
        console.log("Passed: Test save as default");
    } else {
        console.error("Failed: Test save as default", "15", "|" + get("pwlength").value + "|");
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
        console.log("Passed: Test remember settings");
    } else {
        console.error("Failed: Test remember settings", "Guru", "alan", "|" + $sitename.value + "|");
    }
    clearForm();
}
// Run all tests
function runTests() {
    let restart = localStorage.restart;
    if (restart) {
        alert("Restarting test " + restart);
    } else {
        alert("Starting tests");
    }
    if (!restart) {
        testCalculation();
        testRememberForm();
        testSaveAsDefault();
    } else {
        window[restart]();
    }
}
// Utility functions
function resetState() {
    localStorage.restart = "";
    clearForm();
    localStorage.removeItem("SitePasswordDataTest");
    localStorage.removeItem("SitePasswordDefaultsTest");
}
function clearForm() {
    $superpw.value = "";
    $domainname.value = "";
    $sitename.value = "";
    $username.value = "";
    $remember.checked = false;
    $sitepw.value = "";
    $code.value = "";
}
function get(id) {
    return document.getElementById(id);
}