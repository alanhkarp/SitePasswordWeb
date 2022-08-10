"use strict";
if (typeof SitePassword !== 'object') {
    console.log("ERROR! `SitePassword` must be defined (include `bg.js`)");
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

    self.onload = function () {
        const $masterpw = get("masterpw");
        const $domainname = get("domainname");
        const $bookmark = get("bookmark");
        const $sitename = get("sitename");
        const $username = get("username");
        const $resetbutton = get("resetbutton");
        const $sitepw = get("sitepw");
        const $remember = get("remember");
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

        function loadSettingControls(settings) {
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
            settings.pwlength = $pwlength.value;
            settings.startwithletter = $startwithletter.checked;
            settings.allowlower = $allowlowercheckbox.checked;
            settings.minlower = $minlower.value;
            settings.allowupper = $allowuppercheckbox.checked;
            settings.minupper = $minupper.value;
            settings.allownumber = $allownumbercheckbox.checked;
            settings.minnumber = $minnumber.value;
            settings.allowspecial = $allowspecialcheckbox.checked;
            settings.minspecial = $minspecial.value;
            settings.specials = $specials.value;
        }
        let $pwok = get("pwok");
        let $pwfail = get("pwfail");
        function generatePassword() {
            saveSettingControls(SitePassword.settings);
            let pw = SitePassword.generatePassword();
            if (pw || !$masterpw.value) {
                $pwok.style.display = "flex";
                $pwfail.style.display = "none";
            } else {
                $pwok.style.display = "none";
                $pwfail.style.display = "flex";
            }
            //setNotice("nopw", !pw);
            $sitepw.value = pw;
            enableRemember();
        }
        function handleBlur(id) {
            let $element = get(id);
            SitePassword.settings[id] = $element.value;
            generatePassword();
        }
        function handleKeyup(id) {
            let $element = get(id);
            SitePassword.settings[id] = $element.value;
            generatePassword();
            //$element.focus();
        }

        let $instructionpanel = get("instructionpanel");
        let $maininfo = get("maininfo");
        $maininfo.onclick = function () {
            if ($instructionpanel.style.display === "none") {
                $instructionpanel.style.display = "block";
            } else {
                $instructionpanel.style.display = "none";
            }
        }

        $masterpw.onblur = function () {
            SitePassword.setMasterPassword($masterpw.value);
            generatePassword();
        }
        $masterpw.onkeyup = function () {
            $masterpw.onblur();
            //$masterpw.focus();
        }
        let $masterpwhide = get("masterpwhide");
        let $masterpwshow = get("masterpwshow");
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
            $domainname.value = domainname;
            SitePassword.domainname = domainname;
            const settings = SitePassword.loadSettings();
            $sitename.value = settings.sitename;
            $username.value = settings.username;
            loadSettingControls(settings);
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
            const split = url.split("/");
            if (split.length === 1) {
                return split[0];
            }
            return split[2];
        }

        // loginurl = https://alantheguru.alanhkarp.com/
        // bookmark = ssp://{"domainname":"alantheguru.alanhkarp.com","sitename":"Guru","username":"alan","pwlength":10,"startwithletter":true,"allowlower":true,"allowupper":true,"allownumber":true,"allowspecial":false,"minlower":1,"minupper":1,"minnumber":1,"minspecial":0,"specials":"/!=@?._-%22,%22characters%22:%22abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ab%22,%22displayname%22:%22alantheguru.alanhkarp.com%22}
        // bookmark = ssp://{"sitename":"Guru","username":"alan","pwlength":10,"startwithletter":true,"allowlower":true,"allowupper":true,"allownumber":true,"allowspecial":false,"minlower":1,"minupper":1,"minnumber":1,"minspecial":0,"specials":"/!=@?._-%22}
        // sitepw --> eUl6dpKDt9
        // bookmark = ssp://{"sitename":"The Real Alan","username":"dalnefre","pwlength":"15","startwithletter":false,"allowlower":true,"minlower":"1","allowupper":true,"minupper":"1","allownumber":true,"minnumber":"1","allowspecial":true,"minspecial":"1","specials":"$/!=@?._-"}
        // sitepw --> PZ5?5Aj7KtrJ/CW
        $bookmark.onpaste = function () {
            setTimeout(() => {
                var settings = parseBookmark($bookmark.value);
                if (settings) {
                    phishingCheck(settings.sitename);
                    SitePassword.settings = settings;  // update data-model
                    //$domainname.value = settings.domainname;  // FIXME: do we really want to set this?
                    $sitename.value = settings.sitename;
                    $username.value = settings.username;
                    loadSettingControls(settings);
                    generatePassword();
                } else {
                    alert("Invalid bookmark. Copy it again?");
                }
                $bookmark.value = "";  // clear bookmark field
            }, 0);
        }
        function parseBookmark(bookmark) {
            var settings = undefined;
            if (bookmark.startsWith("ssp://")) {
                try {
                    let json = bookmark.substring(6)
                        .replace(/%22/g, '"')
                        .replace(/%7B/, '{')
                        .replace(/%7D/, '}');
                    settings = JSON.parse(json);
                } catch {
                    console.log(e);
                }
            }
            console.log("Bookmark settings:", settings);
            return settings;
        }
        function enableBookmark() {
            $bookmark.disabled = !($domainname.value);
        }

        $sitename.onblur = function () {
            handleBlur("sitename");
            phishingCheck($sitename.value);
        }
        function phishingCheck(sitename) {
            const domainname = $domainname.value;
            if (SitePassword.validateDomain(domainname, sitename)) {
                setNotice("phishing", false);
                //$domainname.style.background = "#FFF";
                $domainname.style.color = "#000";
                //$domainname.focus();
            } else {
                setNotice("phishing", true);
                //$domainname.style.background = "#FF0";
                $domainname.style.color = "#F00";
                $resetbutton.focus();
            }
        }

        $username.onkeyup = function () {
            handleKeyup("username");
        }

        $resetbutton.onclick = function () {
            $domainname.value = "";
            SitePassword.domainname = "";
            const settings = SitePassword.loadSettings();
            $sitename.value = settings.sitename;
            $username.value = settings.username;
            loadSettingControls(settings);
            generatePassword();
            phishingCheck(settings.sitename);
        }

        let $sitepwhide = get("sitepwhide");
        let $sitepwshow = get("sitepwshow");
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
        get("sitepwcopy").onclick = function () {
            copyToClipboard($sitepw);
        }

        let $nopw = get("nopw");
        let $phishing = get("phishing");
        var nopwNoteOn = false;
        var phishingNoteOn = false;
        function setNotice(id, turnon) {
            if ("nopw" == id) nopwNoteOn = turnon;
            if ("phishing" == id) phishingNoteOn = turnon;
            if (phishingNoteOn) {
                $nopw.style.display = "none";
                $phishing.style.display = "block";
            } else if (nopwNoteOn) {
                $nopw.style.display = "block";
                $phishing.style.display = "none";
            } else {
                $nopw.style.display = "none";
                $phishing.style.display = "none";
            }
        }

        $remember.onclick = function () {
            SitePassword.storeSettings();
            phishingCheck($sitename.value);
        }
        function enableRemember() {
            $remember.disabled =
                !($domainname.value && $sitename.value && $username.value && $sitepw.value);
        }

        let $settingsshow = get("settingsshow");
        let $settingssave = get("settingssave");
        let $settings = get("settings");
        $settingsshow.onclick = function () {
            //loadSettingControls(SitePassword.settings);  // FIXME: already loaded...
            $settingsshow.style.display = "none";
            $settingssave.style.display = "inline";
            $settings.style.display = "block";
        }
        $settingssave.onclick = function () {
            //saveSettingControls(SitePassword.settings);  // FIXME: sync'd by generatePassword()
            $settingsshow.style.display = "inline";
            $settingssave.style.display = "none";
            $settings.style.display = "none";
            //SitePassword.storeSettings();  // FIXME: don't persist here, use $remember
        }

        $pwlength.onkeyup = function () {
            handleKeyup("pwlength");
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
            handleKeyup("minlower");
        }
        $allowuppercheckbox.onclick = function () {
            handleCheck("upper");
        }
        $minupper.onkeyup = function () {
            handleKeyup("minupper");
        }
        $allownumbercheckbox.onclick = function () {
            handleCheck("number");
        }
        $minnumber.onkeyup = function () {
            handleKeyup("minnumber");
        }
        $allowspecialcheckbox.onclick = function () {
            handleCheck("special");
            $specials.disabled = !($allowspecialcheckbox.checked);
        }
        $minspecial.onkeyup = function () {
            handleKeyup("minspecial");
        }
        $specials.onkeyup = function () {
            handleKeyup("specials");
        }
        function handleCheck(group) {
            let $allow_group_checkbox = get("allow"+group+"checkbox");
            let $min_group = get("min"+group);
            let $allow_group = get("allow"+group);
            let $require_group = get("require"+group);
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

        $downloadbutton.onclick = function siteDataHTML() {
            const domains = SitePassword.database.domains;
            const sites = SitePassword.database.sites;
            const sorted = Object.keys(domains).sort(function (x, y) {
                var a = x.toLowerCase();
                var b = y.toLowerCase();
                if (domains[a].toLowerCase() < domains[b].toLowerCase()) return -1;
                if (domains[a].toLowerCase() == domains[b].toLowerCase()) return 0;
                return 1;
            });
            let sd = "<html><body><table>";
            sd += "<th>Site Name</th>";
            sd += "<th>Domain Name</th>";
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
            sd += "</tr>";
            for (const i = 0; i < sorted.length; i++) {
                const domainname = sorted[i];
                const sitename = domains[domainname];
                const s = sites[sitename];
                sd += "<tr>";
                sd += "<td><pre>" + domainname + "</pre></td>";
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
                sd += "</tr>";
            }
            sd += "</table></body></html>";
            const $data = get("data");
            const mimetype = "data:application/octet-stream,";
            $data.href = mimetype + sd;
            $data.click();
            return sd;
        }

        // FIXME: these ids are very generic, maybe add an "info" suffix?
        get("overview").onclick = function () { sectionClick("overview"); };
        get("master").onclick = function () { sectionClick("master"); };
        get("common").onclick = function () { sectionClick("common"); };
        get("extension").onclick = function () { sectionClick("extension"); };
        get("webpage").onclick = function () { sectionClick("webpage"); };
        get("shared").onclick = function () { sectionClick("shared"); };
        get("source").onclick = function () { sectionClick("source"); };
        get("payment").onclick = function () { sectionClick("payment"); };
        function sectionClick(id) {
            const element = get(id + "p");
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

        $masterpw.focus();
    }
    return self;
})({
    version: "1.2.0",
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