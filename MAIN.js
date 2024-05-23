/**
 * All Filter criteria found in the MyFilters file
 */
setVariables();


/**
 * Creates all needed triggers for scheduled runs
 * Also runs both processes (inbox & retention)
 */
function Install() {
  _removeAllTriggers();
  
  if (SHOULD_APPLY_RETENTION || SHOULD_APPLY_ATTENTION) {
    _setDailyTrigger("NightlyPolicies",1);
    //purge 'expired' emails nightly
  }

  // 0 disables the main schedule (useful for massive email set, see note in MyFilters.js)
  if (INBOX_PROCESS_INTERVAL > 0) {
    _setMinutelyTrigger("ContinuousInboxProcess",INBOX_PROCESS_INTERVAL);
  }
}
/**
 * Removes all triggers
 * Thus uninstalling it by preventing it from running
 */
function Uninstall() {
  _removeAllTriggers();
}



/**
 * The main function of the Filterbeast
 * Calls the individual filtering functions in order
 * @param none
 */
function processInbox() {
  /**
   * if we hit a rate limit, it will die somewhere else in this script
   * the ContinuousInboxWrapper will still be running
   * so this is where we can catch it 
   * process at time T, error
   * process at time T, caught
   * process at time 10T, success hopefully
   * process at time T
   * 
  */
  try {
    //do these once to minimize GmailApp calls
    PrM=_getLabel(PROCESSED_MATCHED_LABEL);
    PrU=_getLabel(PROCESSED_UNMATCHED_LABEL);
    PrX=_getLabel(PROCESSED_FAILED_LABEL);

    // process all sleeping emails in the inbox
    var threadlist=GmailApp.search(SEARCH_QUERY, 0, BATCH_SIZE);
  } catch (e) {
    console.error(e);
    var nextRunInterval=RESCHEDULE_DELAY*60*2;
    if (e.message.indexOf("Service invoked too many times for one day: gmail.")!= -1) {
      //need to get rid of these because we'll keep hitting the limit.
      _removeHandlerTriggers("processInbox")
      //set next run to be 10x the interval to hopefully allow for catchup
      console.log("Encountered ratelimit exception");
      console.log("next run "+(nextRunInterval/60)+" minutes from now");
      //have to use the delay trigger for a precise amount of time
      _setDelayTrigger("processInbox", nextRunInterval);
    }
    return;
  }

  var totalThreads=threadlist.length;
  needToProcessAgain=(totalThreads == BATCH_SIZE); //set the flag as needed

  console.info("Processing "+totalThreads+" threads");
  try {
    var messagesProcessed=0;
    var messagesTouched=0;
    var rulesMatched=0;
    for (var i=0; i<threadlist.length; i++) {
      var thread=threadlist[i];
      //thread is a GMailThread object
      //it is needed for labelling
      var convo=thread.getMessages();
      //for looping we need an array of the individual messages

      rulesMatched=0;

      for (var j=0; j<convo.length; j++) {  
        messagesTouched++;
        var email=convo[j];
        //so they can be processed one at a time

        if (email.isInChats()) {
          if (SHOULD_PROCESS_CHATS) {
            //chats are weird and break everything else
          thread.addLabel(_getLabel(CHAT_LABEL));
          Logger.log("[Chat]='"+subject.substring(0,15)+"...'");
          if (SHOULD_APPLY_RETENTION) {
            thread.addLabel(_getLabel(RETENTION_PARENT_LABEL+"1d"));
          }
            thread.moveToArchive();
            thread.addLabel(PrM);
            messagesProcessed++;
          }
          continue;
          //nexxxt!
        }

        if ( MatchFilters(MessageFilters, thread, email) ) {
          rulesMatched++;
        }

        if ( SHOULD_UNIMPORTANT_LABELS ) {
          thread.markUnimportant();
        }
        
        if (SHOULD_PROCESS_MAILING_LISTS) {
          if ( MatchMailingLists(thread, email) ) {
            rulesMatched++;
          }
        }

        if (SHOULD_RENAME_TAGS) {
          if ( RenameTags(TagsToRename, thread, email) ) {
            rulesMatched++;
          }
        }
        //proceeding to next message in thread[i]
      }//bottom of for-j (messages)
      //done with all individual messages in a thread

      if (rulesMatched > 0) {
        messagesProcessed++;
        thread.addLabel(PrM);
      } else {
        //if no existing rules match then move the message to a new label for inspection
        thread.addLabel(PrU);
      }

      percent=(100 * ( (i+1) / totalThreads) );
      console.log(percent.toFixed(1)+"%");
      //proceeeding to next thread
    }//bottom of for-i (threads)
  } catch (e) {
    console.error("Exception caught processing message "+subject, e);
    console.error("subject: "+Email.getSubject());
    Thread.addLabel(PrX);
    Thread.addLabel(PrU);
  } finally {
    console.log("Processed "+messagesProcessed+" of "+messagesTouched+" messages in "+totalThreads+" threads");

    if (_getTriggerList("processInbox").length > 0) {
      console.log("removing old schedules");
      _removeHandlerTriggers("processInbox");
    }
    if (needToProcessAgain) {
      console.log("Scheduling second pass");
      _setDelayTrigger("processInbox", RESCHEDULE_DELAY);
    }
    //TODO: think about adding an else clause that sets the interval schedule for the next "first" pass
    return;
  }
}//processInbox




/**
 * Wrapper
 * Separates the schedule from the process
 * The process may reschedule itself if the result set is too large
 * The trigger for kicking off each run remains the same.
 */
function ContinuousInboxProcess() {
  if (_getTriggerList("processInbox").length > 0) {
    //don't run if there are still existing processInbox schedules running
    console.info("Skipping, multipass schedule still running.")
    return;
  }
  
  if (_getTriggerList("ContinuousInboxProcess").length == 0) {
    _setMinutelyTrigger("ContinuousInboxProcess",INBOX_PROCESS_INTERVAL);
  }
  processInbox();
}  





/**
 * Wrapper
 * The process may reschedule itself if the result set is too large
 * The trigger for kicking off each run remains the same.
 */
function NightlyPolicies() {
  if (_getTriggerList("NightlyPolicies").length == 0) {
    _setDailyTrigger("NightlyPolicies",1);
  } else {
    // the only way to verify the correct schedule is to delete the triggers and start again
    _removeHandlerTriggers("NightlyPolicies");
    _setDailyTrigger("NightlyPolicies",1);
  }
  processRetentionLabels();
  processAttentionLabels();
}
