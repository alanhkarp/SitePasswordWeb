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
compatible browser and device, currently Firefox, Safari, and most Chromioum browsers on computers. 
Unfortunately, those browsers don't allow extensions on mobile devices.


[How It Works](#how)
---------------------

SitePassword is different from most password managers. Instead of
storing your passwords, it calculates them from a single super password
and your nickname and user name
for the account. The calculation includes additional parameteres, such as how many upper/lower case letters, numbers, and special characters.  It also allows you to specify a password
when it can't compute a password acceptable to the site.
                

[Your Super Password](#superpassword)
---------------------------------------

You should choose a strong super password, one with upper and 
lower case letters, numbers, and special characters.  The stronger
the better.  The reason is simple.  A bad guy who knows one site 
password and can guess your nickname and user name for that site
can start guessing super passwords.  You want to make that job 
has hard as you can.

You can protect yourself further by using different super passwords
for different kinds of accounts. You could have one that you use for
banking, another for subscriptions, and a third for sites you find
sketchy.               

SitePassword doesn't prevent you from using a weak super password,
but it does warn you. There is a strength indicator directly above
the super password field. The color of your super password corresponds
to the level shown on the meter.  For example, if your super password is green,
it is strong.  If it's orange, your super password is
weak.  Mouse over the meter to see the strength of your super password.
                 
SitePassword cannot retrieve your super password. 
You should make sure it's something you won't easily forget.  You 
might even want to write it down and keep the copy in a secure place.

[The Domain Name](#domainname)
-------------------------------------------

The domain name is associated with the settings for this account.
It is also the title of a bookmark in the SitePasswordData bookmark folder.
That's the bookmark you can use to get your settings when you're on a machine
that doesn't have the SitePassword extension installed.

You can type the login page URL into this field, but you are strongly encouraged
to paste it from the address bar of the login page so SitePassword can warn you about
potential phishing.  

Some web sites use multiple URLs for logging into the same account.  As a result,
you may have more than one domain name for a given account. You'll get the same password
for all of the domain names because they are all associated with the same nickname.

You can forget this domain name
and all settings associated with it by clicking the Forget menu icon or by deleting the bookmark.  

[Bookmark](#bookmark)
-------------------------------------------

SitePassword stores your settings in a bookmark in the SitePasswordData 
bookmark folder.  You don't have to remember your settings if you synchonize your
bookmarks to a given machine.  You can click on the bookmark
for the domain name to open this page with the form filled in, 
or you can paste the bookmark into the form.

[Your Site Name](#sitename)
-------------------------------------------

The site name is the nickname you use refer to this account. It can be easy to remember,
such as <em>amazon</em>
for amazon.com, but it doesn't have to be that simple.
It is one of the things use to compute your site password.

Your settings,
such as your user name, the site password length, and whether your
site password contains special characters are associated with this nickname.
All domain names for this account are associated with this nickname.  The section
*Changing a Site Password* 
tells you how to do that.

[Your User Name](#username)
-------------------------------------------

Your user name is the name you use to log in to the site. It is
associated with the nickname for the account and is used to 
calculate your site password.  That means you can only have a 
single user name for a given nickname.  If you want to use different 
user names for the same site, follow the instructions in 
section *Shared Machines*.            

SitePassword will attempt to fill in the userid field of a login form. If you
don't see it when you think you should, one of a few things happened.

<ol>
<li>You never provided your settings for this domain name.</li>
<ul>
<li>This is the first time you've used SitePassword for this account.</li>
<li>This is a different domain name for logging into the same account.</li>
<li>You are at a fake site that is trying to steal your password.</li>
</ul>
<li>SitePassword incorrectly guessed the location of the userid field.</li>
<li>SitePassword couldn't find the userid field.</li>
</ol>

In the last two cases,
you'll have to fill in your userid manually, which you can do by copying 
it to the clipboard using the Copy menu icon in the userid field.
                             
[Your Site Passwords](#sitepw)
-------------------------------------------

SitePassword combines you super password, site name, and user name to 
compute your password for the site.  It also uses the additional settings you
provide to generate a password the site will accept.

SitePassword could generate a weak site password just by chance.
To let you know that has happened, it uses the same kind of
strength meter to tell you how strong your site password is.
For example, if your site password is orange, then it is weak. In
that case, just choose a different nickname for the account.  You'll 
almost certainly get a strong site password.    

[Provided Password Code](#code)
-------------------------------------------

When the generated password can't be used, say if you've been given one that
you're not allowed to change, SitePassword can remember a password
you provide. It is stored in your settings encrypted with the computed
password for the site as a key. That means you must fill in the form before entering
your own password. After you fill in the form, click the <em>Provide your own site password</em> 
check box. You can then enter your password into the site password field.

The code in the bookmark is a list of integers represnting
the encrypted value the password you provided.  You must
fill in the form with the same settings you used when you
provided the password, including the code from the bookmark.

You won't have to type in the numbers in the code if you
synchonize bookmarks to this machine.  You can click on the
bookmark for the domain name to open this page with the form

[Input Field Menus (3 Blue Dots)](#menus)
--------------------------

Each of the input fields has a menu that shows up when you mouse over 
(or tap on a touchscreen) the 3 dots in the right side of the field.  Each field has a 
particular set of menu items.  If an icon is grayed out, it is not available for that field.  For example, you can't 
forget a domain name if that field is empty.

<img src="src/help.png" alt="help" style="width: 16px; height: 16px; vertical-align: middle;">
&nbsp; 
Every field has a help option, 
which provides a brief summary of the information contained in these Instructions.

<img src="src/forget.png" alt="forget" style="width: 16px; height: 16px; vertical-align: middle;"> &nbsp;
The domain name, sitename and username fields have a Forget option.  For example, if you click this icon in the site nickname 
field, you will be given the opportunity to permanently forget the settings for all domain names associated 
with that site nickname.

<svg class="icon menu-icon" width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" style="top: 7px">
<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M8 5v0a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v0M8 5v0a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v0"></path>
</svg>&nbsp;
The user name and site password fields have a Copy option, which copies the contents of the field to the clipboard.

<svg class="icon menu-icon" width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" style="top: 7px">
<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6.362A9.707 9.707 0 0 1 12 5c6.307 0 9.367 5.683 9.91 6.808.06.123.06.261 0 .385-.352.728-1.756 3.362-4.41 5.131M14 18.8a9.93 9.93 0 0 1-2 .2c-6.307 0-9.367-5.683-9.91-6.808a.44.44 0 0 1 0-.386c.219-.452.84-1.632 1.91-2.885m6 .843A3 3 0 0 1 14.236 14M3 3l18 18"></path>
</svg><svg class="icon menu-icon" width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" style="top: 7px">
<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5c-6.307 0-9.367 5.683-9.91 6.808a.435.435 0 0 0 0 .384C2.632 13.317 5.692 19 12 19s9.367-5.683 9.91-6.808a.435.435 0 0 0 0-.384C21.368 10.683 18.308 5 12 5z"></path>
<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
</svg>&nbsp; 
The super and site password fields give you the option of showing or hiding the contents of the field.
By default, your super password is hidden, and your site password is not.  You can change the default behavior of 
the site password field by clicking the <em>Hide site password by default</em>
option in the settings panel.
                
[Computing an Acceptable Password](#acceptable)
--------------------------

Some web sites have strict password rules, how long it must be,
if it must contain upper case or lower case letters, numbers, or
special characters, including restrictions on which special
characters are allowed. If you run into a site that doesn't
accept the calculated password, change the appropriate menu entries. SitePassword
was tested on hundreds of web sites to make sure it can always
compute a valid password.

You can also change the default values that SitePassword uses.
For example, SitePassword defaults to a password length of 12 
and no special characters.  You can change these defaults by clicking the <em>Change default settings</em>
option in the settings panel.               

[Changing a SitePassword](#change)
----------------------

Some sites make you change your password periodically. SitePassword
makes that easy. Just change your nickname for the account. For example,
if your current nickname is <em>MyBank1</em>
, and they make you change
your password, you could change the nickname to
<em>MyBank2</em>. Your new site password will be completely different
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

[Shared Machines](#phishing)
----------------------

Many households have one machine shared by everybody. It's likely
that everyone uses the same user name and password for certain
accounts, such as streaming services. It's also likely that those
people use their individual user names and passwords for other
accounts, such as social media.

SitePassword accomodates those uses with a feature provided by
your browser called *Profiles*.                 

 [The Extension and this Page](#extension)
----------------------

The SitePassword extension plays well with this page.
In particular, the extension uses bookmarks to synchronize your
settings across machines. Pasting the appropriate bookmark into
the bookmark field on this page fills in the form for you.  You 
can also click on the bookmark to open this page with the form 
filled in for you.

If the domain name of the URL you pasted does not match that of the
bookmark you selected, you'll get a phishing warning. It's telling you
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

There is a <em>Download local data</em> button at the bottom of 
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

[Developers](#developers)
-----------------------------

A number of tests are included with the distribution.  In keeping with the
philosophy of avoiding dependencies, the tests don't use any frameworks.  To run the tests, set a a variable in localStorage  *test* to true.  Then reload the page.  You'll get an alert that tests are running to make it harder for you to forget to turn off testing.  Test results appear on the console.