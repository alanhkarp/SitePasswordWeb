"use strict";
if (typeof SitePassword !== 'object') {
    console.log("ERROR! `SitePassword` must be defined (include `bg.js`)");
}
/*
    if domainname is empty
        bookmark disabled
        remember disabled
    if domainname in database
        bookmark enabled
        sitename/username/settings loaded from database
        remember enabled
    if domainname unrecognized
        bookmark enabled

    if bookmark pasted
        if pasted bookmark does not parse
            bad bookmark alert!
        if pasted bookmark does not match domainname
            phishing warning!
            if resetbutton
                clear all fields except masterpassword
            if trustbutton
                sitename/username/settings loaded from bookmark
                remember enabled
        if pasted bookmark matches domainname
            sitename/username/settings loaded from bookmark
            remember enabled
        bookmark cleared

    if sitename is empty
        remember disabled
    if sitename in database
        if domainname does not designate sitename
            phishing warning!
            if resetbutton
                clear all fields except masterpassword
            if trustbutton
                username/settings loaded from database
                remember enabled
    if sitename unrecognized
        if username is empty
            remember disabled
        if username is filled
            remember enabled

    if remember
        domainname/sitename/username/settings saved to database
*/

let query = window.location.search;
let bkmkSettings;
if (query) {
    let params = new URLSearchParams(query);
    let bkmk = params.get("bkmk");
    bkmkSettings = JSON.parse(bkmk.substring(6));
}

let SitePasswordWeb = ((function (self) {
    let normalize = SitePassword.normalize;

    function get(element) {
        if (typeof element === 'string') {
            return document.getElementById(element);
        }
        return element;
    }
    function copyToClipboard(element) {
        element.focus();
        navigator.clipboard.writeText(element.value);
    }
    function setupdatalist(element, list) {
        let datalist = get(element.id + "s");
        list.forEach((data) => {
            let option = document.createElement("option");
            option.value = data;
            option.innerText = data;
            datalist.appendChild(option);
        });
    }
    
    self.onload = function () {
        const $masterpw = get("masterpw");
        const $domainname = get("domainname");
        const $bookmark = get("bookmark");
        const $sitename = get("sitename");
        const $username = get("username");
        const $resetbutton = get("resetbutton");
        const $trustbutton = get("trustbutton");
        const $nicknamebutton = get("nicknamebutton");
        const $results = get("results");
        const $sitepw = get("sitepw");
        const $remember = get("remember");
        const $forget = get("forget");
        const $providesitepw = get("providesitepw");
        const $providecode = get("providecode");
        const $pwlength = get("pwlength");
        const $startwithletter = get("startwithletter");
        const $allowlowercheckbox = get("allowlowercheckbox");
        const $minlower = get("minlower");
        const $allowuppercheckbox = get("allowuppercheckbox");
        const $minupper = get("minupper");
        const $allownumbercheckbox = get("allownumbercheckbox");
        const $minnumber = get("minnumber");
        const $allowspecialcheckbox = get("allowspecialcheckbox");
        const $minspecial = get("minspecial");
        const $specials = get("specials");
        const $downloadbutton = get("downloadbutton");

        if (bkmkSettings) {
            SitePassword.settings = bkmkSettings;
            $domainname.value = bkmkSettings.domainname;
            $sitename.value = bkmkSettings.sitename;
            $username.value = bkmkSettings.username;
            get("bkmk").style.display = "block";
            $masterpw.focus();
        }

        function loadSettingControls(settings) {
            $providesitepw.checked = settings.providesitepw;
            if ($providesitepw.checked && $sitename && $username) {
                $sitepw.readOnly = false;
                $sitepw.placeholder = "Enter your master password";
                $masterpw.focus();
            }
            $pwlength.value = settings.pwlength;
            $startwithletter.checked = settings.startwithletter;
            $allowlowercheckbox.checked = settings.allowlower;
            $minlower.value = settings.minlower;
            $allowuppercheckbox.checked = settings.allowupper;
            $minupper.value = settings.minupper;
            $allownumbercheckbox.checked = settings.allownumber;
            $minnumber.value = settings.minnumber;
            $allowspecialcheckbox.checked = settings.allowspecial;
            $minspecial.value = settings.minspecial;
            $specials.value = settings.specials;
            if (settings.allowlower) {
                get("allowlower").style.display = "none";
                get("requirelower").style.display = "inline";
            } else {
                get("allowlower").style.display = "inline";
                get("requirelower").style.display = "none";
            }
            if (settings.allowupper) {
                get("allowupper").style.display = "none";
                get("requireupper").style.display = "inline";
            } else {
                get("allowupper").style.display = "inline";
                get("requireupper").style.display = "none";
            }
            if (settings.allownumber) {
                get("allownumber").style.display = "none";
                get("requirenumber").style.display = "inline";
            } else {
                get("allownumber").style.display = "inline";
                get("requirenumber").style.display = "none";
            }
            if (settings.allowspecial) {
                get("allowspecial").style.display = "none";
                get("requirespecial").style.display = "inline";
            } else {
                get("allowspecial").style.display = "inline";
                get("requirespecial").style.display = "none";
            }
        }
        function saveSettingControls(settings) {
            settings.providesitepw = $providesitepw.checked;
            settings.startwithletter = $startwithletter.checked;
            settings.allowlower = $allowlowercheckbox.checked;
            settings.minlower = +$minlower.value;
            settings.allowupper = $allowuppercheckbox.checked;
            settings.minupper = +$minupper.value;
            settings.allownumber = $allownumbercheckbox.checked;
            settings.minnumber = +$minnumber.value;
            settings.allowspecial = $allowspecialcheckbox.checked;
            settings.minspecial = +$minspecial.value;
            settings.specials = $specials.value;
        }
        const $pwok = get("pwok");
        const $pwfail = get("pwfail");
        function generatePassword() {
            saveSettingControls(SitePassword.settings);
            const pw = SitePassword.generatePassword();
            if (pw || !$masterpw.value) {
                $pwok.style.display = "flex";
                $pwfail.style.display = "none";
            } else {
                $pwok.style.display = "none";
                $pwfail.style.display = "flex";
            }
            if ($providesitepw.checked) {
                $sitepw.value = SitePassword.stringXorArray(pw, SitePassword.settings.xor);
            } else {
                SitePassword.settings.xor = SitePassword.xorStrings($sitepw.value, $sitepw.value);
                $sitepw.value = pw;
            }
            const report = zxcvbn($sitepw.value);
            $sitepw.style.color = strengthColor[report.score];
            $sitepw.title = strengthText[report.score] + " site password";
            enableRemember();
            if ($sitename.value && $username.value) {
                get("providesitepw").disabled = false;
            } else {
                get("providesitepw").disabled = true;
            }
            return pw;
        }
        function handleBlur(id) {
            const $element = get(id);
            SitePassword.settings[id] = $element.value;
            generatePassword();
        }
        function handleKeyupNumber(id) {
            const value = get(id).value;
            if (value && isNaN(value)) {
                alert("Must be a number");
            } else {
                SitePassword.settings[id] = +value;
                generatePassword();
            }
        }
        function handleKeyup(id) {
            const $element = get(id);
            SitePassword.settings[id] = $element.value;
            generatePassword();
            //$element.focus();
        }

        const $instructionpanel = get("instructionpanel");
        const $maininfo = get("maininfo");
        $maininfo.onclick = function () {
            if ($instructionpanel.style.display === "none") {
                $instructionpanel.style.display = "block";
            } else {
                $instructionpanel.style.display = "none";
            }
        }

        const strengthText = ["Too Weak", "Very Weak", "Weak", "Good", "Strong"];
        const strengthColor = ["#bbb", "#f06", "#f90", "#093", "#036"]; // 0,3,6,9,C,F
        const $meter = get("password-strength-meter");
        const $meterText = get("password-strength-text");
        $masterpw.onblur = function () {
            SitePassword.setMasterPassword($masterpw.value);
            generatePassword();
            const report = zxcvbn($masterpw.value);
            $meter.value = report.score;
            $meterText.innerHTML = strengthText[report.score];
            $masterpw.style.color = strengthColor[report.score];
            $masterpw.title = strengthText[report.score] + " Master Password";
        }
        $masterpw.onkeyup = function () {
            $masterpw.onblur();
            //$masterpw.focus();
        }
        const $masterpwhide = get("masterpwhide");
        const $masterpwshow = get("masterpwshow");
        $masterpwhide.onclick = function () {
            $masterpw.type = "password";
            $masterpwhide.style.display = "none";
            $masterpwshow.style.display = "block";
            $masterpw.focus();
        }
        $masterpwshow.onclick = function () {
            $masterpw.type = "text";
            $masterpwhide.style.display = "block";
            $masterpwshow.style.display = "none";
            $masterpw.focus();
        }

        $domainname.onblur = function () {
            const domainname = parseDomain(normalize($domainname.value));
            get("bkmk").style.display = "none";
            $domainname.value = domainname;
            SitePassword.domainname = domainname;
            const sitename = SitePassword.siteForDomain(domainname);
            const settings = SitePassword.loadSettings(sitename);
            updateSettings(settings);
            generatePassword();
        }
        $domainname.onpaste = function () {
            setTimeout(() => {
                enableBookmark();
                //$domainname.onblur();
                $bookmark.focus();  // NOTE: this causes `onblur`
            }, 0);
        }
        $domainname.onkeyup = function () {
            enableBookmark();
        }
        function parseDomain(url) {
            const protocol = url.split(":")[0].toLowerCase();
            const split = url.split("/");
            let domain = (split.length > 1 ? split[2] : split[0]);
            if (domain && !isValidDomain(normalize(domain))) {
                alert("Invalid domain.  Try again.");
                domain = "";
            } else if (domain && protocol !== "https") {
                httpWarningOn();
            } else {
                httpWarningOff();
            }
            return domain;
        }
        // From https://miguelmota.com/bytes/validate-domain-regex/
        function isValidDomain(v) {
            if (!v) return false;
            var re = /^(?!:\/\/)([a-zA-Z0-9-]+\.){0,5}[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,64}?$/gi;
            return re.test(v);
        }
        function updateSettings(settings) {
            $sitename.value = settings.sitename;
            $username.value = settings.username;
            loadSettingControls(settings);
            if ($username.value) httpWarningOff();
            phishingWarningOff();
            generatePassword();
        }

        // loginurl = https://alantheguru.alanhkarp.com/
        // bookmark = ssp://{"domainname":"alantheguru.alanhkarp.com","sitename":"Guru","username":"alan","pwlength":10,"startwithletter":true,"allowlower":true,"allowupper":true,"allownumber":true,"allowspecial":false,"minlower":1,"minupper":1,"minnumber":1,"minspecial":0,"specials":"/!=@?._-%22,%22characters%22:%22abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ab%22,%22displayname%22:%22alantheguru.alanhkarp.com%22}
        // bookmark = ssp://{"domainname":"alantheguru.alanhkarp.com","sitename":"Guru","username":"alan","pwlength":10,"startwithletter":true,"allowlower":true,"allowupper":true,"allownumber":true,"allowspecial":false,"minlower":1,"minupper":1,"minnumber":1,"minspecial":0,"specials":"/!=@?._-%22}
        // sitepw --> qPz43sW0Ws
        // bookmark = ssp://{"domainname":"alantheguru.alanhkarp.com","sitename":"The Real Alan","username":"dalnefre","pwlength":"15","startwithletter":false,"allowlower":true,"minlower":"1","allowupper":true,"minupper":"1","allownumber":true,"minnumber":"1","allowspecial":true,"minspecial":"1","specials":"$/!=@?._-"}
        // sitepw --> G.iJQEp-qB65UF5
        $bookmark.onpaste = function () {
            setTimeout(() => {
                const settings = parseBookmark($bookmark.value);
                $bookmark.value = "";  // clear bookmark field
                if (settings) {
                    if (settings.domainname === $domainname.value) {
                        SitePassword.settings = settings;  // update data-model
                        updateSettings(settings);
                    } else {
                        $sitename.value = settings.sitename;
                        //alert("Bookmark is not for this domain. Try another one.");
                        phishingWarningOn(settings);
                    }
                } else {
                    alert("Invalid bookmark. Copy it again?");
                }
            }, 0);
        }
        function parseBookmark(bookmark) {
            let settings = undefined;
            let bkmkstr = "";
            bkmkstr = bookmark.split("ssp://")[1];
            try {
                let json = bkmkstr
                    .replace(/%22/g, '"')
                    .replace(/%7B/g, '{')
                    .replace(/%7D/g, '}')
                    .replace(/%5B/g, '[')
                    .replace(/%5D/g, ']');
                settings = JSON.parse(json);
            } catch (e) {
                console.log(e);
            }
            // console.log("Bookmark settings:", settings);
            return settings;
        }
        function enableBookmark() {
            $bookmark.disabled = !($domainname.value);
        }

        $sitename.onblur = function () {
            handleBlur("sitename");
            const domainname = $domainname.value;
            const settings = SitePassword.loadSettings($sitename.value);
            const sitename = settings.sitename;
            let testDomain = SitePassword.validateDomain(domainname, sitename);
            if (!sitename) {
                // retain sitename/username for unknown site
                settings.sitename = $sitename.value;
                settings.username = $username.value;
                SitePassword.settings = settings;
                phishingWarningOff();
            } else if (!SitePassword.validateDomain(domainname, sitename)) {
                updateSettings(settings);
            } else {
                phishingWarningMsg(testDomain);
                phishingWarningOn(settings);
            }
            clearDatalist("sitename");
        }
        $sitename.onkeyup = function () {
            handleKeyup("sitename");
        }
        $sitename.onfocus = function () {
            let set = new Set();
            Object.keys(SitePassword.database.sites).forEach((sitename) => {
                set.add(SitePassword.database.sites[normalize(sitename)].sitename);
            })
            let list = [... set].sort();
            setupdatalist(this, list);
        }
        $sitename.onkeyup = function () {
            handleKeyup("sitename");
        }

        $username.onkeyup = function () {
            handleKeyup("username");
        }
        $username.onblur = function() {
            clearDatalist("username");
        }
        $username.onfocus = function () {
            let set = new Set();
            Object.keys(SitePassword.database.sites).forEach((sitename) => {
                set.add(SitePassword.database.sites[normalize(sitename)].username);
            })
            let list = [... set].sort();
            setupdatalist(this, list);
        }

        let $bkmkDomain = get("bkmkDomain");
        $bkmkDomain.onpaste = function () {
            setTimeout(() => {
                if (parseDomain($bkmkDomain.value) === $domainname.value) {
                    phishingWarningOff();
                } else {
                    const settings = SitePassword.loadSettings($sitename.value);
                    phishingWarningMsg($bkmkDomain.value);
                    phishingWarningOn(settings);
                }                    
                get("bkmk").style.display = "none";
            }, 0);
        }
    
        const $phishing = get("phishing");
        $resetbutton.onclick = function () {
            $domainname.value = "";
            enableBookmark();
            SitePassword.domainname = "";
            $results.style.display = "block";  // show sitepw/remember/settings...
            const settings = SitePassword.loadSettings();
            updateSettings(settings);
        }
        function phishingWarningOn(settings) {
            httpWarningOff();
            $phishing.style.display = "block";
            $results.style.display = "none";  // hide sitepw/remember/settings...
            $domainname.classList.add("bad-input");
            $domainname.disabled = true;
            $username.disabled = true;
            $resetbutton.focus();
            $trustbutton.onclick = function () {
                SitePassword.settings = settings;
                SitePassword.storeSettings();
                updateSettings(settings);
           };
           $nicknamebutton.onclick = function () {
                phishingWarningOff();
                $sitename.focus();
           }
        }
        function phishingWarningOff() {
            $phishing.style.display = "none";
            $results.style.display = "block";  // show sitepw/remember/settings...
            $domainname.classList.remove("bad-input");
            $domainname.disabled = false;
            $username.disabled = false;
            $trustbutton.onclick = function () {
                console.log("WARNING! trustbutton clicked while phishing warning off.");
            };
            $nicknamebutton.onclick = function () {
                console.log("WARNING! nicknamebutton clicked while phishing warning off.");
            };
        }
        function phishingWarningMsg(testDomain) {
            let warnElement = get("phishingtext");
            warnElement.innerHTML = "<strong>Warning:</strong> You may be at a fake site that is trying to steal your password. ";
            warnElement.innerHTML += "You previously used this nickname for";
            warnElement.innerHTML += "<pre style=\"margin-left:1em;\">" + $domainname.value + "</pre>";
            warnElement.innerHTML += "but the domain name asking for your password is";
            warnElement.innerHTML += "<pre style=\"margin-left:1em;\">" + parseDomain(normalize(testDomain)) + "</pre>";
            warnElement.innerHTML += "It is common to see different domain names for the same account login. ";
            warnElement.innerHTML += "Click the top (green) button if that's not the case or the middle (yellow) button if it is. ";
            warnElement.innerHTML += "You can also pick a new nickname if this page is for a different account.";
        }

        const $http = get("http");
        function httpWarningOn() {
            $http.style.display = "block";
        }
        function httpWarningOff() {
            $http.style.display = "none";
        }

        const $sitepwhide = get("sitepwhide");
        const $sitepwshow = get("sitepwshow");
        $sitepwhide.onclick = function () {
            $sitepw.type = "password";
            $sitepwhide.style.display = "none";
            $sitepwshow.style.display = "block";
            //$sitepw.focus();
        }
        $sitepwshow.onclick = function () {
            $sitepw.type = "text";
            $sitepwhide.style.display = "block";
            $sitepwshow.style.display = "none";
            $sitepw.focus();
        }
        get("useridcopy").onclick = function () {
            copyToClipboard($username);
        }
        get("sitepwcopy").onclick = function () {
            copyToClipboard($sitepw);
        }
        $sitepw.onblur = function () {
            if ($sitepw.readOnly) return;
            let provided = $sitepw.value;
            let computed = generatePassword();
            SitePassword.settings.xor = SitePassword.xorStrings(provided, computed);
            $sitepw.value = provided;
            enableRemember();
         }
         $sitepw.onkeyup = function () {
            $providecode.disabled = true;
            $sitepw.onblur();
         }
        $remember.onclick = function () {
            SitePassword.storeSettings();
            //phishingWarningOff();
            enableRemember();
        }
        $forget.onclick = function () {
            const settings = SitePassword.forgetSettings();
            $domainname.value = "";
            updateSettings(settings);
        }
        function enableRemember() {
            $remember.disabled =
                !($domainname.value && $sitename.value && $username.value && SitePassword.settingsModified());
            $forget.disabled =
                (!$domainname.value || SitePassword.settingsModified()) || !$sitename.value;
        }
        $providesitepw.onclick = function () {
            const settings = SitePassword.settings;
            settings.providesitepw = $providesitepw.checked;
            if ($providesitepw.checked && $username.value && $sitename.value) {
                $sitepw.readOnly = false;
                $sitepw.value = "";
                $sitepw.placeholder = "Enter your site password";
                $sitepw.focus();   
                $providecode.disabled = false; 
            } else {
                $sitepw.readOnly = true;
                $sitepw.placeholder = "Generated site password";
                $providecode.disabled = true;
                generatePassword();
            }
        }
        $providecode.onblur = function() {
            let settings = SitePassword.settings;
            settings.xor = JSON.parse("[" + $providecode.value + "]");
            generatePassword();
        }
    
        $pwlength.onkeyup = function () {
            handleKeyupNumber("pwlength");
        }
        $startwithletter.onclick = function () {
            SitePassword.settings.startwithletter = $startwithletter.checked;
            restrictStartsWithLetter();
            generatePassword();
        }
        $allowlowercheckbox.onclick = function () {
            handleCheck("lower");
        }
        $minlower.onkeyup = function () {
            handleKeyupNumber("minlower");
        }
        $allowuppercheckbox.onclick = function () {
            handleCheck("upper");
        }
        $minupper.onkeyup = function () {
            handleKeyupNumber("minupper");
        }
        $allownumbercheckbox.onclick = function () {
            handleCheck("number");
        }
        $minnumber.onkeyup = function () {
            handleKeyupNumber("minnumber");
        }
        $allowspecialcheckbox.onclick = function () {
            handleCheck("special");
            $specials.disabled = !($allowspecialcheckbox.checked);
        }
        $minspecial.onkeyup = function () {
            handleKeyupNumber("minspecial");
        }
        const alphanumerics = /[0-9A-Za-z]/g;
        $specials.onkeyup = function () {
            $specials.value = $specials.value
                .replace(alphanumerics, '')  // eliminate alphanumerics
                .substring(0, 12);  // limit to 12 specials
            handleKeyup("specials");
        }
        function handleCheck(group) {
            const $allow_group_checkbox = get("allow"+group+"checkbox");
            const $min_group = get("min"+group);
            const $allow_group = get("allow"+group);
            const $require_group = get("require"+group);
            if ($allow_group_checkbox && $allow_group && $require_group && $min_group) {
                SitePassword.settings["allow"+group] = $allow_group_checkbox.checked;
                if ($allow_group_checkbox.checked) {
                    $allow_group.style.display = "none";
                    $require_group.style.display = "inline";
                    $min_group.disabled = false;
                    $min_group.value = SitePassword.settings["min"+group];
                } else {
                    $allow_group.style.display = "inline";
                    $require_group.style.display = "none";
                    $min_group.disabled = true;
                    $min_group.value = SitePassword.settings["min"+group];
                }
                restrictStartsWithLetter();
                generatePassword();
            } else {
                console.log('handleCheck: missing control(s) for group:', group);
            }
        }
        function restrictStartsWithLetter() {
            let settings = SitePassword.settings;
            if (!(settings.allowupper || settings.allowlower)) {
                settings.startwithletter = false;
                $startwithletter.checked = false;
            }
        }
        function clearDatalist(listid) {
            let datalist = get(listid);
            if (datalist.hasChildNodes) {
                const newDatalist = datalist.cloneNode(false);
                datalist.replaceWith(newDatalist);
            }
        }
        
        $downloadbutton.onclick = function siteDataHTML() {
            const domains = SitePassword.database.domains;
            const sites = SitePassword.database.sites;
            const sorted = Object.keys(domains).sort(function (x, y) {
                if (x.toLowerCase() < y.toLowerCase()) return -1;
                if (x.toLowerCase() == y.toLowerCase()) return 0;
                return 1;
            });
            let sd = "<html><body><table>";
            sd += "<caption>You can use these settings at <a href='https://sitepassword.info'>https://sitepassword.info.</a>";
            sd += "<br />Click on the domain name to open sitepassword.info or right click on the domain name and copy the link address to paste into the bookmark field.</caption>";
            sd += "<th>Domain Name</th>";
            sd += "<th>Site Name</th>";
            sd += "<th>User Name</th>";
            sd += "<th>Password Length</th>";
            sd += "<th>Start with Letter</th>";
            sd += "<th>Allow Lower</th>";
            sd += "<th>Min Lower</th>";
            sd += "<th>Allow Upper</th>";
            sd += "<th>Min Upper</th>";
            sd += "<th>Allow Numbers</th>";
            sd += "<th>Min Numbers</th>";
            sd += "<th>Allow Specials</th>";
            sd += "<th>Min Specials</th>";
            sd += "<th>Specials</th>";
            sd += "<th>Code for User Provided Password</th>";
            sd += "</tr>";
            for (const domainname of sorted) {
                const sitename = domains[domainname];
                let s = sites[sitename];
                s.domainname = domainname;
                let bkmk = JSON.stringify(s);
                sd += "<tr>";
                sd += "<td><a title='Right click to copy bookmark' href=https://sitepassword.info/index.html?bkmk=ssp://" + bkmk + ">" + domainname + "</a></td>";
                sd += "<td><pre>" + s.sitename + "</pre></td>";
                sd += "<td><pre>" + s.username + "</pre></td>";
                sd += "<td><pre>" + s.pwlength + "</pre></td>";
                sd += "<td><pre>" + s.startwithletter + "</pre></td>";
                sd += "<td><pre>" + s.allowlower + "</pre></td>";
                sd += "<td><pre>" + s.minlower + "</pre></td>";
                sd += "<td><pre>" + s.allowupper + "</pre></td>";
                sd += "<td><pre>" + s.minupper + "</pre></td>";
                sd += "<td><pre>" + s.allownumber + "</pre></td>";
                sd += "<td><pre>" + s.minnumber + "</pre></td>";
                sd += "<td><pre>" + s.allowspecial + "</pre></td>";
                sd += "<td><pre>" + s.minspecial + "</pre></td>";
                sd += "<td><pre>" + s.specials + "</pre></td>";
                sd += "<td><pre>" + (s.xor || "") + "<pre></td>";
                sd += "</tr>";
            }
            sd += "</table></body></html>";
            const $data = get("data");
            const mimetype = "data:application/octet-stream,";
            $data.href = mimetype + encodeURIComponent(sd);
            $data.click();
            return sd;
        }

        get("useinfo").onclick = function () { sectionClick("use") };
        get("overviewinfo").onclick = function () { sectionClick("overview"); };
        get("masterinfo").onclick = function () { sectionClick("master"); };
        get("siteinfo").onclick = function () { sectionClick("site"); };
        get("acceptableinfo").onclick = function () { sectionClick("acceptable"); };
        get("changeinfo").onclick = function () { sectionClick("change"); };
        get("phishinginfo").onclick = function () { sectionClick("phishing"); };
        get("extensioninfo").onclick = function () { sectionClick("extension"); };
        get("appsinfo").onclick = function () { sectionClick("apps"); };
        get("downloadinfo").onclick = function () { sectionClick("download"); };
        get("sourceinfo").onclick = function () { sectionClick("source"); };
        get("paymentinfo").onclick = function () { sectionClick("payment"); };
        function sectionClick(id) {
            const element = get(id + "div");
            if (element.style.display === "none") {
                element.style.display = "block";
                get("open" + id).style.display = "none";
                get("close" + id).style.display = "block";
            } else {
                element.style.display = "none";
                get("open" + id).style.display = "block";
                get("close" + id).style.display = "none";
            }
        }

        if (bkmkSettings) {
            SitePassword.loadSettings(bkmkSettings.sitename);
            get("bkmk").style.display = "block";
            SitePassword.settings = bkmkSettings;
            SitePassword.domainname = bkmkSettings.domainname;
            $domainname.value = bkmkSettings.domainname;
            updateSettings(bkmkSettings);
            enableRemember();
        }
        $masterpw.focus();
    }
    return self;
})({
    version: "1.0",
}));
window.onload = function () {
    SitePasswordWeb.onload();
}

/* 
This code is a major modification of the code released with the
following licence.  Neither Hewlett-Packard Company nor Hewlett-Packard
Enterprise were involved in the modification.  This source code is
available at https://github.com/alanhkarp/SitePasswordWeb.

Copyright 2011 Hewlett-Packard Company. This library is free software;
you can redistribute it and/or modify it under the terms of the GNU
Lesser General Public License (LGPL) as published by the Free Software
Foundation; either version 2.1 of the License, or (at your option) any
later version. This library is distributed in the hope that it will
be useful, but WITHOUT ANY WARRANTY; without even the implied warranty
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
Lesser General Public License for more details. You should have
received a copy of the GNU Lesser General Public License (LGPL) along
with this library; if not, write to the Free Software Foundation,
Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
Please contact the Hewlett-Packard Company <www.hp.com> for
information regarding how to obtain the source code for this library.
*/