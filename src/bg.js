"use strict";
let SitePassword = ((function (self) {
    const storagekey = "SitePasswordData";
    const defaultsettings = {
        sitename: "",
        username: "",
        pwlength: 12,
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
    }
    let masterpassword = "";

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
                localStorage[storagekey] = JSON.stringify(database);
            } else {
                console.log("can't persist database:", database);
            }
        } catch (e) {
            console.log(e);
        }
    }
    function retrieveDatabase() {
        try {
            return JSON.parse(localStorage[storagekey]);
        } catch (e) {
            console.log(e);
        }
        return undefined;
    }

    function generateCharacterSet(settings) {
        // generate a set of 64 characters for encoding
        let chars = "";
        if (settings.allowspecial) {
            chars += settings.specials;
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
        while ((chars.length > 0) && (chars.length < 64)) {
            chars += chars;
        }
        return chars;
    }
    function verifyPassword(pw, settings) {
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
    function computePassword(payload, settings) {
        let pw = "";
        payload = Utf8Encode(payload);
        const cset = generateCharacterSet(settings);
        //console.log("computePassword: characterSet =", cset);
        let h = core_sha256(str2binb(payload), payload.length * chrsz);
        for (var iter = 1; iter < self.miniter; iter++) {
            h = core_sha256(h, 16 * chrsz);
        }
        while (iter < self.maxiter) {
            h = core_sha256(h, 16 * chrsz);
            let hswap = Array(h.length);
            for (let i = 0; i < h.length; i++) {
                hswap[i] = swap32(h[i]);
            }
            pw = binl2b64(hswap, cset).substring(0, settings.pwlength);
            if (verifyPassword(pw, settings)) {
                return pw;
            }
            iter++;
        }
        return "";
    }
    function generatePassword() {
        const settings = self.settings;
        if (settings.allowupper || settings.allowlower || settings.allownumber) {
            const n = normalize(settings.sitename);
            const u = normalize(settings.username);
            const m = self.getMasterPassword();
            if (!m) {
                return "";
            }
            const s = n.toString() + '\t'
                + u.toString() + '\t'
                + m.toString();
            return computePassword(s, settings);
        }
        return "";
    }

    self.normalize = normalize;
    self.generatePassword = generatePassword;
    self.getMasterPassword = function () {
        return cloneObject(masterpassword);
    }
    self.setMasterPassword = function (pw) {
        if (typeof pw === 'string') {
            masterpassword = cloneObject(pw);
            return pw;
        }
        return undefined;
    }
    self.getDefaultSettings = function () {
        return cloneObject(defaultsettings);
    }
    self.settings = self.getDefaultSettings();
    if (typeof self.database !== 'object') {
        self.database = retrieveDatabase();
    }
    if (typeof self.database !== 'object') {
        console.log("creating new database:", storagekey);
        self.database = {
            domains: {},  // domainname -> sitename
            sites: {},  // sitename -> settings
        };
    }
    self.validateDomain = function (domainname, sitename) {
        domainname = normalize(domainname);
        sitename = normalize(sitename);
        if (!domainname || !sitename) return true;  // nothing to check...
        const db = self.database;
        if (!db.sites[sitename]) return true;  // candidate site...
        const ds = Object.keys(db.domains);
        for (const d of ds) {
            const s = db.domains[d];
            if ((s === sitename) && (d === domainname)) {
                return true;  // found matching entry, domainname is valid.
            }
        }
        return false;  // entry not found, could be a phishing attempt!
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
            settings = defaultsettings;
        }
        self.settings = cloneObject(settings);
        cachedsettings = JSON.stringify(self.settings);
        return self.settings;
    }
    self.storeSettings = function () {
        const domainname = self.domainname;
        const settings = self.settings;
        const sitename = normalize(settings.sitename);
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
            cachedsettings = JSON.stringify(settings);
        }
    }
    self.settingsModified = function () {
        return (cachedsettings !== JSON.stringify(self.settings));
    }
    self.forgetSettings = function () {
        const domainname = self.domainname;
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
    version: "1.0",
    clearmasterpw: false,
    miniter: 100,
    maxiter: 10000,
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