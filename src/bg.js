"use strict";
var legacy = false;  // true to emulate HP Antiphishing Toolbar
// State I want to keep around that doesn't appear in the file system
var activetabid;
var masterpw = "";
var domainname = "";
var protocol = "";
var persona;
var pwcount = 0;
var settings = {};
function bginit() {
    hpSPG = retrieveObject("hpSPG");
    if (!hpSPG) {
        hpSPG = {
            digits: "0123456789",
            lower: "abcdefghijklmnopqrstuvwxyz",
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            specials: "/!=@?._-",
            miniter: 10,
            maxiter: 1000,
            lastpersona: "everyone",
            personas: {
                default: {
                    personaname: "default",
                    autofill: true,
                    clearmasterpw: false,
                    specials: "",
                    sites: {},
                    sitenames: {
                        default: {
                            sitename: "",
                            username: "",
                            hostname: "",
                            length: 12,
                            domainname: "",
                            startwithletter: true,
                            allowlower: true,
                            allowupper: true,
                            allownumber: true,
                            allowspecial: false,
                            minlower: 1,
                            minupper: 1,
                            minnumber: 1,
                            minspecial: 1,
                            specials: "",
                            characters: ""
                        }
                    }
                }
            }
        }
        hpSPG.personas.default.sitenames.default.specials = hpSPG.specials;
        var defaultsettings = hpSPG.personas.default.sitenames.default;
        defaultsettings.characters = characters(defaultsettings);
        hpSPG.personas.everyone = clone(hpSPG.personas.default);
        persona = hpSPG.personas.everyone;
        persona.personaname = "Everyone";
        hpSPG.lastpersona = persona.personaname;
        persistObject("hpSPG", hpSPG);
    }
    persona = hpSPG.personas[hpSPG.lastpersona.toLowerCase().trim()];
    if (persona.sites[domainname]) {
        settings = clone(persona.sitenames[persona.sites[domainname]]);
    } else if (hpSPG.personas.everyone.sites[domainname]) {
        settings = clone(hpSPG.personas.everyone.sites[domainname]);
    } else {
        settings = clone(persona.sitenames.default);
    }
    settings.domainname = domainname;
}
function generate(settings) {
    var n = settings.sitename.toLowerCase().trim();
    var u = settings.username.toLowerCase().trim();
    var m = masterpw;
    if (!m) {
        return { p: "", r: pwcount };
    }
    var s = n.toString() + u.toString() + m.toString();
    var p = compute(s, settings);
    return { p: p, r: pwcount };
}
function compute(s, settings) {
    s = Utf8Encode(s);

    var h = core_sha256(str2binb(s), s.length * chrsz);
    for (var iter = 1; iter < hpSPG.miniter; iter++) {
        h = core_sha256(h, 16 * chrsz);
    }
    while (iter < hpSPG.maxiter) {
        h = core_sha256(h, 16 * chrsz);
        var hswap = Array(h.length);
        for (var i = 0; i < h.length; i++) {
            hswap[i] = swap32(h[i]);
        }
        var sitePassword = binl2b64(hswap, settings.characters).substring(0, settings.length);
        if (verify(sitePassword, settings)) break;
        iter++;
        if (iter >= hpSPG.maxiter) {
            sitePassword = "";
        }
    }
    return sitePassword;
}
function verify(p, settings) {
    var counts = { lower: 0, upper: 0, number: 0, special: 0 };
    for (var i = 0; i < p.length; i++) {
        var c = p.substr(i, 1);
        if (-1 < hpSPG.lower.indexOf(c)) counts.lower++;
        if (-1 < hpSPG.upper.indexOf(c)) counts.upper++;
        if (-1 < hpSPG.digits.indexOf(c)) counts.number++;
        if (-1 < settings.specials.indexOf(c)) counts.special++;
    }
    var valOK = true;
    if (settings.startwithletter) {
        var start = p.substr(0, 1).toLowerCase();
        valOK = valOK && -1 < hpSPG.lower.indexOf(start);
    }
    if (settings.allowlower) valOK = valOK && (counts.lower >= settings.minlower)
    if (settings.allowupper) {
        valOK = valOK && (counts.upper >= settings.minupper)
    } else {
        valOK = valOK && (counts.upper == 0);
    }
    if (settings.allownumber) {
        valOK = valOK && (counts.number >= settings.minnumber);
    } else {
        valOK = valOK && (counts.number == 0);
    }
    if (settings.allowspecial) {
        valOK = valOK && (counts.special >= settings.minspecial);
    } else {
        valOK = valOK && (counts.special == 0);
    }
    return valOK;
}
function persistObject(name, value) {
    try {
        localStorage[name] = JSON.stringify(value);
    } catch (e) {
        return undefined;
    }
}
function retrieveObject(name) {
    try {
        return JSON.parse(localStorage[name]);
    } catch (e) {
        return undefined;
    }
}
function characters(settings) {
    var chars = hpSPG.lower + hpSPG.upper + hpSPG.digits + hpSPG.lower.substr(0, 2);
    if (settings.allowspecial) {
        if (legacy) {
            // Use for AntiPhishing Toolbar passwords
            chars = chars.substr(0, 32) + settings.specials.substr(1) + chars.substr(31 + settings.specials.length);
        } else {
            // Use for SitePassword passwords
            chars = settings.specials + hpSPG.lower.substr(settings.specials.length - 2) + hpSPG.upper + hpSPG.digits;
        }
    } else {
        chars = hpSPG.lower + hpSPG.upper + hpSPG.digits + hpSPG.lower.substr(0, 2);
    }
    if (!settings.allowlower) chars = chars.toUpperCase();
    if (!settings.allowupper) chars = chars.toLowerCase();
    if (!(settings.allowlower || settings.allowupper)) {
        chars = hpSPG.digits + hpSPG.digits + hpSPG.digits +
            hpSPG.digits + hpSPG.digits + hpSPG.digits;
        if (settings.allowspecials) {
            chars = chars + persona.specials.substr(0, 4);
        } else {
            chars = chars + hpSPG.digits.substr(0, 4);
        }
    }
    return chars;
}
function clone(object) {
    return JSON.parse(JSON.stringify(object))
}
function getdomainname(url) {
    return url.split("/")[2];
}
function getprotocol(url) {
    return url.split(":")[0];
}
/* 
This code is a major modification of the code released with the
following licence.  Neither Hewlett-Packard Company nor Hewlett-Packard
Enterprise were involved in the modification.  This source code is
available at https://github.com/alanhkarp/SitePassword.

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