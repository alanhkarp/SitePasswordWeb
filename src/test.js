// All code for automated tests
alert("Test code loaded");
// Test password calculation
function testCalculation() {
    const password = "qwerty";
    const expected = "pvQhUS2xVu0I";
    const $superpw = document.getElementById("superpw");
    const $sitepw = document.getElementById("sitepw");
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
    console.log("database", SitePassword.database);
}
function testSaveAsDefault2() {
    console.log("testSaveAsDefault restarted", SitePassword.database);
}
// Run all tests
function runTests() {
    let restart = localStorage.restart;
    if (!restart) {
        testCalculation();
        testSaveAsDefault();
    } else {
        if (restart === "testSaveAsDefault") {
            testSaveAsDefault2();
            localStorage.removeItem("restart");
        }
    }
}