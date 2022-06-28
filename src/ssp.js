var hpSPG;
var masterpw;
var domainname;
var debugssp = false;
var settings = {};
window.onload = function () {
    get("persona").onkeyup = function () {
        get("masterpw").value = "";
        get("sitename").value = "";
        get("username").value = "";
        get("sitepass").value = "";
        masterpw = "";
    }
    get("persona").onmouseleave = function () {
        getsettings();
        fill();
        hpSPG.lastpersona = get("persona").value;
        masterpw = "";
        get("masterpw").value = "";
        get("masterpw").focus();
    }
    get("domainname").onmouseleave = function () {
        if (get("domainname").value) {
            get("masterpw").disabled = false;
            get("sitename").disabled = false;
            get("username").disabled = false;
        } else {
            get("masterpw").disabled = true;
            get("sitename").disabled = true;
            get("username").disabled = true;
        }
        get("sitename").value = "";
        getsettings();
        ask2generate();
        setfocus();
    }
    get("masterpw").onkeyup = function () {
        masterpw = get("masterpw").value;
        ask2generate();
        get("masterpw").focus();
    }
    get("username").onkeyup = function () {
        handlekeyup("username", "username");
    }
    get("sitename").onkeyup = function () {
        getsettings();
        settings.sitename = get("sitename").value;
        if (isphishing(settings.sitename)) {
            message("phishing", true);
            get("domainname").value = settings.domainname;
            get("masterpw").disabled = true;
            get("username").disabled = true;
            get("sitepass").value = "";
        } else {
            message("phishing", false);
            get("masterpw").disabled = false;
            get("username").disabled = false
            ask2generate();
            get("sitename").focus();
        }
    }
    get("pwlength").onkeyup = function () {
        handlekeyup("pwlength", "length");
    }
    get("startwithletter").onclick = function () {
        settings.startwithletter = get("startwithletter").checked;
        ask2generate();
    }
    get("allowlowercheckbox").onclick = function () {
        handleclick("lower");
    }
    get("allowuppercheckbox").onclick = function () {
        handleclick("upper");
    }
    get("allownumbercheckbox").onclick = function () {
        handleclick("number");
    }
    get("allowspecialcheckbox").onclick = function () {
        handleclick("special");
    }
    get("minlower").onkeyup = function () {
        handlekeyup("minlower", "minlower");
    }
    get("minupper").onkeyup = function () {
        handlekeyup("minupper", "minupper");
    }
    get("minnumber").onkeyup = function () {
        handlekeyup("minnumber", "minnumber");
    }
    get("minspecial").onkeyup = function () {
        handlekeyup("minspecial", "minspecial");
    }
    get("specials").onkeyup = function () {
        handlekeyup("specials", "specials");
    }
    get("settingsshow").onclick = show;
    get("settingssave").onclick = save;
    get("sitedatagetbutton").onclick = sitedataHTML;
    get("bookmarkbutton").onclick = getbookmark;
    get("warningbutton").onclick = function () {
        get("masterpw").disabled = false;
        get("username").disabled = false;
        get("sitename").disabled = false;
        message("phishing", false);
        var n = get("sitename").value;
        settings = clone(persona.sitenames[n]);
        persona.sites[get("domainname").value] = settings.sitename;
        get("username").value = settings.username;
        ask2generate();
    }
    get("cancelwarning").onclick = function () {
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
    get("remember").onclick = function () {
        if (debugssp) {
            localStorage.removeItem("hpSPG");
            return;
        }
        if (get("clearmasterpw").checked) {
            get("masterpw").value = "";
            ask2generate();
        }
        settings.sitename = get("sitename").value;
        if (settings.sitename) {
            persona.sitenames[settings.sitename] = clone(settings);
            persona.sites[settings.domainname] = settings.sitename;
        } else {
            delete persona.sites[settings.domainname];
            get("username").value = "";
        }
        hpSPG.lastpersona = get("persona").value;
        persistObject("hpSPG", hpSPG);
    }
    get("faqcheckbox").onclick = function () {
        if (get("faqcheckbox").checked) {
            get("questions").style.display = "block";
        } else {
            get("questions").style.display = "none";
        }
    }
    init();
}
function handlekeyup(element, field) {
    settings[field] = get(element).value;
    ask2generate();
    get(element).focus();
}
function handleclick(which) {
    settings["allow" + which] = get("allow" + which + "checkbox").checked;
    var minwhich = get("min" + which);
    if (get("allow" + which + "checkbox").checked) {
        get("allow" + which).style.display = "none";
        get("require" + which).style.display = "inline";
        minwhich.disabled = false;
        minwhich.value = 1;
        if (which == "special") get("specials").disabled = false;
    } else {
        if (!(settings.allowupper || settings.allowlower)) {
            settings.startwithletter = false;
            get("startwithletter").checked = false;
        }
        get("allow" + which).style.display = "inline";
        get("require" + which).style.display = "none";
        minwhich.disabled = true;
        minwhich.value = "";
        if (which == "special") get("specials").disabled = true;
    }
    settings.characters = characters(settings)
    ask2generate();
}
function init() {
    get("domainname").value = "";
    get("masterpw").value = "";
    get("sitename").value = "";
    get("username").value = "";
    bginit();
    persona = hpSPG.personas[hpSPG.lastpersona.toLowerCase()];
    get("persona").value = persona.personaname;
    settings = clone(persona.sitenames.default);
    var hostname = getlowertrim("domainname");
    if (hostname && persona.sites[hostname]) {
        settings = clone(persona.sitenames[persona.sites[hostname]]);
    }
    settings.domainname = hostname;
    if (persona.sites[domainname]) {
        settings.username = persona.sites[domainame].username;
    } else {
        settings.username = "";
    }
    fill();
    ask2generate();
    setfocus();
}
function setfocus() {
    if (!get("username").value) get("username").focus();
    if (!get("sitename").value) get("sitename").focus();
    if (!get("masterpw").value) get("masterpw").focus();
    if (!get("domainname").value) get("domainname").focus();
}
function getsettings() {
    var personaname = getlowertrim("persona");
    var domainname = getlowertrim("domainname");
    var sitename = getlowertrim("sitename");
    persona = hpSPG.personas[personaname];
    if (!persona) {
        hpSPG.personas[personaname] = clone(hpSPG.personas.default);
        persona = hpSPG.personas[personaname];
        settings = clone(persona.sitenames.default);
        persona.personaname = get("persona").value;
        settings.domainname = domainname;
        settings.characters = characters(settings);
    }
    if (persona.sites[domainname]) {
        settings = clone(persona.sitenames[persona.sites[domainname]]);
    } else {
        settings = clone(persona.sitenames.default);
    }
    fill();
    get("masterpw").focus();
    return settings;
}
function ask2generate() {

    var u = get("username").value;
    var n = get("sitename").value;
    var p = "";
    if (!(settings.allowupper || settings.allowlower || settings.allownumber)) {
        message("nopw", true);
    } else {
        message("nopw", false);
        var r = generate(settings);
        p = r.p;
        if (p) {
            message("nopw", false);
        } else {
            p = "";
            if (get("masterpw").value) {
                message("nopw", true);
            }
        }
    }
    get("sitepass").value = p;
    //copyToClipboard();
}
function fill() {
    if (persona.sites[settings.domainname]) {
        if (!get("username").value) get("username").value = settings.username;
        if (!get("sitename").value) get("sitename").value = settings.sitename;
    } else {
        settings.domainname = get("domainname").value.toLowerCase().trim();
        settings.sitename = get("sitename").value.toLowerCase().trim();
        settings.username = get("username").value.toLowerCase().trim();
    }
    get("clearmasterpw").checked = persona.clearmasterpw;
}
function show() {
    get("settingsshow").style.display = "none";
    get("settingssave").style.visibility = "visible";
    get("domainname").value = settings.domainname;
    get("masterpw").value = masterpw;
    get("clearmasterpw").checked = persona.clearmasterpw;
    get("pwlength").value = settings.length;
    get("startwithletter").checked = settings.startwithletter;
    get("allowlower").checked = settings.allowlower;
    get("allowupper").checked = settings.allowupper;
    get("allownumber").checked = settings.allownumber;
    get("allowspecial").checked = settings.allowspecial;
    get("minnumber").value = settings.minnumber;
    get("minlower").value = settings.minlower;
    get("minupper").value = settings.minupper;
    get("minspecial").value = settings.minspecial;
    get("specials").value = settings.specials;
    get("settings").style.display = "block";
}
function save() {
    persistObject("hpSPG", hpSPG);
    get("settingsshow").style.display = "inline";
    get("settingssave").style.visibility = "hidden";
    get("settings").style.display = "none";
}
function getbookmark() {
    
}
function sitedataHTML() {
    var stored = retrieveObject("hpSPG");
    var sites = persona.sites
    var sitenames = persona.sitenames;
    var sorted = Object.keys(sites).sort(function (x, y) {
        var a = x.toLowerCase();
        var b = y.toLowerCase();
        if (sites[a].toLowerCase() < sites[b].toLowerCase()) return -1;
        if (sites[a].toLowerCase() == sites[b].toLowerCase()) return 0;
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
        var sitename = sites[sorted[i]];
        var s = sitenames[sitename];
        sd += "<tr>";
        sd += "<td><pre>" + sitename + "</pre></td>";
        sd += "<td><pre>" + domainname + "</pre></td>";
        sd += "<td><pre>" + s.username + "</pre></td>";
        sd += "<td><pre>" + s.length + "</pre></td>";
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
function isphishing(sitename) {
    if (!sitename) return false;
    var domainname = get("domainname").value.toLowerCase().trim();
    var domains = Object.keys(persona.sites);
    var phishing = false;
    domains.forEach(function (d) {
        if ((persona.sites[d].toLowerCase().trim() == sitename.toLowerCase().trim()) &&
            (d.toLowerCase().trim() != domainname)) phishing = true;
    });
    return phishing;
}
function specialclick() {
    var minspecial = get("minspecial");
    var specials = get("specials");
    if (get("allowspecial").checked) {
        minspecial.disabled = false;
        minspecial.value = 0;
        specials.disabled = false;
        specials.value = "/!=@?._-";
    } else {
        minspecial.disabled = true;
        minspecial.value = "";
        specials.disabled = true;
        specials.value = "";
    }
    settings.characters = characters(settings);
}
function persistObject(name, value) {
    if (value) {
        localStorage[name] = JSON.stringify(value);
    } else {
        alert("Persist error: No value for :" + name);
    }
}
function retrieveObject(name) {
    try {
        return JSON.parse(localStorage[name]);
    } catch (e) {
        return undefined;
    }
}
function get(element) {
    return document.getElementById(element);
}
function getlowertrim(element) {
    return document.getElementById(element).value.toLowerCase().trim();
}
function clone(object) {
    return JSON.parse(JSON.stringify(object))
}
function copyToClipboard() {
    get("sitepass").focus();
    navigator.clipboard.writeText(password);
}
var msgstate = [false, false, false, false, false];
var msgpriority = ["phishing", "nopw"];
function message(msgname, turnon) {
    if ("phishing" == msgname) msgstate[0] = turnon;
    if ("nopw" == msgname) msgstate[1] = turnon;
    get("phishing").style.display = "none";
    get("nopw").style.display = "none";
    if (msgstate[1]) {
        get("phishing").style.display = "none";
        get("nopw").style.display = "block";
    }
    if (msgstate[0]) {
        get("phishing").style.display = "block";
        get("nopw").style.display = "none";
    }
}
/* 
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
