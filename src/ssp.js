"use strict";
let logging = false;
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
                clear all fields except superpassword
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
                clear all fields except superpassword
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
    if ('string' !== typeof bkmkSettings.specials) {
        let specials = SitePassword.array2string(bkmkSettings.specials);
        bkmkSettings.specials = specials;
        SitePassword.settings = bkmkSettings;
    }
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
        const $superpw = get("superpw");
        const $domainname = get("domainname");
        const $bookmark = get("bookmark");
        const $sitename = get("sitename");
        const $username = get("username");
        const $cancelwarning = get("cancelwarning");
        const $warningbutton = get("warningbutton");
        const $nicknamebutton = get("nicknamebutton");
        const $results = get("results");
        const $sitepw = get("sitepw");
        const $remember = get("remember");
        const $providesitepw = get("providesitepw");
        const $code = get("code");
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
        const $makedefaultbutton = get("makedefaultbutton")
        const $downloadbutton = get("downloadbutton");
        // Fill in default values in case the user has changed them
        let defaultsettings = SitePassword.getDefaultSettings();
        loadSettingControls(defaultsettings);

        if (bkmkSettings) {
            $domainname.value = bkmkSettings.domainname;
            $sitename.value = bkmkSettings.sitename;
            $username.value = bkmkSettings.username;
            get("bkmk").style.display = "block";
            $superpw.focus();
        }

        function loadSettingControls(settings) {
            $providesitepw.checked = settings.providesitepw;
            if ($providesitepw.checked && $sitename && $username) {
                $sitepw.readOnly = false;
                $sitepw.placeholder = "Enter your super password";
                $superpw.focus();
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
            if (pw || !$superpw.value) {
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
        const $instructionopen = get("instructionopen");
        const $instructionclose = get("instructionclose");
        const $maininfo = get("maininfo");
        $maininfo.onclick = function () {
            if ($instructionpanel.style.display === "none") {
                showInstructions();
                helpAllOff();
            } else {
                hideInstructions();
            }
        }

        const strengthText = ["Too Weak", "Very Weak", "Weak", "Good", "Strong"];
        const strengthColor = ["#bbb", "#f06", "#f90", "#093", "#036"]; // 0,3,6,9,C,F
        const $meter = get("password-strength-meter");
        const $meterText = get("password-strength-text");
        $superpw.onblur = function () {
            SitePassword.setSuperPassword($superpw.value);
            generatePassword();
            const report = zxcvbn($superpw.value);
            $meter.value = report.score;
            $meter.title = strengthText[report.score];
            $superpw.style.color = strengthColor[report.score];
            $superpw.title = strengthText[report.score] + " Super Password";
        }
        $superpw.onkeyup = function () {
            $superpw.onblur();
            //$superpw.focus();
        }
        const $superpwmenuhide = get("superpwmenuhide");
        const $superpwmenushow = get("superpwmenushow");
        $superpwmenuhide.onclick = function () {
            $superpw.type = "password";
            $superpwmenuhide.style.display = "none";
            $superpwmenushow.style.display = "block";
            $superpw.focus();
        }
        $superpwmenushow.onclick = function () {
            $superpw.type = "text";
            $superpwmenuhide.style.display = "block";
            $superpwmenushow.style.display = "none";
            $superpw.focus();
        }
        get("superpwmenu").onmouseleave = function (e) {
            menuOff("superpw", e);
        }
        get("superpw3bluedots").onmouseover = function (e) {
            if (get("superpw").value) {
                get("superpwmenushow").style.opacity = "1";
                get("superpwmenuhide").style.opacity = "1";
            } else {
                get("superpwmenushow").style.opacity = "0.5";
                get("superpwmenuhide").style.opacity = "0.5";
            }
            menuOn("superpw", e);      
        }
        get("superpw3bluedots").onclick = get("superpw3bluedots").onmouseover;
        $superpwmenushow.onclick = function(e) {
            if (!get("superpw").value) return;
            get("superpw").type = "text";
            $superpwmenuhide.classList.toggle("nodisplay");
            $superpwmenushow.classList.toggle("nodisplay")    ;
        }
        get("superpwmenuhide").onclick = function(e) {
            if (!get("superpw").value) return;
            get("superpw").type = "password";
            $superpwmenuhide.classList.toggle("nodisplay");
            $superpwmenushow.classList.toggle("nodisplay")    ;
        }
        get("superpwmenuhelp").onclick = function (e) {
            helpItemOn("superpw");
        }
        get("superpwhelptextclose").onclick = function (e) {
            helpAllOff();
        }
        get("superpwhelptextmore").onclick = function (e) {
            helpAllOff;
            sectionClick("superpw");
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
        get("domainnamemenu").onmouseleave = function (e) {
            menuOff("domainname", e);
        }
        let $domainname3bluedots = get("domainname3bluedots");
        let $domainnamemenuforget = get("domainnamemenuforget");
        let $domainnamemenuhelp = get("domainnamemenuhelp");
        let $domainnamehelptextclose = get("domainnamehelptextclose");
        let $domainnamehelptextmore = get("domainnamehelptextmore");
        $domainname3bluedots.onmouseover = function (e) {
            let domainname = $domainname.value;
            if (domainname && database.domains[domainname]) {
                $domainnamemenuforget.style.opacity = "1";
            } else {
                $domainnamemenuforget.style.opacity = "0.5";
            }
            menuOn("domainname", e);
        }
        $domainname3bluedots.onclick = get("domainname3bluedots").onmouseover;
        $domainnamemenuforget.onclick = function (e) {
            msgon("forget");
            let toforget = normalize(get("domainname").value);
            addForgetItem(toforget);
        }
        $domainnamemenuhelp.onclick = function (e) {
            helpItemOn("domainname");
        }
        $domainnamehelptextclose .onclick = function (e) {
            helpAllOff();
        }
        $domainnamehelptextmore.onclick = function (e) {
            helpAllOff();
            sectionClick("domainname");
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
        get("bookmarkmenu").onmouseleave = function (e) {
            menuOff("bookmark", e);
        }
        let $bookmark3bluedots = get("bookmark3bluedots");
        let $bookmarkmenuhelp = get("bookmarkmenuhelp");
        let $bookmarkhelptextclose = get("bookmarkhelptextclose");
        let $bookmarkhelptextmore = get("bookmarkhelptextmore");
        $bookmark3bluedots.onmouseover = function (e) {
            menuOn("bookmark", e);
        }
        $bookmark3bluedots.onclick = get("bookmark3bluedots").onmouseover;
        get("bookmarkmenu").onmouseleave = function (e) {
            menuOff("bookmark", e);
        } 
        $bookmarkmenuhelp.onclick = function (e) {
            helpItemOn("bookmark");
        }
        $bookmarkhelptextclose.onclick = function (e) {
            helpAllOff();
        }
        $bookmarkhelptextmore.onclick = function (e) {
            helpAllOff();
            sectionClick("bookmark");
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
        get("sitenamemenu").onmouseleave = function (e) {
            menuOff("sitename", e);
        }
        let $sitename3bluedots = get("sitename3bluedots");
        $sitename3bluedots.onmouseover = function (e) {
            let sitename = get("sitename").value;
            if (sitename) {
                get("sitenamemenuforget").style.opacity = "1";
            } else {
                get("sitenamemenuforget").style.opacity = "0.5";
            }
             menuOn("sitename", e);
        }
        $sitename3bluedots.onclick = $sitename3bluedots.onmouseover;
        get("sitenamemenu").onmouseleave = function (e) {
            menuOff("sitename", e);
        }
        get("sitenamemenuforget").onclick = function (e) {
            msgon("forget");
            let toforget = normalize(get("sitename").value);
            let $list = get("toforgetlist");
            for (let domain in database.domains) {
                if (normalize(database.domains[domain]) === toforget) {
                    addForgetItem(domain);
                }
            }
        }
        get("sitenamemenuhelp").onclick = function (e) {
            helpItemOn("sitename");
        }
        get("sitenamehelptextclose").onclick = function (e) {
            helpAllOff();
        }
        get("sitenamehelptextmore").onclick = function (e) {
            helpAllOff();
            sectionClick("sitename");
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
        get("usernamemenu").onmouseleave = function (e) {
            menuOff("username", e);
        }
        let $username3bluedots = get("username3bluedots");
        get("username3bluedots").onmouseover = function (e) {
            let username = get("username").value;
            if (username) {
                get("usernamemenuforget").style.opacity = "1";
                get("usernamemenucopy").style.opacity = "1";
            } else {
                get("usernamemenuforget").style.opacity = "0.5";
                get("usernamemenucopy").style.opacity = "0.5";
            }
             menuOn("username", e);
        }
        $username3bluedots.onclick = $username3bluedots.onmouseover;
        get("usernamemenuforget").onclick = function (e) {
            msgon("forget");
            let toforget = normalize(get("username").value);
            let $list = get("toforgetlist");
            for (let domain in database.domains) {
                let sitename = database.domains[domain];
                if (normalize(database.sites[sitename].username) === toforget) {
                    addForgetItem(domain);
                }
            }
        }
        get("usernamemenucopy").onclick = function(e) {
            let username = get("username").value;
            if (!username) return;
            navigator.clipboard.writeText(username).then(() => {
                if (logging) console.log("wrote to clipboard", username);
                copied("username");
            }).catch((e) => {
                if (logging) console.log("username clipboard write failed", e);
            });
            menuOff("username", e);
        }
        get("usernamemenuhelp").onclick = function (e) {
            helpItemOn("username");
        }
        get("usernamehelptextclose").onclick = function (e) {
            helpAllOff();
        }
        get("usernamehelptextmore").onclick = function (e) {
            helpAllOff();
            sectionClick("username");
        }    
        get("usernamemenucopy").onclick = function () {
            copyToClipboard($username);
        }
        get("sitepwmenucopy").onclick = function () {
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
            $code.disabled = true;
            $sitepw.onblur();
        }
        get("sitepwmenu").onmouseleave = function (e) {
            menuOff("sitepw", e);
        }
        const $sitepw3bluedots = get("sitepw3bluedots");
        const $sitepwmenucopy = get("sitepwmenucopy");
        $sitepw3bluedots.onmouseover = function (e) {
            let sitepw = get("sitepw").value;
            if (sitepw) {
                $sitepwmenucopy.style.opacity = "1";
                $sitepwmenushow.style.opacity = "1";
                $sitepwmenuhide.style.opacity = "1";
            } else {
                $sitepwmenucopy.style.opacity = "0.5";
                $sitepwmenushow.style.opacity = "0.5";
                $sitepwmenuhide.style.opacity = "0.5";
            }
            menuOn("sitepw", e);
        }
        $sitepw3bluedots.onclick = $sitepw3bluedots.onmouseover;
        $sitepwmenucopy.onclick = function(e) {
            let sitepw = get("sitepw").value;
            if (!sitepw) return;
            navigator.clipboard.writeText(sitepw).then(() => {
                if (logging) console.log("wrote to clipboard", sitepw);
                chrome.action.setTitle({title: "A site password may be on the clipboard."});
                get("logopw").title = "A site password may be on the clipboard."
                get("logo").style.display = "none";
                get("logopw").style.display = "block";
                chrome.action.setIcon({"path": "icon128pw.png"});
                chrome.storage.local.set({"onClipboard": true})
                copied("sitepw");
            }).catch((e) => {
                if (logging) console.log("sitepw clipboard write failed", e);
            });
            menuOff("sitepw", e);
        }
        get("sitepwmenuhelp").onclick = function (e) {
            helpItemOn("sitepw");
        }
        get("sitepwhelptextclose").onclick = function (e) {
            helpAllOff();
        }
        get("sitepwhelptextmore").onclick = function (e) {
            helpAllOff();
            sectionClick("sitepw");
        }
        const $sitepwmenuhide = get("sitepwmenuhide");
        const $sitepwmenushow = get("sitepwmenushow");
        $sitepwmenushow.onclick = function () {
            get("sitepw").type = "text";
            $sitepwmenushow.classList.toggle("nodisplay");
            $sitepwmenuhide.classList.toggle("nodisplay")    ;
        };
        $sitepwmenuhide.onclick = function () {
            get("sitepw").type = "password";
            $sitepwmenushow.classList.toggle("nodisplay");
            $sitepwmenuhide.classList.toggle("nodisplay");
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
        $cancelwarning.onclick = function () {
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
            $cancelwarning.focus();
            $warningbutton.onclick = function () {
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
            $warningbutton.onclick = function () {
                console.log("WARNING! trustbutton clicked while phishing warning off.");
            };
            $nicknamebutton.onclick = function () {
                console.log("WARNING! nicknamebutton clicked while phishing warning off.");
            };
        }
        function phishingWarningMsg(testDomain) {
            let sitename = $sitename.value;
            let previous = SitePassword.database.sites[sitename].domainname;
            get("phishingtext0").innerText = get("sitename").value;
            get("phishingtext1").innerText = previous;
            get("phishingtext2").innerText = get("domainname").value;
       }

        const $http = get("http");
        function httpWarningOn() {
            $http.style.display = "block";
        }
        function httpWarningOff() {
            $http.style.display = "none";
        }

        $remember.onclick = function () {
            SitePassword.storeSettings();
            //phishingWarningOff();
            enableRemember();
        }
        function enableRemember() {
            $remember.disabled =
                !($domainname.value && $sitename.value && $username.value && SitePassword.settingsModified());
        }
        $providesitepw.onclick = function () {
            const settings = SitePassword.settings;
            settings.providesitepw = $providesitepw.checked;
            if ($providesitepw.checked && $username.value && $sitename.value) {
                $sitepw.readOnly = false;
                $sitepw.value = "";
                $sitepw.placeholder = "Enter your site password";
                $sitepw.focus();   
                $code.disabled = false; 
            } else {
                $sitepw.readOnly = true;
                $sitepw.placeholder = "Generated site password";
                $code.disabled = true;
                generatePassword();
            }
        }
        $code.onblur = function() {
            let settings = SitePassword.settings;
            settings.xor = JSON.parse("[" + $code.value + "]");
            generatePassword();
        }
        get("codemenu").onmouseleave = function (e) {
            menuOff("code", e);
        }
        let $code3bluedots = get("code3bluedots");
        let $codemenuhelp = get("codemenuhelp");
        let $codehelptextclose = get("codehelptextclose");
        let $codehelptextmore = get("codehelptextmore");
        $code3bluedots.onmouseover = function (e) {
            menuOn("code", e);
        }
        $code3bluedots.onclick = get("code3bluedots").onmouseover;
        get("codemenu").onmouseleave = function (e) {
            menuOff("code", e);
        } 
        $codemenuhelp.onclick = function (e) {
            helpItemOn("code");
        }
        $codehelptextclose.onclick = function (e) {
            helpAllOff();
        }
        $codehelptextmore.onclick = function (e) {
            helpAllOff();
            sectionClick("code");
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
        $makedefaultbutton.onclick = function () {
            let newDefaults = {
                sitename: "",
                username: "",
                providesitepw: false,
                xor: new Array(12).fill(0),
                domainname: "",
                pwdomainname: "",
                pwlength: $pwlength.value,
                startwithletter: $startwithletter.checked,
                allowlower: $allowlowercheckbox.checked,
                allowupper: $allowuppercheckbox.checked,
                allownumber: $allownumbercheckbox.checked,
                allowspecial: $allowspecialcheckbox.checked,
                minlower: $minlower.value,
                minupper: $minupper.value,
                minnumber: $minnumber.value,
                minspecial: $minspecial.value,
                specials: $specials.value,
            }
            SitePassword.defaultsettings = newDefaults;
            SitePassword.storeSettings();
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
        // Generic code for menus
        function copied(which) {
            get(which + "copied").classList.remove("nodisplay");
            setTimeout(() => {
                get(which + "copied").classList.add("nodisplay");
            }, 900);
        }
        function menuOn(which, e) {
            allMenusOff();
            get(which + "3bluedots").style.display = "none";
            get(which + "menu").style.display = "flex";
        }
        function menuOff(which, e) {
            dotsAllOn();
            get(which + "menu").style.display = "none";
        }
        function allMenusOff() {
            get("domainnamemenu").style.display = "none";
            get("bookmarkmenu").style.display = "none";
            get("superpwmenu").style.display = "none";
            get("sitenamemenu").style.display = "none";
            get("usernamemenu").style.display = "none";
            get("sitepwmenu").style.display = "none";
            get("codemenu").style.display = "none";
        }
        function dotsAllOn() {
            get("domainname3bluedots").style.display = "block";
            get("bookmark3bluedots").style.display = "block";
            get("superpw3bluedots").style.display = "block";
            get("sitename3bluedots").style.display = "block";
            get("username3bluedots").style.display = "block";
            get("sitepw3bluedots").style.display = "block";
            get("code3bluedots").style.display = "block";
        }
        function helpItemOn(which) {
            let $main = get("main");
            let mainTop = $main.getBoundingClientRect().top;
            let $input = get(which);
            let top = $input.getBoundingClientRect().top - 15;
            let $element = get(which + "helptext");
            if (!$element.style.display || $element.style.display === "none") {
                helpAllOff();
                $element.style.display = "block";
                $element.style.top = top - mainTop + "px";
                let $buttons = get(which + "helptextclose");
                let bottom = $buttons.getBoundingClientRect().bottom + 10;
                $element.style.height = bottom - top + "px";
                hideInstructions();
            } else {
                helpAllOff();
            }
        }
        function helpItemOff(which) {
            get(which).style.display = "none";
        }
        function helpAllOff() {
            let helps = document.getElementsByName("help");
            for (let help of helps) {
                helpItemOff(help.id); 
            } 
        }
        
        self.instructionSetup = function() {
            let instructions = document.getElementsByName("instructions");
            if (logging) console.log("instructions", instructions);
            for (let instruction of instructions) {
                let section = instruction.id.replace("info", "");
                instruction.onclick = function () { sectionClick(section); }
            }
        }
        function sectionClick(which) {
            if (logging) console.log("sectionClick", which);
            const element = get(which + "div");
            if (element.style.display === "none") {
                closeAllInstructions();
                showInstructions();
                element.style.display = "block";
                get("open" + which).style.display = "none";
                get("close" + which).style.display = "block";
            } else {
                element.style.display = "none";
                get("open" + which).style.display = "block";
                get("close" + which).style.display = "none";
            }
        }
        function closeInstructionSection(which) {
            const element = get(which + "div");
            element.style.display = "none";
            get("open" + which).style.display = "block";
            get("close" + which).style.display = "none";
        }
        function closeAllInstructions() {
            let instructions = document.getElementsByName("instructions");
            for (let instruction of instructions) {
                let section = instruction.id.replace("info", "");
                closeInstructionSection(section);
            }
        }
        function showInstructions() {
            helpAllOff();
            get("instructionpanel").style.display = "block";
            get("maininfo").title = "Close Instructions";
            get("instructionopen").classList.add("nodisplay");
            get("instructionclose").classList.remove("nodisplay");
        }
        function hideInstructions() {
            closeAllInstructions();
            get("instructionpanel").style.display = "none";
            get("maininfo").title = "Open Instructions";
            get("instructionopen").classList.remove("nodisplay");
            get("instructionclose").classList.add("nodisplay");
        }
        function hidesitepw() {
            if (logging) console.log("checking hidesitepw", get("hidesitepw").checked, database.hidesitepw);
            if (get("hidesitepw").checked || (database && database.hidesitepw)) {
                get("sitepw").type = "password";
            } else {
                get("sitepw").type = "text";
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
        $superpw.focus();
    }
    return self;
})({
    version: "1.0",
}));
window.onload = function () {
    SitePasswordWeb.onload();
    SitePasswordWeb.instructionSetup();
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