[Overview](#overview)
---------------------

It's too hard for you to remember a strong password for every site you use. Password managers take care of this problem for you. Most of them store your passwords in encrypted form, either on your machine or in the cloud.

SitePassword is different. It calculates your password for the site from a single master password and your nickname and user name for the site. That means you can usually get your password if you remember those three things. (Some sites require more settings.) Just go to [SitePassword.info](https://sitepassword.info) or [the page on Github](https://alanhkarp.github.io/SitePasswordWeb) and fill in the form. 

[Who Should Use The Web Page](#who)
---------------------

The SitePassword web page is a companion to the SitePassword browser extension
available from the Chrome Web Store.
In addition to remembering your settings, the extension synchronizes them 
across your machines.  You should use the extension if you are on a 
compatible browser and device, currently Chrome, Edge, Opera, and Brave on computers. 
Unfortunately, those browsers don't allow extensions on mobile devices.


[Your Master Password](#masterpassword)
---------------------------------------

You should choose a strong master password, one with upper and 
lower case letters, numbers, and special characters.  The stronger
the better.  The reason is simple.  A bad guy who knows one site 
password and can guess your nickname and user name for that site
can start guessing master passwords.  You want to make that job 
has hard as you can.

SitePassword doesn't prevent you from using a weak master password,
but it does warn you.  There is a strength indicator directly below 
the master password field.  It uses a meter, words, and color to 
let you know how strong your master password is. 

SitePassword cannot retrieve your master password. 
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
appear in the master password 
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

Since SitePassword doesn't store your passwords, there's no way
you can use your existing passwords with it.  You will have to use 
the web site's <em>Change Password</em> or <em>Forgot Password</em>
feature on sites where you already have accounts.


[Computing an Acceptable Password](#acceptable)
--------------------------

Some web sites have strict password rules, how long it must be,
if it must contain upper case or lower case letters, numbers, or
special characters, including restrictions on which special
characters are allowed.  If you run into a site that doesn't 
accept the calculated password, 
click  <svg width="12px" height="12px" viewBox="2 1 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 21h-4l-.551-2.48a6.991 6.991 0 0 1-1.819-1.05l-2.424.763-2-3.464 1.872-1.718a7.055 7.055 0 0 1 0-2.1L3.206 9.232l2-3.464 2.424.763A6.992 6.992 0 0 1 9.45 5.48L10 3h4l.551 2.48a6.992 6.992 0 0 1 1.819 1.05l2.424-.763 2 3.464-1.872 1.718a7.05 7.05 0 0 1 0 2.1l1.872 1.718-2 3.464-2.424-.763a6.99 6.99 0 0 1-1.819 1.052L14 21z"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
</svg>
and change the appropriate menu entries.  SitePassword 
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
the page after you 
click <svg width="12px" height="12px" viewBox="2 1 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 21h-4l-.551-2.48a6.991 6.991 0 0 1-1.819-1.05l-2.424.763-2-3.464 1.872-1.718a7.055 7.055 0 0 1 0-2.1L3.206 9.232l2-3.464 2.424.763A6.992 6.992 0 0 1 9.45 5.48L10 3h4l.551 2.48a6.992 6.992 0 0 1 1.819 1.05l2.424-.763 2 3.464-1.872 1.718a7.05 7.05 0 0 1 0 2.1l1.872 1.718-2 3.464-2.424-.763a6.99 6.99 0 0 1-1.819 1.052L14 21z"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
</svg>.  That button lets you save your settings in a file you 
can reference if you're at a machine that doesn't have your 
SitePassword settings. <b>Only settings for sites you've chosen
to remember on this machine will be included.</b>


[Source Code](#source)
----------------------

If you are worried that SitePassword might go away, you can download the source code for the extension from the [SitePassword](https://github.com/alanhkarp/SitePassword) project and that of the web page from the [SitePasswordWeb](https://github.com/alanhkarp/SitePasswordWeb) project. (For historical reasons, these are separate projects with a lot of duplicated code.)

[Voluntary Payment](#payment)
-----------------------------

If you like SitePassword, please make a contribution to the [Internet Archive](https://archive.org/donate?origin=iawww-TopNavDonateButton) or your favorite charity.