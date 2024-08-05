"use strict";
let logging = false;
let resolvers = {};
let webpage = "https://sitepassword.info";

// Used when user has clicked on a bookmark link
// The settings are passed in the URL
let query = window.location.search;
let bkmkSettings;
if (query) {
    let params = new URLSearchParams(query);
    let bkmkcheck = params.get("bkmk");
    bkmkSettings = JSON.parse(bkmkcheck.substring(6));
    if ('string' !== typeof bkmkSettings.specials) {
        let specials = SitePassword.array2string(bkmkSettings.specials);
        bkmkSettings.specials = specials;
        SitePassword.settings = bkmkSettings;
        if (logging) console.log("bkmkSettings", bkmkSettings);
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
    function copied(which) {
        get(which + "copied").classList.remove("nodisplay");
        setTimeout(() => {
            get(which + "copied").classList.add("nodisplay");
        }, 900);
    }
    async function copyToClipboard(element) {
        element.focus();
        try {
            await navigator.clipboard.writeText(element.value);
            copied(element.id);
        } catch (e) {
            alert("Copy to clipboard failed |" + e + "|");
            await Promise.resolve(); // To match the await in the other branch
        }
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
        if (typeof SitePassword !== 'object') {
            console.log("ERROR! `SitePassword` must be defined (include `bg.js`)");
        }
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
        const $exportbutton = get("exportbutton");
        const $clearsuperpw = get("clearsuperpw");
        const $phishing = get("phishing");
        const $instructionpanel = get("instructionpanel");
        // Fill in default values in case the user has changed them
        let defaultsettings = SitePassword.getDefaultSettings();
        loadSettingControls(defaultsettings);
        updateExportButton();
        // Set size of window for separately scrolling sections
        $instructionpanel.style.height = window.innerHeight + "px";
        if (bkmkSettings) {
            $domainname.value = bkmkSettings.domainname;
            $sitename.value = bkmkSettings.sitename;
            $username.value = bkmkSettings.username;
            get("bkmkcheck").style.display = "block";
            $superpw.focus();
        }

       function loadSettingControls(settings) {
            $providesitepw.checked = settings.providesitepw;
            if ($providesitepw.checked && $sitename.value && $username.value) {
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
            if ($providesitepw.checked) {
                $code.value = settings.xor;
            } else {
                $code.value = "";
            }
            let fields = ["lower", "upper", "number", "special"];
            fields.forEach((field) => {
                optionalFields(field);
            });
            function optionalFields(which) {
                if (settings["allow" + which]) {
                    get("allow" + which).style.display = "none";
                    get("require" + which).style.display = "inline";
                } else {
                    get("allow" + which).style.display = "inline";
                    get("require" + which).style.display = "none";
                }
            
            }
        }
        self.saveSettingControls = function(settings) {
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
            settings.xor = $code.value.split(",").map(Number);
        }
        const $pwok = get("pwok");
        const $pwfail = get("pwfail");
        async function generatePassword() {
            self.saveSettingControls(SitePassword.settings);
            if (logging) console.log("ssp calling generatePassword");
            try {
                let pw = await SitePassword.generatePassword();
                if (logging) console.log("ssp got password", pw);
                if (pw || !$superpw.value) {
                    $pwok.style.display = "flex";
                    $pwfail.style.display = "none";
                } else {
                    $pwok.value = "";
                    $pwfail.style.display = "block";
                }
                if ($providesitepw.checked) {
                    if (document.activeElement !== $sitepw) {
                        $sitepw.value = SitePassword.stringXorArray(pw, SitePassword.settings.xor);
                    }
                } else {
                    SitePassword.settings.xor = SitePassword.xorStrings($sitepw.value, $sitepw.value);
                    $sitepw.value = pw;
                }
                setMeter("sitepw");
                enableRemember();
                if ($sitename.value && $username.value) {
                    get("providesitepw").disabled = false;
                } else {
                    get("providesitepw").disabled = true;
                }
                return pw;
            } catch (e) {
                console.log("generatePassword failed", e);
                await Promise.resolve(); // To match the await in the other branch
                return "";
            };
        }
        async function handleBlur(id) {
            const $element = get(id);
            SitePassword.settings[id] = $element.value;
            await generatePassword();
        }
        async function handleKeyupNumber(id) {
            const value = get(id).value;
            if (value && isNaN(value)) {
                alert("Must be a number");
                await Promise.resolve(); // To match the await on the other branch
            } else {
                SitePassword.settings[id] = value;
                await generatePassword();
            }
        }
        async function handleKeyup(id) {
            const $element = get(id);
            SitePassword.settings[id] = $element.value;
            await generatePassword();
            //$element.focus();
        }

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
        $superpw.onblur = async function () {
            SitePassword.setSuperPassword($superpw.value);
            if (logging) console.log("ssp onblur generate password");
            let calculated = await generatePassword();
            if (logging) console.log("ssp onblur got password", calculated);
            setMeter("superpw");
            setMeter("sitepw");
            if (resolvers.superpwblurResolver) resolvers.superpwblurResolver();
        }
        function setMeter(which) {
            const $meter = get(which + "-strength-meter");
            const $input = get(which);
            const report = zxcvbn($input.value);
            let guesses = getGuesses(which, report);
            // 10^9 guesses per second, 3*10^7 seconds per year, average success in 1/2 the tries
            let years = guesses/(1e9*3e7*2);
            if (which === "superpw") years /= 16*1024; // So the superpw will have more entropy than the site password
            let score = getScore(years);
            let index = Math.floor(score/5);
            $meter.value = score;
            $meter.style.setProperty("--meter-value-color", strengthColor[index]);
            $meter.title = strengthText[index] + guessLabel(years);
            $input.style.color = strengthColor[index];
        }
        function getScore(years) {
            let strong = Math.log10(1000);
            let good = Math.log10(1);
            let weak = Math.log10(1/12);
            let veryweak = Math.log10(1/365);
            let logYears = Math.log10(years);
            if (logYears > strong) {
                return 20;
            } else if (logYears > good) {
                return 15 + (logYears - good) * (20 - 15) / (strong - good);
            } else if (logYears > weak) {
                return 10 + (logYears - weak) * (15 - 10) / (good - weak);
            } else if (logYears > veryweak) {
                return 5 + (logYears - veryweak) * (10 - 5) / (weak - veryweak);
            } else {
                return 0;
            }
        }
        function getGuesses(which, report) {
            let alphabetSize = 0;
            if (which === "superpw") {
                let chars = $superpw.value.split("");
                if (chars.some(char => SitePassword.lower.includes(char))) alphabetSize += 26;
                if (chars.some(char => SitePassword.upper.includes(char))) alphabetSize += 26;
                if (chars.some(char => SitePassword.digits.includes(char))) alphabetSize += 10;
                if (chars.some(char => "~!@#$%^&*()_+-=[]\\{}|;':\",./<>? ".includes(char))) alphabetSize += 32;
            } else {
                if ($allowlowercheckbox.checked) alphabetSize += 26;
                if ($allowuppercheckbox.checked) alphabetSize += 26;
                if ($allownumbercheckbox.checked) alphabetSize += 10;
                if ($allowspecialcheckbox.checked) alphabetSize += $specials.value.length;
            }
            let sequence = report.sequence;
            let guesses = 1;
            for (let i = 0; i < sequence.length; i++) {
                if (sequence[i].pattern === "bruteforce") {
                    guesses *= alphabetSize**(sequence[i].token.length);
                } else {
                    guesses *= sequence[i].guesses;
                }
            }
            return guesses;
        }
        function guessLabel(years) {
            let labels = {
                "years": Math.floor(years),
                "months": Math.floor(years*12),
                "days": Math.floor(years*365),
                "hours": Math.floor(years*365*24),
                "minutes": Math.floor(years*365*24*60)
            }
            if (labels.years > 1000) return " (more than 1,000 years to guess)";
            if (labels.years > 1) return " (" + labels.years + " years to guess)";
            if (labels.years === 1) return " (1 year to guess)";
            if (labels.months > 1) return " (" + labels.months + " months to guess)";
            if (labels.months == 1) return " (" + labels.months + " month to guess)";
            if (labels.days > 1) return " (" + labels.days + " days to guess)";
            if (labels.days == 1) return " (" + labels.days + " day to guess)";
            if (labels.hours > 1) return " (" + labels.hours + " hours to guess)";
            if (labels.hours == 1) return " (" + labels.hours + " hour to guess)";
            if (labels.minutes > 1) return " (" + labels.minutes + " minutes to guess)";
            if (labels.minutes == 1) return " (" + labels.minutes + " minute to guess)";
            if (labels.minutes < 1) return " (less than a minute to guess)";
        }
        // Compute statistics
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
            async function stats() {
            let count = 10000;
            let hasWord = 0;
            SitePassword.settings = defaultsettings;
            for (let i = 0; i < count; i++) {
                $superpw.value = (i+10000).toString();
                await triggerEvent("blur", $superpw);
                let report = zxcvbn($sitepw.value);
                if (report.sequence.length >1) hasWord++;
            }
            console.log("Stats: total", count, "hasWord", hasWord);
        }
        // stats();
        $superpw.onkeyup = async function () {
            updateExportButton();
            await $superpw.onblur();
            if (resolvers.superpwkeyupResolver) resolvers.superpwkeyupResolver();
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
            menuOn("superpw", e);
        }
        get("superpw3bluedots").onclick = get("superpw3bluedots").onmouseover;
        $superpwmenushow.onclick = function(e) {
            get("superpw").type = "text";
            $superpwmenuhide.classList.toggle("nodisplay");
            $superpwmenushow.classList.toggle("nodisplay");
        }
        get("superpwmenuhide").onclick = function(e) {
            get("superpw").type = "password";
            $superpwmenuhide.classList.toggle("nodisplay");
            $superpwmenushow.classList.toggle("nodisplay");
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
    
        $domainname.onblur = async function () {
            const domainname = parseDomain(normalize($domainname.value));
            get("bkmkcheck").style.display = "none";
            $domainname.value = domainname;
            SitePassword.domainname = domainname;
            const sitename = SitePassword.siteForDomain(domainname) || "";
            const settings = SitePassword.loadSettings(sitename);
            await updateSettings(settings);
            if (resolvers.domainnameblurResolver) resolvers.domainnameblurResolver();
        }
        $domainname.onpaste = function () {
            $domainnamemenuforget.style.opacity = "1";
            setTimeout(async () => {
                if ($domainname.value) {
                    enableBookmark();
                    $bookmark.focus();  // NOTE: this causes `onblur` on $domainname
                    if (resolvers.domainnamepasteResolver) resolvers.domainnamepasteResolver();
                } else {
                    await Promise.resolve(); // To match the await in the other branch
                }
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
            if (domainname && SitePassword.database.domains[domainname]) {
                $domainnamemenuforget.style.opacity = "1";
            } else {
                $domainnamemenuforget.style.opacity = "0.5";
            }
            menuOn("domainname", e);
        }
        $domainname3bluedots.onclick = get("domainname3bluedots").onmouseover;
        $domainnamemenuforget.onclick = function (e) {
            if (!get("domainname").value) return;
            let toforget = normalize(get("domainname").value);
            addForgetItem(toforget);
            get("forget").classList.remove("nodisplay");
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
            if (logging) console.log("domain", domain, "protocol", protocol);
            if (domain && !isValidDomain(normalize(domain))) {
                $domainname.value = url;
                alert("Invalid domain.  Try again.");
                $domainname.value = "";
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
        async function updateSettings(settings) {
            $sitename.value = settings.sitename;
            $username.value = settings.username;
            loadSettingControls(settings);
            if ($username.value) httpWarningOff();
            phishingWarningOff();
            await generatePassword();
        }

        $bookmark.onpaste = function () {
            // The paste result isn't available until the next turn
            setTimeout(async () => {
                await self.bookmarkPaste();
                if (resolvers.bookmarkpasteResolver) resolvers.bookmarkpasteResolver();
            }, 0);
        }
        self.bookmarkPaste = async function () {
            const settings = parseBookmark($bookmark.value);
            $bookmark.value = "";  // clear bookmark field
            if (settings) {
                if (settings.domainname === $domainname.value) {
                    SitePassword.settings = settings;  // update data-model
                    updateSettings(settings);
                    await generatePassword();
                } else {
                    $sitename.value = settings.sitename;
                    phishingWarningOn(settings, settings.domainname, $domainname.value);
                    await Promise.resolve(); // To match the await on the other branch
                }
            } else {
                alert("Invalid bookmark. Copy it again?");
            }
        }
        const $httpclose = get("httpclose");
        $httpclose.onclick = function () {
            get("http").style.display = "none";
        }
        const $pwfailclose = get("pwfailclose");
        $pwfailclose.onclick = function () {
            get("pwfail").style.display = "none";
        }
        const $bkmcheckclose = get("bkmkcheckclose");
        $bkmcheckclose.onclick = function () {
            get("bkmkcheck").style.display = "none";
        }
        function parseBookmark(bookmark) {
            let settings = undefined;
            let bkmkstr = "";
            bkmkstr = bookmark.split("ssp://")[1];
            let json = decodeURIComponent(bkmkstr);
            try {
                settings = JSON.parse(json);
            } catch (e) {
                console.log(e);
                return settings;
            }
            // console.log("Bookmark settings:", settings);
            settings.specials = SitePassword.array2string(settings.specials);
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

        $sitename.onblur = async function () {
            await handleBlur("sitename");
            const domainname = $domainname.value;
            const settings = SitePassword.loadSettings($sitename.value);
            const sitename = settings.sitename;
            let existingDomain = SitePassword.validateDomain(domainname, sitename);
            if (!sitename) {
                // retain sitename/username for unknown site
                settings.sitename = $sitename.value;
                settings.username = $username.value;
                SitePassword.settings = settings;
                phishingWarningOff();
                await Promise.resolve(); // To match the await in the other branch
            } else if (!domainname) {
                await updateSettings(settings);
            } else if (existingDomain !== domainname) {
                phishingWarningOn(settings, existingDomain, domainname);
                await Promise.resolve(); // To match the await in the other branch
            }
            clearDatalist("sitenames");
            if (resolvers.sitenameblurResolver) resolvers.sitenameblurResolver();
        }
        $sitename.onkeyup = function () {
            handleKeyup("sitename");
            clearDatalist("sitenames");
        }
        $sitename.onfocus = function () {
            let set = new Set();
            // Get sitenames for datalist
            Object.keys(SitePassword.database.sites).forEach((sitename) => {
                set.add(SitePassword.database.sites[normalize(sitename)].sitename);
            })
            let list = [... set].sort();
            setupdatalist(this, list);
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
            if (!get("sitename").value) return;
            get("forget").classList.toggle("nodisplay");
            let toforget = normalize(get("sitename").value);
            for (let domain in SitePassword.database.domains) {
                if (normalize(SitePassword.database.domains[domain]) === toforget) {
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
    
        $username.onkeyup = async function () {
            await handleKeyup("username");
            clearDatalist("usernames");
        }
        $username.onblur = async function() {
            clearDatalist("usernames");
            const settings = SitePassword.loadSettings($sitename.value);
            settings.sitename = $sitename.value;
            settings.username = $username.value;
            SitePassword.settings = settings;
            await generatePassword();
            if (resolvers.usernameblurResolver) resolvers.usernameblurResolver();
        }
        $username.onfocus = function () {
            let set = new Set();
            // Get usernames for datalist
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
            if (!get("username").value) return;
            get("forget").classList.toggle("nodisplay");
            let toforget = normalize(get("username").value);
             for (let domain in SitePassword.database.domains) {
                let sitename = SitePassword.database.domains[domain];
                if (normalize(SitePassword.database.sites[sitename].username) === toforget) {
                    addForgetItem(domain);
                }
            }
        }
        get("usernamemenucopy").onclick = function(e) {
            if (!get("username").value) return;
            copyToClipboard($username);
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

        $sitepw.onblur = async function () {
            if ($sitepw.readOnly) return;
            let provided = $sitepw.value;
            let computed = await generatePassword();
            SitePassword.settings.xor = SitePassword.xorStrings(provided, computed);
            enableRemember();
            if (resolvers.sitepwblurResolver) resolvers.sitepwblurResolver();
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
            let sitepw = $sitepw.value;
            if (sitepw) {
                $sitepwmenucopy.style.opacity = "1";
            } else {
                $sitepwmenucopy.style.opacity = "0.5";
            }
            menuOn("sitepw", e);
        }
        $sitepw3bluedots.onclick = $sitepw3bluedots.onmouseover;
        document.addEventListener("copy", (event) => {
            if (event.target === $sitepw) $sitepwmenucopy.onclick();
        });
        $sitepwmenucopy.onclick = async function(e) {
            if (!$sitepw.value) return;
            copyToClipboard($sitepw);
            if ($clearsuperpw.checked) {
                $superpw.value = "";
                await generatePassword();
                $sitepw.value = "";
                $superpw.focus();                        
            }
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
            $sitepw.type = "text";
            $sitepwmenushow.classList.toggle("nodisplay");
            $sitepwmenuhide.classList.toggle("nodisplay")    ;
        };
        $sitepwmenuhide.onclick = function () {
            $sitepw.type = "password";
            $sitepwmenushow.classList.toggle("nodisplay");
            $sitepwmenuhide.classList.toggle("nodisplay");
        }
        
        let $bkmkDomain = get("bkmkDomain");
        $bkmkDomain.onpaste = function () {
            setTimeout(() => {
                let testDomain = parseDomain(normalize($bkmkDomain.value));
                if (testDomain === $domainname.value) {
                    phishingWarningOff();
                } else {
                   phishingWarningOn($domainname.value, testDomain);
                }                    
                get("bkmkcheck").style.display = "none";
            }, 0);
        }
    
        $cancelwarning.onclick = function () {
            $domainname.value = "";
            enableBookmark();
            SitePassword.domainname = "";
            $results.style.display = "block";  // show sitepw/remember/settings...
            const settings = SitePassword.loadSettings();
            updateSettings(settings);
        }
        function phishingWarningOn(settings, existingDommain, testDomain) {
            httpWarningOff();
            let sitename = normalize($sitename.value);
            get("phishingtext0").innerText = sitename;
            get("phishingtext1").innerText = existingDommain;
            get("phishingtext2").innerText = testDomain;
            $phishing.style.display = "block";
            $results.style.display = "none";  // hide sitepw/remember/settings...
            $domainname.classList.add("bad-input");
            $domainname.disabled = true;
            $username.disabled = true;
            $cancelwarning.focus();
            $warningbutton.onclick = function () {
                SitePassword.settings = settings;
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
        get("forgetbutton").onclick = function () {
            let children = get("toforgetlist").children;
            for (let child of children) {
                forgetDomainname(child.innerText);
            }
            get("cancelbutton").click();
        }
        get("cancelbutton").onclick = function () {
            while ( get("toforgetlist").firstChild ) {
                get("toforgetlist").removeChild(get("toforgetlist").firstChild);
            }
            get("forget").classList.toggle("nodisplay");
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
            phishingWarningOff();
            enableRemember();
        }
        function enableRemember() {
            $remember.disabled =
                !($domainname.value && $sitename.value && $username.value && SitePassword.settingsModified());
        }
        $providesitepw.onclick = async function () {
            const settings = SitePassword.settings;
            settings.providesitepw = $providesitepw.checked;
            if ($providesitepw.checked && $superpw.value && $sitename.value && $username.value) {
                $sitepw.readOnly = false;
                $sitepw.value = "";
                $sitepw.placeholder = "Enter your site password";
                $sitepw.focus();   
                $code.disabled = false; 
                await Promise.resolve(); // To match the await on the other branch
            } else {
                $sitepw.readOnly = true;
                $sitepw.placeholder = "Generated site password";
                $code.disabled = true;
                await generatePassword();
            }
            if (resolvers.providesitepwclickResolver) resolvers.providesitepwclickResolver();
        }
        $code.onblur = async function() {
            let settings = SitePassword.settings;
            settings.xor = JSON.parse("[" + $code.value + "]");
            await generatePassword();
        }
    
        $pwlength.onblur = async function () {
            if ($pwlength.value > 100) {
                alert("Sitepasswords must be 100 or fewer characters");
                $pwlength.value = SitePassword.settings.pwlength;
                await Promise.resolve(); // To match the await on the other branch
            } else {
                await handleKeyupNumber("pwlength");
            }
            if (resolvers.pwlengthblurResolver) resolvers.pwlengthblurResolver();
       }
        $startwithletter.onclick = async function () {
            SitePassword.settings.startwithletter = $startwithletter.checked;
            restrictStartsWithLetter();
            await generatePassword();
        }
        $allowlowercheckbox.onclick = async function () {
            await handleCheck("lower");
        }
        $minlower.onblur = async function () {
            await handleKeyupNumber("minlower");
        }
        $allowuppercheckbox.onclick = async function () {
            await handleCheck("upper");
        }
        $minupper.onblur = async function () {
            await handleKeyupNumber("minupper");
        }
        $allownumbercheckbox.onclick = async function () {
            await handleCheck("number");
        }
        $minnumber.onblur = async function () {
            await handleKeyupNumber("minnumber");
        }
        $allowspecialcheckbox.onclick = async function () {
            await handleCheck("special");
            $specials.disabled = !($allowspecialcheckbox.checked);
            if (resolvers.allowspecialcheckboxclickResolver) resolvers.allowspecialcheckboxclickResolver();
        }
        $minspecial.onblur = async function () {
            await handleKeyupNumber("minspecial");
            if (resolvers.minspecialblurResolver) resolvers.minspecialblurResolver();
        }
        const alphanumerics = /[0-9A-Za-z]/g;
        $specials.onblur = async function () {
            if (!$specials.value) {
                $specials.value = SitePassword.settings.specials;
                alert("Specials cannot be empty");
                return;
            }
            $specials.value = $specials.value
                .replace(alphanumerics, '')  // eliminate alphanumerics
                .substring(0, 12);  // limit to 12 specials
            await handleKeyup("specials");
        }
        async function handleCheck(group) {
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
                await generatePassword();
            } else {
                console.log('handleCheck: missing control(s) for group:', group);
                await Promise.resolve(); // To match the await on the other branch
            }
        }
        function restrictStartsWithLetter() {
            let settings = SitePassword.settings;
            if (!(settings.allowupper || settings.allowlower)) {
                settings.startwithletter = false;
                $startwithletter.checked = false;
                $startwithletter.disabled = true;
            } else {
                $startwithletter.disabled = false;
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
            
        $downloadbutton.onclick = async function sitedataHTML() {
            var domainnames = SitePassword.database.domains
            var sorted = Object.keys(domainnames).sort(function (x, y) {
                if (x.toLowerCase() < y.toLowerCase()) return -1;
                if (x.toLowerCase() == y.toLowerCase()) return 0;
                return 1;
            });
            let workingdoc = document.implementation.createHTMLDocument("SitePassword Data");
            let doc = sitedataHTMLDoc(workingdoc, sorted);
            let html = new XMLSerializer().serializeToString(doc);
            let blob = new Blob([html], {type: "text/html"});
            let url = URL.createObjectURL(blob);
            const $data = get("data");
            $data.href = url;
            $data.click();
            return;
        }
        function updateExportButton() {
            if (get("superpw").value) {
                get("exportbutton").disabled = false;
                get("exportbutton").title = "Export site data";
            } else {
                get("exportbutton").disabled = true;
                get("exportbutton").title = "Enter your super password to export site data";
            }
        }
        $exportbutton.onclick = async function exportPasswords() {
            if (!get("superpw").value) return;
            let exportbutton = get("exportbutton");
            let oldExportText = exportbutton.innerText;
            exportbutton.innerText = "Exporting...";
            let domainnames = SitePassword.database.domains;
            let sorted = Object.keys(domainnames).sort(function (x, y) {
                if (normalize(x) < normalize(y)) return -1;
                if (normalize(x) == normalize(y)) return 0;
                return 1;
            });
            let oldsettings = SitePassword.cloneObject(SitePassword.settings);
            let data = "Domain Name, Site Name, User Name, Site Password\n";
            for (let domainname of sorted) {
                let sitename = SitePassword.database.domains[domainname];
                let settings = SitePassword.database.sites[sitename];
                let username = settings.username;
                SitePassword.settings = settings;
                try {
                    let sitepw = await SitePassword.generatePassword();
                    data += '"' + domainname + '"' + "," + '"' + sitename + '"' + "," + '"' + username + '"' + "," + '"' + sitepw + '"' + "\n";
                } catch (e) {
                    console.log("popup exportPasswords error", e);
                    await Promise.resolve(); // To match the await in the other branch
                }
            }
            SitePassword.settings = oldsettings;
            // Prepare download
            let blob = new Blob([data], {type: "text/csv"});
            let url = URL.createObjectURL(blob);
            let link = document.createElement("a");
            link.href = url;
            link.download = "SitePasswordExport.csv";
            document.body.appendChild(link);
            link.click();    
            document.body.removeChild(link);
            exportbutton.innerText = oldExportText;
        }
        function sitedataHTMLDoc(doc, sorted) {
            let header = doc.getElementsByTagName("head")[0];
            let title = doc.createElement("title");
            title.innerText = "SitePassword Data";
            header.appendChild(title);
            let style = doc.createElement("style");
            header.appendChild(style);
            style.innerText = "th {text-align: left;}";
            let body = doc.getElementsByTagName("body")[0];
            let table = addElement(body, "table");
            tableCaption(table);
            let headings = ["Domain Name", "Site Name", "User Name", "Password Length", "Start with Letter",
                "Allow Lower", "Min Lower", "Allow Upper", "Min Upper", "Allow Numbers", "Min Numbers",
                "Allow Specials", "Min Specials", "Specials", "Code for User Provided Passwords"];
            tableHeader(table, headings);
            for (let i = 0; i < sorted.length; i++) {
                let tr = addElement(table, "tr");
                if (i % 2) tr.style.backgroundColor = "rgb(136, 204, 255, 30%)";
                addRow(tr, sorted[i]);
            }
            return doc.documentElement;
            // Helper functions
            function addElement(parent, type) {
                let e = doc.createElement(type);
                parent.appendChild(e);
                return e;
            }
            function tableCaption(table) {
                let caption = addElement(table, "caption");
                caption.innerText = "You can use these settings at ";
                let a = addElement(caption, "a");
                a.href = webpage;
                a.innerText = webpage; 
                let p = addElement(caption, "p");
                p.innerText = "Click on the domain name to open", webpage, "or right click on the domain name and copy the link address to paste into the bookmark field."; 
            }
            function tableHeader(table, headings) {
                let tr = addElement(table, "tr");
                for (let i = 0; i < headings.length; i++) {
                    let th = addElement(tr, "th");
                    th.innerText = headings[i];
                }
            }
            function addColumnEntries(tr, settings) {
                for (let i = 0; i < settings.length; i++) {
                    let td = addElement(tr, "td");
                    let pre = addElement(td, "pre");
                    pre.innerText = settings[i];    
                }
            }
            function addRow(tr, domainname) {
                let sitename = SitePassword.database.domains[domainname];
                let s = SitePassword.database.sites[sitename];
                let bkmk = JSON.stringify(s);
                let td = addElement(tr, "td");
                let a = addElement(td, "a");
                a.title = "Right click to copy bookmark";
                a.href = webpage + "?bkmk=ssp://" + bkmk;
                a.innerText = domainname;
                let entries = [s.sitename, s.username, s.pwlength, s.startwithletter, 
                    s.allowlower, s.minlower, s.allowupper, s.minupper, s.allownumber, s.minnumber,
                    s.allowspecial, s.minspecial, SitePassword.array2string(s.specials), s.xor || ""];
                addColumnEntries(tr, entries);
            }
        }
        // I need to handle the case where the user clicks on the link in the instructions or help
        get("sharedref").onclick = function (e) {
            e.stopPropagation();
            sectionClick("shared");
        }
        get("sharedref2").onclick = function (e) {
            e.stopPropagation();
            sectionClick("shared");
        }
        // Generic code for menus
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
        }
        function dotsAllOn() {
            get("domainname3bluedots").style.display = "block";
            get("bookmark3bluedots").style.display = "block";
            get("superpw3bluedots").style.display = "block";
            get("sitename3bluedots").style.display = "block";
            get("username3bluedots").style.display = "block";
            get("sitepw3bluedots").style.display = "block";
        }
        function helpItemOn(which) {
            let $main = get("main");
            let mainTop = $main.getBoundingClientRect().top;
            let $input = get(which);
            let top = $input.getBoundingClientRect().top - 15;
            let $element = get(which + "helptext");
            if (!$element.style.display || $element.style.display === "none") {
                helpAllOff();
                hideInstructions();
                $element.style.display = "block";
                $element.style.top = top - mainTop + "px";
                let $buttons = get(which + "helptextclose");
                let bottom = $buttons.getBoundingClientRect().bottom + 10;
                $element.style.height = bottom - top + "px";
                hideSettings();
            } else {
                helpAllOff();
            }
        }
        function helpItemOff(which) {
            get(which).style.display = "none";
            showSettings();
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
                get(which + "info").scrollIntoView();
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
        function showSettings() {
            get("settings").classList.remove("nodisplay");
        }
        function hideSettings() {
            get("settings").classList.add("nodisplay");
        }
        function hidesitepw() {
            if (logging) console.log("checking hidesitepw", get("hidesitepw").checked, SitePassword.database.hidesitepw);
            if (get("hidesitepw").checked || (database && SitePassword.database.hidesitepw)) {
                $sitepw.type = "password";
            } else {
                $sitepw.type = "text";
            }
        }
                        
        if (bkmkSettings) {
            SitePassword.loadSettings(bkmkSettings.sitename);
            get("bkmkcheck").style.display = "block";
            SitePassword.settings = bkmkSettings;
            SitePassword.domainname = bkmkSettings.domainname;
            $domainname.value = bkmkSettings.domainname;
            updateSettings(bkmkSettings);
            enableRemember();
        }
        $superpw.focus();
    }
    function addForgetItem(domainname) {
        let $list = get("toforgetlist");
        let $item = document.createElement("li");
        $item.innerText = domainname;
        $list.appendChild($item);
    }
    function forgetDomainname(toforget) {
        SitePassword.forgetSettings(toforget);
        get("sitename").value = "";
        get("username").value = "";
    }

    return self;
})({
    version: "1.0",
}));
window.onload = function () {
    SitePasswordWeb.onload();
    SitePasswordWeb.instructionSetup();
    if (localStorage.test === "true" ) runTests();
}
/*
    Rules for handling various fields

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