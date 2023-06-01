[Overview](#overview)
---------------------

It's too hard for you to remember a strong password for every site you use. Password managers take care of this problem for you. Most of them store your passwords in encrypted form, either on your machine or in the cloud.

SitePassword is different. It calculates your password for the site from a single super password and your nickname and user name for the site. That means you can usually get your password if you remember those three things. (Some sites require more settings.) Just go to [SitePassword.info](https://sitepassword.info) or [the page on Github](https://alanhkarp.github.io/SitePasswordWeb) and fill in the form. 

[Who Should Use The Web Page](#who)
---------------------

The SitePassword web page is a companion to the SitePassword browser extension
available from the Chrome Web Store.
In addition to remembering your settings, the extension synchronizes them 
across your machines.  You should use the extension if you are on a 
compatible browser and device, currently Brave, Chrome, Edge, Opera, and Vivaldi on computers. 
Unfortunately, those browsers don't allow extensions on mobile devices.


[Your Super Password](#superpassword)
---------------------------------------

You should choose a strong super password, one with upper and 
lower case letters, numbers, and special characters.  The stronger
the better.  The reason is simple.  A bad guy who knows one site 
password and can guess your nickname and user name for that site
can start guessing super passwords.  You want to make that job 
has hard as you can.

SitePassword doesn't prevent you from using a weak super password,
but it does warn you.  There is a strength indicator directly below 
the super password field.  It uses a meter, words, and color to 
let you know how strong your super password is. 

SitePassword cannot retrieve your super password. 
You should make sure it's something you won't easily forget.  You 
might even want to write it down and keep the copy in a secure place.

[Your Site Passwords](#sitepw)
-------------------------------------------

Fill in the form to compute your site password.  Although you can 
type the login page's URL into the form, you are strongly encouraged 
to paste it from the address bar so SitePassword can warn you about 
potential phishing.

SitePassword could generate a weak site password just by chance. 
To let you know that has happened, it uses the same colors that 
appear in the super password 
strength meter to tell you how strong your site password is.  For 
example, if your site password is orange, then it is weak. 
In that case, just choose a different nickname for the site.

SitePassword can remember your settings for a site.  Just fill in 
the form and click the *Remember Settings* button.  **These 
settings are only stored on the machine you are using.**  They won't 
be available if you use another device.

After you paste your password into the login form, you should remove
it from the clipboard.  The easiest way to do that is to copy some 
innocuous text, such as something on the login page.

When SitePassword can't generate a password acceptable to the site, it can remember a password 
you provide.  This password is stored in your settings encrypted with the computed
password for the site as a key.  That means you must fill in the form before entering 
your password. After you fill in the form, click the <em>Provide your own site password</em> 
check box.  You can then enter your password into the site password field. 

[Computing an Acceptable Password](#acceptable)
--------------------------

Some web sites have strict password rules, how long it must be,
if it must contain upper case or lower case letters, numbers, or
special characters, including restrictions on which special
characters are allowed.  If you run into a site that doesn't 
accept the calculated password, 
change the appropriate menu entries.  SitePassword 
was tested on hundreds of web sites to make sure it can always 
compute a valid password.

[Changing a SitePassword](#change)
----------------------

Some sites make you change your password periodically.  SitePassword
makes that easy.  Just change your nickname for the site.  For example, 
if your current nickname is *MyBank2021*, and they make you change 
your password once a year, you could change the nickname to 
*MyBank2022*.  Your new site password will be completely different 
from the old one.

[Phishing](#phishing)
----------------------

SitePassword includes an antiphishing feature.  If you try to use 
the nickname of a site that you previously had clicked 
<em>Remember Settings</em> for another domain name, you will get a big, 
scary warning.  It's telling you that you may be at a site 
spoofing the one you think you are at.  

Unfortunately, you will 
also see this warning when you are not being tricked.  Many 
websites have several different login pages with different domain 
names.  So, when you see the warning, check the URL of the page 
to make sure it's a login page for the site you think it is.
 
 [The Extension and this Page](#extension)
----------------------

The SitePassword extension plays well with this page. 
In particular, the extension uses bookmarks to synchronize your 
settings across machines.  Pasting the appropriate bookmark into 
the bookmark field on this page fills in the form for you.

If the domain name of the URL you pasted does not match that of the 
bookmark you selected, you'll get a phishing warning.  It's telling you 
that you may be at a site spoofing the one you think you are at. 

[Use with Apps](#apps)
----------------------

You can calculate your password without 
providing a domain name, say to get the password for an app on your mobile 
device.  Of course, you won't be able to remember the settings until you 
provide a domain name.  You can just make one up, 
*e.g., https://MyApp.com*, which you'll use the next time you need 
the password for that app.

[Downloading Your Settings](#download)
----------------------

There is a <em>Download Local Data</em> button at the bottom of 
the page.  That button lets you save your settings in a file you 
can reference if you're at a machine that doesn't have your 
SitePassword settings. <b>Only settings for sites you've chosen
to remember on this machine will be included.</b>


[Source Code](#source)
----------------------

If you are worried that SitePassword might go away, you can download the source code for the extension from the [SitePassword](https://github.com/alanhkarp/SitePassword) project and that of the web page from the [SitePasswordWeb](https://github.com/alanhkarp/SitePasswordWeb) project. (For historical reasons, these are separate projects with a lot of duplicated code.)

[Voluntary Payment](#payment)
-----------------------------

If you like SitePassword, please make a contribution to the [Nancy Lee Hurtt '70 Maryland Promise Scholarship](https://giving.umd.edu/giving/fund.php?name=nancy-lee-hurtt-70-maryland-promise-scholarship) or your favorite charity.