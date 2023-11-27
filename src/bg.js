"use strict";
let SitePassword = ((function (self) {
    self.storagekey = "SitePasswordData";
    self.defaultskey = "SitePasswordDefaults";
    if (localStorage.test === "true") {
        let script = document.createElement("script");
        script.src = "src/test.js";
        document.head.appendChild(script);
        self.storagekey = "SitePasswordDataTest";
        self.defaultskey = "SitePasswordDefaultsTest";
        if (!localStorage.restart) {
            localStorage.removeItem(self.storagekey);
            localStorage.removeItem(self.defaultskey);
        }
    } 
    self.defaultsettings = {
        sitename: "",
        username: "",
        pwlength: 12,
        providesitepw: false,
        startwithletter: true,
        allowlower: true,
        minlower: 1,
        allowupper: true,
        minupper: 1,
        allownumber: true,
        minnumber: 1,
        allowspecial: false,
        minspecial: 1,
        specials: (self.specials || "_"),
        xor: new Array(12).fill(0),
    }
    let superpassword = "";

    function normalize(name) {
        if (name) {
            try {
                return name.trim().toLowerCase();
            } catch (e) {
                console.log(e);
            }
        }
        return "";
    }
    function cloneObject(object) {
        return JSON.parse(JSON.stringify(object))
    }

    function persistDatabase(database) {
        try {
            if (typeof database === 'object') {
                localStorage[self.storagekey] = JSON.stringify(database);
                localStorage[self.defaultskey] = JSON.stringify(self.defaultsettings);
            } else {
                console.log("can't persist database:", database);
            }
        } catch (e) {
            console.log(e);
        }
    }
    function retrieveDatabase() {
        try {
            return JSON.parse(localStorage[self.storagekey]);
        } catch (e) {
            if (localStorage.test === "false") console.log(e);
        }
        return undefined;
    }

    function generateCharacterSet(settings) {
        // generate a set of 256 characters for encoding
        let chars = "";
        if (settings.allowspecial) {
            chars += settings.specials;
            while (chars.length <= 8) {
                chars += settings.specials;
            }
        }
        if (settings.allownumber) {
            chars += self.digits;
        }
        if (settings.allowupper) {
            chars += self.upper;
        }
        if (settings.allowlower) {
            chars += self.lower;
        }
        return chars.substring(0, 256); // substring just in case...
    }
    function verifyPassword(pw, settings) {
        let report = zxcvbn(pw);
        if ((pw.length >= 12 && report.score < 4) ||
            (pw.length >= 10 && pw.length < 12 && report.score < 3) ||
            (pw.length >= 8 && pw.length < 10 && report.score < 2) ||
            (pw.length < 8 && report.score < 1)) return false;
        var counts = { lower: 0, upper: 0, number: 0, special: 0 };
        for (var i = 0; i < pw.length; i++) {
            var c = pw.charAt(i);
            if (-1 < self.lower.indexOf(c)) counts.lower++;
            if (-1 < self.upper.indexOf(c)) counts.upper++;
            if (-1 < self.digits.indexOf(c)) counts.number++;
            if (-1 < settings.specials.indexOf(c)) counts.special++;
        }
        var valOK = true;
        if (settings.startwithletter) {
            var start = pw.charAt(0).toLowerCase();
            valOK = valOK && -1 < self.lower.indexOf(start);
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
    async function computePassword(superpw, salt, settings) {
        if (!(settings.allowupper || settings.allowlower || settings.allownumber)) {
            return Promise.resolve("");
        }
        if (logging) console.log("bg superpw, salt", superpw, salt)
        let args = {"pw": superpw, "salt": salt, "settings": settings, "iters": self.hashiter, "keysize": self.keySize};
        let pw = await candidatePassword(args);
        // Find a valid password
        let startIter = Date.now();
        let iter = 0;
        while (Date.now() - startIter < 150) {
            if (verifyPassword(pw, settings)) {
                console.log("bg succeeded in", iter, "iterations and took", Date.now() - startIter, "ms");
                return pw;
            }
            iter++;
            args = {"pw": pw, "salt": salt, "settings": settings, "iters": 1, "keysize": 1024*16};
            pw = await candidatePassword(args);
        }
        console.log("bgs failed after", iter, "extra iteration and took", Date.now() - startIter, "ms");
        return "";
    }
    async function candidatePassword(args) {
        let superpw = args.pw;
        let salt = args.salt;
        let settings = args.settings;
        let iters = args.iters;
        let keysize = args.keysize;
        let payload = Utf8Encode(superpw);
        let passphrase = new TextEncoder().encode(payload);
        // Use Password Based Key Derivation Function because repeated iterations
        // don't weaken the result as much as repeated SHA-256 hashing.
        return window.crypto.subtle.importKey("raw", passphrase, { name: "PBKDF2" }, false, ["deriveBits"])
        .then(async (passphraseImported) => {
            let start = Date.now();
            if (logging) console.log("bg passphraseImported", passphraseImported);
            return window.crypto.subtle.deriveBits(
                {
                    name: "PBKDF2",
                    hash: 'SHA-256',
                    salt: new TextEncoder().encode(salt),
                    iterations: iters
                },
                passphraseImported,
                keysize 
            )  
            .then((bits) => {
                const cset = generateCharacterSet(settings);
                if (Date.now() - start > 2) console.log("deriveBits did", self.hashiter, "iterations in", Date.now() - start, "ms");
                let bytes = new Uint8Array(bits);
                // Convert the Uint32Array to a string using a custom algorithm               
                let candidates = bytes2chars(bytes.slice(0, 256), cset);
                let pw = candidates.substring(0, settings.pwlength);
                return pw;
                function bytes2chars(bytearray, cset) {
                    let chars = "";
                    let len = bytearray.length;
                    for (let i = 0; i < len; i++) {
                        chars += cset[bytearray[i] % cset.length];
                    }
                    return chars;
                }            
            }); 
        });
    }
    async function generatePassword() {
        const settings = self.settings;
        const n = normalize(settings.sitename);
        const u = normalize(settings.username);
        const m = self.getSuperPassword();
        if (!m) {
            return "";
        }
        const salt = n.toString() + '\t'+ u.toString();
        if (logging) console.log("bg calling computePassword");
        let start = Date.now();
        let pw = await computePassword(m, salt, settings);
        if (logging) console.log("bg computePassword returned", pw, "took", Date.now() - start, "ms");
        return pw;
    }
    function xorStrings(provided, sitepw) {
        let b = sitepw;
        // Make the strings equal length
        while (sitepw.length > 0 && provided.length > b.length) {
            b += sitepw;
        } // b.length >= a.length
        b = b.substring(0, provided.length); // b.length === provided.length
        let result = [];
        for (let i = 0; i < provided.length; i++) {
          result.push(provided.charCodeAt(i) ^ b.charCodeAt(i));
        }
        return result;
    }
    function stringXorArray(sitepw, array) {
        if (!sitepw) return "";
        let b = sitepw;
        while (array.length > b.length) {
            b += sitepw;
        }
        b = b.substring(0, array.length);
        let a = string2array(b);
        for (let i = 0; i < array.length; i++) {
            a[i] = a[i] ^ array[i];
        }
        let result = array2string(a);
        return result;
    }
    function string2array(str) {
        let array = [];
        for (let i = 0; i < str.length; i++) {
            array.push(str[i].charCodeAt());
        }
        return array;
    }
    function array2string(array) {
        let str = "";
        for (let i = 0; i < array.length; i++) {
            str += String.fromCharCode(array[i]);
        }
        return str;
    }
    function binl2chars(uint32array, cset) {
        let chars = "";
        let binarray = new Uint8Array(uint32array.buffer);
        let len = binarray.length;
        for (let i = 0; i < len; i++) {
            chars += cset[binarray[i]];
        }
        return chars;
    }
// From: 
/**
*
*  Secure Hash Algorithm (SHA256)
*  http://www.webtoolkit.info/
*
*  Original code by Angel Marin, Paul Johnston.
*
**/

function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
  	var c = string.charCodeAt(n);
	if (c < 128) {
	    utftext += String.fromCharCode(c);
	}
	else if((c > 127) && (c < 2048)) {
	    utftext += String.fromCharCode((c >> 6) | 192);
	    utftext += String.fromCharCode((c & 63) | 128);
	}
	else {
	    utftext += String.fromCharCode((c >> 12) | 224);
	    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	    utftext += String.fromCharCode((c & 63) | 128);
	}
    }
    return utftext;
}
    self.array2string = array2string;
    self.normalize = normalize;
    self.generatePassword = generatePassword;
    self.xorStrings = xorStrings;
    self.stringXorArray = stringXorArray;
    self.getSuperPassword = function () {
        return cloneObject(superpassword);
    }
    self.setSuperPassword = function (pw) {
        if (typeof pw === 'string') {
            superpassword = cloneObject(pw);
            return pw;
        }
        return undefined;
    }
    self.getDefaultSettings = function () {
        let newdefaultsstr = localStorage[self.defaultskey];
        if (newdefaultsstr) self.defaultsettings = JSON.parse(newdefaultsstr);
        return cloneObject(self.defaultsettings);
    }
    self.settings = self.getDefaultSettings();
    if (typeof self.database !== 'object') {
        self.database = retrieveDatabase();
    }
    if (typeof self.database !== 'object') {
        //console.log("creating new database:", self.storagekey);
        self.database = {
            domains: {},  // domainname -> sitename
            sites: {},  // sitename -> settings
        };
    }
    self.validateDomain = function (domainname, sitename) {
        domainname = normalize(domainname);
        sitename = normalize(sitename);
        if (!domainname || !sitename) return undefined;  // nothing to check...
        const db = self.database;
        if (!db.sites[sitename]) return undefined;  // candidate site...
        const ds = Object.keys(db.domains);
        for (const d of ds) {
            const s = db.domains[d];
            if ((s === sitename) && !(d === domainname)) {
                return d;  // found matching entry, domainname is valid.
            }
        }
        return undefined;  // entry not found, could be a phishing attempt!
    }
    self.domainname = "";
    self.siteForDomain = function (domainname) {
        domainname = normalize(domainname);
        return self.database.domains[domainname];
    }
    let cachedsettings = "";
    self.loadSettings = function (sitename) {
        sitename = normalize(sitename);
        let settings = (sitename ? self.database.sites[sitename] : undefined);
        if (!settings) {
            settings = self.defaultsettings;
        }
        if ('string' !== typeof settings.specials) {
            let specials = array2string(settings.specials);
            settings.specials = specials;
        }
        self.settings = cloneObject(settings);
        cachedsettings = JSON.stringify(self.settings);
        return self.settings;
    }
    self.storeSettings = function () {
        const domainname = self.domainname;
        const settings = self.settings;
        if ("string" === typeof settings.specials) {
            let array = string2array(settings.specials);
            settings.specials = array;
        }
        const sitename = normalize(settings.sitename);
        localStorage.setItem(self.defaultskey, JSON.stringify(self.defaultsettings));
        if (domainname && sitename) {
            let oldsitename = self.database.domains[domainname];
            if ((!oldsitename) || sitename === oldsitename) {
                self.database.domains[domainname] = sitename;
            } else {
                // Find all domains that point to oldsitename 
                // and have them point to the new one
                for (let key of Object.keys(self.database.domains)) {
                    if (self.database.domains[key] === oldsitename) {
                        self.database.domains[key] = sitename;
                    }
                }
                // then remove the old site name from database.sites
                delete self.database.sites[oldsitename];
            }
            self.database.sites[sitename] = cloneObject(settings);
            persistDatabase(self.database);
            cachedsettings = JSON.stringify(cloneObject(settings));
        }
    }
    self.settingsModified = function () {
        return (cachedsettings !== JSON.stringify(cloneObject(self.settings)));
    }
    self.forgetSettings = function (domainname) {
        const sitename = self.siteForDomain(domainname);
        delete self.database.domains[domainname];
        // Delete the item in database.sites if there are no entries
        // in database.domains that refer to it
        if (!Object.values(self.database.domains).includes(sitename)) {
            delete self.database.sites[sitename];
        }
        persistDatabase(self.database);
        self.domainname = "";
        return self.loadSettings();  // reset to default settings
    }
    return self;
})({
    version: "3.0",
    clearsuperpw: false,
    hashiter: 1, // Largest value that meets the latency requirements
    keySize: 1024*1024*64,  // for this key size
    digits: "0123456789",
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    specials: "/!=@?._-",
}));

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