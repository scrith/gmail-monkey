There is a small learning curve to writing your own filters so I've prepared this page as a primer to get you started for each of the types of filters you can create with some annotated examples.

*The design philosophy of this script is that the label is the starting point of every filter. However, it has been brought to my attention that as the flexibility of this script grows, the filters may not need to apply a label to every matching message. I'm still evaluating how this would affect the functionality of the script without messing up user's existing rules.*

# StandardMessageFilter

`StandardMessageFilters` is an array of objects that contain the key pieces of the filter. The object can have any properties, but the ones the system looks for are as follows:
* `Label` - string, this part is required and rules without it will be ignored
* `Header` - string, this defines which header the rule should pull out for testing
* `Values` - an array of strings that we want to match
* `And` - (optional) boolean, if set to true then all the header must contain all the values in the Values array
* `Archive` - (optional) boolean, will archive the email out of the inbox
* `MarkRead` - (optional) boolean, will mark as read
* `Delete` - (optional) boolean, will immediately delete the email when the rule is matched
* `Star` - (optional) boolean, will apply the default colored star
* `Important` - (optional) boolean, will tag the message thread as important
* `Retention` - (optional) string, a value in Google's "older_than" format defining the intended lifespan of the message. This will be discussed later.
* `Attention` - (optional) string, a value in Google's "older_than" format defining the intended inbox lifetime of the message. This feature has not been implemented, but will be described later.


## Building a filter

Everything starts with an empty array

~~~
StandardMessageFilters = [ ];
~~~

## Single `Value` filters

Let's say you have a client called AlphaBetaCorp and you want to filter messages for that account with a sublable "ABCorp" under the parent label "Clients". You can write two filters to accomplish this; one using the "From" header and a second using the "To" header. It would look like this: (I've spread things out for readability , but you can write the rules on single lines)

~~~
StandardMessageFilters = [
    {Label:"Clients/ABCorp",
        Header:"From",
        Values:["@alphabetacorp.com"],
        Important:true
    },
    {Label:"Clients/ABCorp",
        Header:"To",
        Values:["@alphabetacorp.com"],
    },
];
~~~

Now any message that is recieved from or sent to this customer will get labeled "Clients/ABCorp", and messages from the customer will be marked as `Important`.

## Multiple `Value` filters

Now suppose you want emails from multiple sources to both be tagged with the same label.  You do not need to write multiple rules. Simply adding additional strings to the `Values` array will achieve the same results. For example if you want to label notifications from workday and centresuite with the label "Expense&Travel" then your filter would look like this:

~~~
StandardMessageFilters = [
    {Label:"Expense&Travel",
        Header:"From",
        Values:["redhat@myworkday.com","Notifications@centresuite.com"],
        Retention:"1y"
    },
];
~~~

## Other headers

The filter is not limited to just the "From" and "To" Headers, any available header can be placed in the `Header` field. The filter below checks the "Subject" header against multiple values and adds a retention policy to the message of 1 year.

~~~
StandardMessageFilters = [
    {Label:"General/kcs",
        Header:"Subject",
        Values:["kcs","KCS"],
        Retention:"1y"
    },
];
~~~

Headers that do not exist for a given email, such as some X-Headers, being checked will simply not pass the match and the script will move on. They will not (should not) generate any exceptions.

# AutomatedMessageFilters

Automated messages are treated slightly differently from regular messages when processing the rules. And there is less options available They use a `Recipient` and a `Subject` field for filtering. It is the same as above: all rules must have a label.

*In a future release these filters may be combined with the standard filters to provide more flexibility and reduce code complexity. However, that would be a breaking change to user's rules.*

* `Label` - string
* `Recipient` - string, the value to match against a combination of the "From" and "To" headers
* `Archive` - boolean, same as standard filters
* `Retention` - string, same as standard filters

Common notifications are from JIRA, Errata, and Google calendar. These automated messages can be filtered using the example below. **Note**: the `AUTOMATED_PARENT_LABEL` exists in an array of labels that will be checked for empty children when pruning tags, if that feature is enabled. 

~~~
AutomatedMessageFilters=[
    //default retention applies if not specified
    {Label:AUTOMATED_PARENT_LABEL+"Calendar",
        Recipient:"calendar-notification@google.com",
        Retention:"5d"
    },
    {Label:AUTOMATED_PARENT_LABEL+"JIRA",
        Recipient:"issues@jboss.org"
    },
    {Label:AUTOMATED_PARENT_LABEL+"Errata",
        Recipient:"errata@redhat.com",
    },
];
~~~

This example will apply labels to each of these notifications, and in the case of calendar notifications, will also set a retention policy of 5 days.

# SalesforceMessageFilters

These filters work in the same way as the `StandardMessageFilters`, however they are only run against messages that come from the SFDC postmaster.
