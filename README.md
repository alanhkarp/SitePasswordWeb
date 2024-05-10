Instructions
============

### Who Should Use This Web Page

This web page is a companion to the SitePassword browser extension. In addition to remembering your settings, the extension synchronizes them across your machines. You should use the extension if you are using a compatible browser. Unfortunately, browsers on mobile devices don't allow extensions.

The SitePassword web page is also available at [https://alanhkarp.github.io/SitePasswordWeb/](https://alanhkarp.github.io/SitePasswordWeb/) .

### How It Works

SitePassword is different from most password managers. Instead of storing your passwords, it calculates them from a single super password and your nickname and user name for the account. That means you can usually get your site password if you remember those three things. (Some web pages require additional settings.) It also allows you to specify the password when you can't use the computed password.

### Your Super Password

You should choose a strong super password, one with upper and lower case letters, numbers, and special characters. The stronger the better. The reason is simple. A bad guy who knows one site password and can figure out your nickname and user name for that site can start guessing super passwords. You want to make that job has hard as you can.

You can protect yourself further by using different super passwords for different kinds of accounts. You could have one that you use for banking, another for subscriptions, and a third for sites you find sketchy.

SitePassword doesn't prevent you from using a weak super password, but it does warn you. There is a strength indicator directly above the super password field. The color of your super password corresponds to the level shown on the meter. For example, if your super password is green, it is strong. If it's orange, your super password is weak. The tooltip tells how long it would take a determined adversary to guess your password.

You'll notice that your super password is not usually marked Strong until it is longer than a site password marked Strong. That's because the super password is something you can remember, while the site password is effectively a random string of characters, which is less guessable.

SitePassword cannot retrieve your super password. You should make sure it's something you won't easily forget. You might even want to write it down and keep the copy in a secure place.

### The Domain Name

The domain name is associated with the settings for this account. It is also the name of a bookmark in the SitePasswordData bookmark folder. That's the bookmark you can use to get your settings when you're on a machine that doesn't have the SitePassword extension installed.

You can type the login page URL into this field, but you are strongly encouraged to paste it from the address bar of the login page so SitePassword can warn you about potential phishing.

Some web sites use multiple URLs for logging into the same account. As a result, you may have more than one domain name for a given account. You'll get the same password for all of the domain names because they are all associated with the same nickname.

### Bookmark

SitePassword stores your settings in a bookmark in the SitePasswordData bookmark folder. You don't have to remember your settings if you synchonize your bookmarks to this machine. You can click on the bookmark for the domain name to open this page with the form filled in, or you can paste the bookmark into the form.

### Your Site Name

The site name is the nickname you use refer to this account. It can be easy to remember, such as _amazon_ for amazon.com, but it doesn't have to be that simple. It is one of the things used to compute your site password.

Your settings, such as the domain name of the login page, your user name, the site password length, and whether your site password contains special characters are associated with this nickname.

### Your User Name

Your user name is the name you use to log in to the site. It is associated with the nickname for the account and is used to calculate your site password. That means you can only have a single user name for a given nickname. If you want to use different user names for the same site, follow the instructions for [Shared Machines](#shared-machines).

### Your Site Password

SitePassword combines your super password, site name, and user name to compute your password for the site. It also uses the additional settings you provide to generate a password the site will accept.

SitePassword could generate a weak site password just by chance. To let you know that has happened, it uses the same kind of strength meter to tell you how strong your site password is. The tooltip tells how long it would take a determined adversary to guess your password.

For example, if your site password is orange, then it is weak. In that case, just choose a different nickname for the account. You'll almost certainly get a strong site password.

### Provided Password Code

When the generated password can't be used, say if you've been given one that you're not allowed to change, SitePassword can remember a password you provide. It is stored in your settings encrypted with the computed password for the site as a key. That means you must fill in the form before entering your own password. After you fill in the form, click the _Provide your own site password_ check box. You can then enter your password into the site password field.

The code in the bookmark is a list of integers represnting the encrypted value the password you provided. In order to compute your site password, you must fill in the form with the same settings you used when you provided the password, including the code from the bookmark.

You won't have to type in the numbers in the code if you synchonize bookmarks to this machine. You can click on the bookmark for the domain name to open this page with the form filled in for you.

### Input Field Menus

Each of the input fields has a menu that shows up when you mouse over (or tap on a touchscreen) the 3 dots (<img src="src/3bluedots.png" style="width: 1=6px; height: 16px; vertical-align: middle;">) in the right side of the field. Each field has a particular set of menu items. If an icon is grayed out, it is not available for that field. For example, you can't forget a domain name if that field is empty.

<img src="src/help.png" style="width: 16px; height: 16px; vertical-align: middle;">   Every field has a help option, which provides a brief summary of the information contained in these Instructions.

<img src="src/forget.png" style="width: 16px; height: 16px; vertical-align: middle;">   The domain name, sitename and username fields have a Forget option. For example, if you click this icon in the site nickname field, you will be given the opportunity to permanently forget the settings for all domain names associated with that site nickname.

<img src="src/clipboard.png" style="width: 16px; height: 16px; vertical-align: middle;">   The user name and site password fields have a Copy option, which copies the contents of the field to the clipboard.

<img src="src/show.png" style="width: 16px; height: 16px; vertical-align: middle;">   <img src="src/hide.png" style="width: 16px; height: 16px; vertical-align: middle;">   The super and site password fields give you the option of showing or hiding the contents of the field. By default, your super password is hidden, and your site password is not. You can change the default behavior of the site password field by clicking the _Hide site password by default_ option in the settings panel.

### Finding an Acceptable Password

Some web sites have strict password rules, how long it must be, if it must contain upper case or lower case letters, numbers, or special characters, including restrictions on which special characters are allowed. If you run into a site that doesn't accept the calculated password, change the appropriate menu entries. SitePassword was tested on hundreds of web sites to make sure it can almost always compute a valid password.

You can also change the default values that SitePassword uses. For example, SitePassword defaults to a password with no special characters. You can change these defaults by clicking the _Save as default_ option in the settings panel.

### Changing a SitePassword

Some sites make you change your password periodically. SitePassword makes that easy. Just change your nickname for the account. For example, if your current nickname is _MyBank1_, and they make you change your password, you could change the nickname to _MyBank2_. Your new site password will be completely different from the old one.

### Phishing

SitePassword includes an antiphishing feature. If you try to use the nickname of an account that you previously had clicked _Remember_ for another domain name, you will get a big, scary warning. It's telling you that you may be at a site spoofing the one you think you are at.

Unfortunately, you will also see this warning when you are not being tricked. Many websites have several different login pages with different domain names. So, when you see the warning, check the URL of the page to make sure it's a login page for the account you think it is.

### Shared Machines

Many households have one machine shared by everybody. It's likely that everyone uses the same user name and password for certain accounts, such as streaming services. It's also likely that those people use their individual user names and passwords for other accounts, such as social media.

SitePassword accomodates those uses with a feature provided by your browser called _profiles_. Simply create one profile for the shared account and one for each individual.

### The Extension and this Page

The SitePassword extension plays well with this page. In particular, the extension uses bookmarks to synchronize your settings across machines. Pasting the appropriate bookmark into the bookmark field on this page fills in the form for you. You can also click on the bookmark to open this page with the form filled in for you.

If the domain name of the URL you pasted does not match that of the bookmark you selected, you'll get a phishing warning. It's telling you that you may be at a site spoofing the one you think you are at.

### Use with Apps

You can calculate your password without providing a domain name, say to get the password for an app on your mobile device, but you won't be able to remember the settings until you provide a domain name. You can just make one up, _e.g., https://MyApp.com_, which you'll use the next time you need the password for that app.

### Downloading Your Settings

There is a _Download local data_ button at the bottom of the page. That button lets you save your settings in a file you can reference if you're at a machine that doesn't have your SitePassword settings. **Only settings for accounts you've chosen to remember on this machine will be included.**

### Exporting Your Passwords

There may come a time when you want to use a different password manager. In that case you can use the _Export passwords_ button at the bottom of the popup window. Clicking this button creates a file with the passwords for sites you remembered on this machine. You can see a readable form of the data in the file by opening it in a spreadsheet.

**Be very careful with this file.** Completely delete it from your machine, including emptying the trash, after you use it. If you don't, anyone who gets access to your machine can get your passwords.

### Source Code

If you are worried that SitePassword might go away, you can download the source code for the extension from the [SitePassword](https://github.com/alanhkarp/SitePassword) project and that of this page from the [SitePasswordWeb](https://github.com/alanhkarp/SitePasswordWeb) project. (For historical reasons, these are separate projects with a lot of duplicated code.)

### Voluntary Payment

If you like SitePassword, please make a contribution to the [Nancy Lee Hurtt '70 Maryland Promise Scholarship](https://giving.umd.edu/giving/fund.php?name=nancy-lee-hurtt-70-maryland-promise-scholarship) or your favorite charity.