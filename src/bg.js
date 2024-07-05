"use strict";
let SitePassword = ((function (self) {
    self.storagekey = "SitePasswordData";
    self.defaultskey = "SitePasswordDefaults";
    // Use localStorage.test = "true" to run tests
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
    let defaultpwlength = 12;
    self.defaultsettings = {
        sitename: "",
        username: "",
        pwlength: defaultpwlength,
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
        xor: new Array(defaultpwlength).fill(0),
    }
    // Make sure default settings and database are stored
    if (!localStorage[self.defaultskey]) {
        localStorage.setItem(self.defaultskey, JSON.stringify(self.defaultsettings));
    }
    if (!localStorage[self.storagekey]) {
        localStorage.setItem(self.storagekey, JSON.stringify({
            domains: {},
            sites: {},
        }));
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
    self.cloneObject = function (object) {
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
        // generate a set of no more than 256 characters for encoding
        let chars = "";
        if (settings.allownumber) {
            chars += self.digits;
        }
        if (settings.allowupper) {
            chars += self.upper;
        }
        if (settings.allowlower) {
            chars += self.lower;
        }
        if (settings.allowspecial) {
            chars += settings.specials;
            // I'll always return a password with enough special characters,
            // but I might have to use the deterninistic password to do it.
            // Making sure there are enough special characters in the set
            // will make that less likely
            while (chars.length < 5) {
                chars += settings.specials;
            }
        }
        return chars.substring(0, 256); // substring just in case...
    }
    function verifyPassword(pw, settings) {
        let report = zxcvbn(pw);
        if (!(report.sequence.length == 1 && report.sequence[0].pattern === "bruteforce")) return false;    
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
        if (!(settings.allowupper || settings.allowlower || settings.allownumber || settings.allowspecial)) {
            await Promise.resolve(); // To match the await on the other branch
            return "";
        }
        let args = {"pw": superpw, "salt": salt, "settings": settings, "iters": 200_000, "keysize": settings.pwlength * 16};
        let pw = await candidatePassword(args);
        // Find a valid password
        let iter = 0;
        let startIter = Date.now();
        while (iter < 200) {
            if (verifyPassword(pw, settings)) {
                if (logging) console.log("bg succeeded in", iter, "iterations and took", Date.now() - startIter, "ms");
                return pw;
            }
            iter++;
            args = {"pw": pw, "salt": salt, "settings": settings, "iters": 1, "keysize": settings.pwlength * 16};
            pw = await candidatePassword(args);
        }
        // Construct a legal password since hashing failed to produce one
        if (logging) console.log("bg failed after", iter, "extra iteration and took", Date.now() - startIter, "ms");
        while (iter < 210) {
            iter++;
            pw = uint2chars(); // Meets requirements but might be weak
            if (verifyPassword(pw, settings)) {
                if (logging) console.log("bg deterministic algorithm succeeded in", iter - 200, "iterations and took", Date.now() - startIter, "ms");
                return pw;
            }
        }
        if (logging) console.log("bg deterministic algorithm failed after", iter, "iterations and took", Date.now() - startIter, "ms");
        return pw; // Better to return a weak password than non at all
        // Uses 1 byte per character in the password because the hash isn't available.
        function uint2chars() {
            let byteArray = new TextEncoder().encode(pw);
            let chars = "";
            let upper = settings.allowupper ? self.upper: "";
            let lower = settings.allowlower? self.lower: "";
            let digits = settings.allownumber ? self.digits: "";
            let specials = settings.allowspecial ? settings.specials: "";
            let cset = upper + lower + digits + specials;
            if (!cset) return "";
            if (settings.startwithletter) {
                let alphabet = "";
                if (settings.allowupper) alphabet += upper;
                if (settings.allowlower) alphabet += lower;
                pickChars(1, byteArray, alphabet);
            }
            let firstIsUpper = settings.startwithletter && upper.includes(chars[0]) ? 1 : 0;
            let firstIsLower = settings.startwithletter && lower.includes(chars[0]) ? 1 : 0;
            if (settings.allowupper) pickChars(settings.minupper - firstIsUpper, byteArray.slice(chars.length), upper);
            if (settings.allowlower) pickChars(settings.minlower - firstIsLower, byteArray.slice(chars.length), lower);
            if (settings.allownumber) pickChars(settings.minnumber, byteArray.slice(chars.length), digits);
            if (settings.allowspecial) pickChars(settings.minspecial, byteArray.slice(chars.length), specials);
            let len = byteArray.length - chars.length;
            pickChars(len, byteArray.slice(chars.length), cset);
            // In case password must start with a letter
            if (settings.startwithletter) {
                chars = chars[0] + shuffle(chars.slice(1));
            } else {
                chars = shuffle(chars);
            }
            return chars;
            function pickChars(nchars, byteArray, cset) {
                for (let i = 0; i < nchars; i++) {
                    chars += cset[byteArray[i] % cset.length];
                }
            }
            function shuffle(chars) {
                let currentIndex = chars.length;
                let charsArray = chars.split("");
                // While there remain elements to shuffle...
                while (0 !== currentIndex) {                      
                  // Pick a remaining element...
                  let index = byteArray[currentIndex] % charsArray.length;
                  currentIndex -= 1;                      
                  // And swap it with the current element.
                  let temporaryValue = charsArray[currentIndex];
                  charsArray[currentIndex] = charsArray[index];
                  charsArray[index] = temporaryValue;
                }
                chars = charsArray.join("");
                return chars;
              }                      
        }            
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
        return crypto.subtle.importKey("raw", passphrase, { name: "PBKDF2" }, false, ["deriveBits"])
        .then(async (passphraseImported) => {
            let start = Date.now();
            return crypto.subtle.deriveBits(
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
                // if (Date.now() - start > 2) console.log("deriveBits did", iters, "iterations in", Date.now() - start, "ms");
                const cset = generateCharacterSet(settings);
                let uint8array = new Uint8Array(bits);
                // Convert the Uint8array to a string using a custom algorithm               
                let pw = uint2chars(uint8array.slice(0, 2*settings.pwlength), cset);
                return pw;
                function uint2chars(array) {
                    let chars = "";
                    let len = array.length;
                    for (let i = 0; i < len; i += 2) {
                        let index = array[i] << 8 | array[i + 1];
                        chars += cset[index % cset.length];
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
        if (!m || !isConsistent(settings)) {
            return "";
        }
        const salt = n.toString() + '\t'+ u.toString();
        if (logging) console.log("bg calling computePassword");
        let start = Date.now();
        let pw = await computePassword(m, salt, settings);
        if (logging) console.log("bg computePassword returned", pw, "took", Date.now() - start, "ms");
        return pw;
        function isConsistent(settings) {
            let total = 0
            if (settings.allowupper) total += settings.minupper;
            if (settings.allowlower) total += settings.minlower;
            if (settings.allownumber) total += settings.minnumber;
            if (settings.allowspecial) total += settings.minspecial;
            return total <= settings.pwlength && total > 0;
        }
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
        if (typeof array === 'string') return array;
        let str = "";
        for (let i = 0; i < array.length; i++) {
            str += String.fromCharCode(array[i]);
        }
        return str;
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
    self.generateCharacterSet = generateCharacterSet;
    self.xorStrings = xorStrings;
    self.stringXorArray = stringXorArray;
    self.getSuperPassword = function () {
        return self.cloneObject(superpassword);
    }
    self.setSuperPassword = function (pw) {
        if (typeof pw === 'string') {
            superpassword = self.cloneObject(pw);
            return pw;
        }
        return undefined;
    }
    self.getDefaultSettings = function () {
        let newdefaultsstr = localStorage[self.defaultskey];
        if (newdefaultsstr) self.defaultsettings = JSON.parse(newdefaultsstr);
        return self.cloneObject(self.defaultsettings);
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
        self.settings = self.cloneObject(settings);
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
            self.database.sites[sitename] = self.cloneObject(settings);
            persistDatabase(self.database);
            cachedsettings = JSON.stringify(self.cloneObject(settings));
        }
    }
    self.settingsModified = function () {
        return (cachedsettings !== JSON.stringify(self.cloneObject(self.settings)));
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
    digits: "0123456789",
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    specials: "$/!=@?._-",
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