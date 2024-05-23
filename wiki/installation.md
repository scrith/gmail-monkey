## Step 0 - Prerequisites

This project uses the following elements:

- Google App Script (GAS) system - Which has full access to email headers

- Node.js - you must install from the correct source.

    ```
    $ sudo yum install https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y
    $ sudo yum install nodejs -y --setopt=nodesource-nodejs.module_hotfixes=1
    ```
    
    - The official documentation here: [https://github.com/nodesource/distributions](https://github.com/nodesource/distributions)

- A Google tool called `clasp`

    ~~~ 
    $ sudo npm install @google/clasp -g
    ~~~

    - The offical guide is here [https://developers.google.com/apps-script/guides/clasp]
    - The source code is here [https://github.com/google/clasp]

- `git` - I will not explain this to you.

- enable app scripts API  at https://script.google.com/home/usersettings

- [Generate an SSH key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)

- [Add the key to your github profile](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account)

## Step 1 - Clone the Souce

Prepare the auth token for clasp and clone the git project.

~~~ 
$ mkdir Gmail-Monkey
$ clasp login
// this will kick off a process to get your auth token
// you will use your 'username@redhat.com' gmail account
$ cd Gmail-Monkey
// clone this repo into your project
$ git clone git@github.com:scrith-futures/gmail-monkey.git .
~~~

## Step 2 - Create the GAS Project

Create an empty project in your GAS system. In this example we'll use "Gmail Monkey".

~~~
// create your Script project
$ clasp create --title "Gmail Monkey" --type standalone --rootDir .
~~~

## Step 3 - File Upload Order

**THIS IS VERY IMPORTANT TO DO BEFORE CONTINUING**

Do **not** skip this step!

Modify your `.clasp.json` file to specify the order of upload. *If you do not do this your script will error out with reference exceptions*

Open your .clasp.json file and copy the value of `scriptId`, it will be a long mixed character value, then execute `$ mv .clasp.json .clasp.json.ignore`.

Open the `new.clasp.json` file and replace `YOUR_SCRIPT_ID_HERE` with your `scriptId` value, then execute `$ mv new.clasp.json .clasp.json`

The results should look like this:

~~~
$ cat .clasp.json.ignore
{"scriptId":"ABCabc123xyz","rootDir":"."}

$ cat .clasp.json
{"scriptId":"ABCabc123xyz",
  "rootDir":".",
  "filePushOrder": ["MyFilters.js",
    "HelperFunctions.js",
    "FilterLogic,js",
    "NightlyPolicy.js",
    "MAIN.js"]
}
~~~

## Step 4 - Local Environment

Prepare your local environment for building your filters by copying the filter template. By default all features are disabled and no automatic actions are taken upon upload so it is safe to push the contents of your new beast into GAS.

~~~
$ cp MyFilters.template MyFilters.js

// push the files up to your new GAS project
$ clasp push
~~~

## Step 5 - Permissions

Your local changes to the `.clasp.json` will overwrite the values created with the `clasp create` command and you have to verify you want to accept the changes. Choose yes.

~~~
? Manifest file has been updated. Do you want to push and overwrite? (y/N) 
~~~

Login (using the same account as above) to [https://script.google.com/u/0/home/my] and edit your Gmail Monkey project. (hover and click the pencil icon)

Select the `MAIN.gs` item at the left and in the dropdown below the toolbar choose the `Install` function. Click the play button.

GAS will prompt you to accept the permissions the script needs to operate. Review them and accept them. It may give you the scary message about being unsigned/unsafe, however you have all the source code, so you can see for yourself nothing nefarious is going on.

## Step 6

Set up your MyFilters.js file with the [Minimum Config](minimum-config.md)
