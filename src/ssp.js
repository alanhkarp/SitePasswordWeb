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
        let $masterpw = get("masterpw");
        let $domainname = get("domainname");
        let $bookmark = get("bookmark");
        let $sitename = get("sitename");
        let $username = get("username");
        let $sitepw = get("sitepw");
        let $remember = get("remember");
        let $pwlength = get("pwlength");
        let $startwithletter = get("startwithletter");
        let $allowlowercheckbox = get("allowlowercheckbox");
        let $minlower = get("minlower");
        let $allowuppercheckbox = get("allowuppercheckbox");
        let $minupper = get("minupper");
        let $allownumbercheckbox = get("allownumbercheckbox");
        let $minnumber = get("minnumber");
        let $allowspecialcheckbox = get("allowspecialcheckbox");
        let $minspecial = get("minspecial");
        let $specials = get("specials");
        let $downloadbutton = get("downloadbutton");

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
        function generatePassword() {
            saveSettingControls(SitePassword.settings);
            let pw = SitePassword.generatePassword();
            setNotice("nopw", !pw);
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
            var domainname = parseDomain(normalize($domainname.value));
            $domainname.value = domainname;
            SitePassword.settings.domainname = domainname;
            var settings = SitePassword.loadSettings(domainname);
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
            let split = url.split("/");
            if (split.length === 1) {
                return split[0];
            }
            return split[2];
        }

        $bookmark.onpaste = function () {
            setTimeout(() => {
                var settings = parseBookmark($bookmark.value);
                setNotice("phishing", isPhishing(settings));
                SitePassword.settings = settings;
                $domainname.value = settings.domainname;  // FIXME: do we really want to set this?
                $sitename.value = settings.sitename;
                $username.value = settings.username;
                loadSettingControls(settings);
                generatePassword();
            }, 0);
        }
        function parseBookmark(bookmark) {
            return SitePassword.getDefaultSettings();  // FIXME: TEMPORARY HACK!
        }
        function enableBookmark() {
            $bookmark.disabled = !($domainname.value);
        }

        $sitename.onblur = function () {
            handleBlur("sitename");
            setNotice("phishing", isPhishing(SitePassword.settings));
        }
        function isPhishing(settings) {
            return false;  // FIXME: implement phishing warning...
/*
            if (!sitename) return false;
            var domainname = getLowerValue("domainname");
            var db = SitePassword.database;
            var ds = Object.keys(db.domains);
            var phishing = false;
            ds.forEach(function (d) {
                var s = db.domains[d];
                if ((s === sitename) && (d !== domainname)) {
                    phishing = true;
                }
            });
            return phishing;
*/
        }

        $username.onkeyup = function () {
            handleKeyup("username");
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
            handleKeyup("special");
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
            var domains = SitePassword.database.domains;
            var sites = SitePassword.database.sites;
            var sorted = Object.keys(domains).sort(function (x, y) {
                var a = x.toLowerCase();
                var b = y.toLowerCase();
                if (domains[a].toLowerCase() < domains[b].toLowerCase()) return -1;
                if (domains[a].toLowerCase() == domains[b].toLowerCase()) return 0;
                return 1;
            });
            var sd = "<html><body><table>";
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
            for (var i = 0; i < sorted.length; i++) {
                var domainname = sorted[i];
                var sitename = domains[domainname];
                var s = sites[sitename];
                sd += "<tr>";
                sd += "<td><pre>" + s.domainname + "</pre></td>";
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
            var mimetype = "data:application/octet-stream,";
            var download = get("data");
            download.href = mimetype + sd;
            download.click();
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
            let element = get(id + "p");
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
    get("bookmark").onpaste = function () {
        let element = this;
        setTimeout(() => {
            if (!this.value) return;
            try {
                let no22 = element.value.substring(6).replace(/%22/g, "\"");
                let no7B = no22.replace(/%7B/, "{");
                let no7D = no7B.replace(/%7D/, "}");
                settings = JSON.parse(no7D);
            } catch {
                alert("Invalid bookmark.  Copy it again.");
                get("bookmark").value = "";
                return;
            }
            element.value = "";
            if (logging) console.log("Bookmark settings", settings);
            if (get("domainname").value !== settings.displayname) {
                message("phishing", true);
            } else {
                get("domainname").value = settings.displayname;
            }
            get("sitename").value = settings.sitename;
            get("username").value = settings.username;
            get("pwlength").value = settings.pwlength;
            get("minlower").value = settings.minlower;
            get("minnumber").value = settings.minnumber;
            get("minspecial").value = settings.minspecial;
            get("minupper").value = settings.minupper;
            get("startwithletter").value = settings.startwithletter;
            get("allowlowercheckbox").checked = settings.allowlower;
            if (settings.allowlower) {
                get("allowlower").style.display = "none";
                get("requirelower").style.display = "inline";
            } else {
                get("allowlower").style.display = "inline";
                get("requirelower").style.display = "none";
            }
            get("allowuppercheckbox").checked = settings.allowupper;
            if (settings.allowupper) {
                get("allowupper").style.display = "none";
                get("requireupper").style.display = "inline";
            } else {
                get("allowupper").style.display = "inline";
                get("requireupper").style.display = "none";
            }
            get("allownumbercheckbox").checked = settings.allownumber;
            if (settings.allownumber) {
                get("allownumber").style.display = "none";
                get("requirenumber").style.display = "inline";
            } else {
                get("allownumber").style.display = "inline";
                get("requirenumber").style.display = "none";
            }
            get("allowspecialcheckbox").checked = settings.allowspecial;
            if (settings.allowspecial) {
                get("allowspecial").style.display = "none";
                get("requirespecial").style.display = "inline";
            } else {
                get("allowspecial").style.display = "inline";
                get("requirespecial").style.display = "none";
            }
            enableRemember();
            ask2generate();
            setFocus();
        }, 0);
    }
    get("downloadbutton").onclick = siteDataHTML;
    get("warningbutton").onclick = function () {
        get("masterpw").disabled = false;
        get("username").disabled = false;
        get("sitename").disabled = false;
        message("phishing", false);
        get("username").value = settings.username;
        ask2generate();
    }
    get("cancelwarning").onclick = function () {
        get("bookmark").style.visibility = "hidden";
        message("phishing", false);
        get("domainname").value = "";
        get("sitename").value = "";
        get("username").value = "";
        get("masterpw").disabled = false;
        get("sitename").disabled = false;
        get("username").disabled = false;
        settings.sitename = "";
        settings.username = "";
        ask2generate();
    }

function setFocus() {
    if (!get("masterpw").value) {
        get("masterpw").focus();
        return;
    }
    if (!get("domainname").value) {
        get("domainname").focus();
        return;
    }
    if (!get("sitename").value && !get("username").value) {
        get("bookmark").focus();
        return;
    }
    if (get("sitename").value && get("username").value) {
        get("sitepw").focus();
        return;
    }
}
function isPhishing(sitename) {
    if (!sitename) return false;
    var domainname = getLowerValue("domainname");
    var db = SitePassword.database;
    var ds = Object.keys(db.domains);
    var phishing = false;
    ds.forEach(function (d) {
        var s = db.domains[d];
        if ((s === sitename) && (d !== domainname)) {
            phishing = true;
        }
    });
    return phishing;
}
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