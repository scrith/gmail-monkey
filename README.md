# REASONS

Gmail filtering is far too rudimentary (read:stupid) to be useful for a user who gets lots of work-related messages.

# NOTES

This project works with the updated V8 engine. Please open a bug if you encounter one. Everything this does is optional and nothing is enabled by default.

# FEATURES

This script encompasses everything that I have needed my gmail inbox to do that it is incapable. It is also a collection of filtering techniques I have learned from others.

## It _CAN_ do the following:

By default none of the features are enabled.

* Simplified header-based filtering
* Automatically organizes mailing list messages
  - *including dynamically creating labels for lists you didn't know you were on*
* Applies and enforces a dynamic email attention and retention system
  - Removes empty tags from:
    - any defined parent label you choose
* Attempts full error tolerance, applying a special tag to messages that generate exceptions
  - boosts rescheduling time when detecting ratelimit is exceeded
  - *I did my best*
* Renames troublesome tags (like google alerts) to more logial ones.

# USAGE

Clone this project then Rename MyFilters.template to MyFilters.js

Install it to your GAS. Run the 'Install' function and accept the permissions.

Everything necessary for setup will done for you. The Gmail Monkey will schedule itself to run at intervals. By default the inbox process kicks off every 5 minutes, and the attention/retention process is nightly. Only the features you have enabled will process though.

Additional instructions are found in the [wiki](/wiki/home.md)
