// All code for automated tests
alert("Test code loaded");
// Test password calculation
function testCalculation() {
    const password = "qwerty";
    const expected = "pvQhUS2xVu0I";
    const $superpw = get("superpw");
    const $sitepw = get("sitepw");
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
    localStorage.restart = "testSaveAsDefault";
    get("pwlength").value = 15;
    get("allowspecialcheckbox").click();
    get("specials").value = "%^&";
    get("makedefaultbutton").click();
}
function testSaveAsDefault2() {
    let tests = get("pwlength").value === "15";
    tests = tests && get("allowspecialcheckbox").checked;
    tests = tests && get("specials").value === "%^&";
    if (tests) {
        console.log("Passed: Test save as default");
    } else {
        console.error("Failed: Test save as default", "15", "|" + get("pwlength").value + "|");
    }
    // Put things back
    get("pwlength").value = 12;
    get("allowspecialcheckbox").click();
    get("specials").value = "/!=@?._-";
}
function testRememberSettings() {
    localStorage.restart = "testRememberSettings";
    get("sitename").value = "site";
    get("username").value = "user";
    get("remember").click();
}
function testRememberSettings2() {
    let tests = get("sitename").value === "site";
    tests = tests && get("username").value === "user";
    if (tests) {
        console.log("Passed: Test remember settings");
    } else {
        console.error("Failed: Test remember settings", "site", "|" + get("sitename").value + "|");
    }
}
// Run all tests
function runTests() {
    let restart = localStorage.restart;
    if (!restart) {
        testCalculation();
        testRememberSettings();
        testSaveAsDefault();
    } else {
        if (restart === "testSaveAsDefault") {
            testSaveAsDefault2();
            localStorage.removeItem("restart");
        } else if (restart === "testRememberSettings") {
            testRememberSettings2();
            localStorage.removeItem("restart");
        }
    }
}
// Utility functions
function get(id) {
    return document.getElementById(id);
}