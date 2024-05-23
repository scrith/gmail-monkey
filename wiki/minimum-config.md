**Note:** *Before you begin configuring you will need to complete the [Project Installation](installation.md) steps.*

## Getting Comfortable
For the first setup until you become comfortable with the way the script works, it is best to start with just processing mailing lists. This keeps your `MyFilters.js` simple and will possibly remove the biggest annoyance with mentally parsing your inbox and/or setting up rule after rule. Here is how you do that.

Open your `MyFilters.js` file. By default nothing is enabled.  The instructions in this wiki will assume you are working locally and using `$ clasp push` to update the files in your running project. This is **recommended** because the push will do a basic syntax check for you prior to actually sending the files up.

Find the `VARIABLES` section and choose the value for `MAILING_LIST_PARENT_LABEL` then flip `SHOULD_PROCESS_MAILING_LISTS` from `false` to `true`. It should look something like this:

~~~
// +================================================+
// [                 VARIABLES                      ]
// +------------------------------------------------+

...snip...

SHOULD_PROCESS_MAILING_LISTS = true;
SHOULD_ARCHIVE_MAILING_LISTS = false;
MAILING_LIST_PARENT_LABEL = "lists/";

...snip...

// +------------------------------------------------+
// [             end VARIABLES end                  ]
// +================================================+
~~~

Obviously you are free to choose whatever parent label you desire. However, the default parents are all single characters. This was done intentionally to distinguish labels created by the script vs labels created by you as the user.

From the your console run `clasp push` and observe the output.
~~~
[user@host]$ clasp push
Detected filePushOrder setting. Pushing these files first:
└─ MyFilters.js
└─ HelperFunctions.js
└─ FilterLogic,js
└─ NightlyPolicy.js
└─ MAIN.js

└─ MyFilters.js
└─ HelperFunctions.js
└─ NightlyPolicy.js
└─ MAIN.js
└─ appsscript.json
└─ FilterLogic.js
Pushed 6 files.

~~~

## Exert Control

After updating and saving the MyFilters.gs file click to open the MAIN.gs file. From the dropdown in the toolbar select the `processInbox` function then click the triangular 'play' button. A toast message will show at the top of the browser window. As long as it does not turn red and display an error then things are proceeding normally.

If you didn't get an error, then you can watch the progress of the script and see if it has encountered any exceptions which it has handled internally.  The easiest way to watch the progress of the script is to click on the 'triggers' icon next to the play button, it looks like a pointed clock. This will open a new window with a list of the current project triggers. On the left side there is an Executions section and clicking on it will allow you to see the output of the script as it processes your emails over the past 3 days. Watch it go and you should see mailing list labels getting automatically created as it works.

**If you get an exception** share your project with me, and open a ticket with the function you are running, the exception you are getting, where the exception shows up, and the exact text of it. I'll have a look.

## Next Steps
Follow along with [Guided Rules](guided-rules.md) to start writing your own filters.