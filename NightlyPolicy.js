/**
 * Deleted any emails that match the retention policy
 * 
 * This script uses the gmail smart search "older_than"
 * It's anyone's guess who long it will remain valid though because ... Google
 * FYI: syntax -> older_than:[#][d,m,y] -- only accepts (d)ays, (m)onths, and (y)ears
 * Does return 0 results for invalid ranges, which is helpful for scripting
 * 
 * TODO: accept a list of parent lables to clean out
 * @param none
 */
function processRetentionLabels() {
  if (!SHOULD_APPLY_RETENTION) {
    console.log("Retention policy processing disabled");
    return 0;
  }
  if (_getTriggerList("processRetentionLabels").length > 0) {
    _removeHandlerTriggers("processRetentionLabels");
  }
  
  var targetlist=_getSublabels(RETENTION_PARENT_LABEL);
  
  for (i=0; i<targetlist.length; i++) {
    // strip away the parent label
    target=targetlist[i].getName();
    ttl=target.slice(RETENTION_PARENT_LABEL.length, target.length);
    searchPhrase="label:"+target+" older_than:"+ttl;

    try {
      //We are processing in pages of 100 messages to prevent script errors
      //large search results may throw Exceed Maximum Execution Time exception in Apps Script
      threadList=GmailApp.search(searchPhrase, 0, BATCH_SIZE);
      
      while (threadList.length > 0) {
        //delete the threads tagged and aged
        for (var j=0; j<threadList.length; j++) {
          thread=threadList[j];
          thread.moveToTrash();
        }

        //get the next results
        threadList=GmailApp.search(searchPhrase, 0, BATCH_SIZE);
      }

    } catch (e) {
      console.error("ERROR preparing message actions - ", e);
      // If the script fails for some reason or catches an exception, it will simply defer auto-purge until the next day.
      // Could add more logic here to notify the user, but that would complicate the script.
    }
  }
  if (SHOULD_PRUNE_LABELS) {
    pruneEmptyLabels();
  }
}




/**
 * Archives any emails that match the attention policy
 * 
 * This script uses the gmail smart search "older_than"
 * It's anyone's guess who long it will remain valid though because ... Google
 * FYI: syntax -> older_than:[#][d,m,y] -- only accepts (d)ays, (m)onths, and (y)ears
 * Does return 0 results for invalid ranges, which is helpful for scripting
 * 
 * TODO: accept a list of parent lables to clean out
 * @param none
 */
function processAttentionLabels() {
  if (!SHOULD_APPLY_ATTENTION) {
    return 0;
  }
  if (_getTriggerList("processAttentionLabels").length > 0) {
    _removeHandlerTriggers("processAttentionLabels");
  }
  
  var targetlist=_getSublabels(ATTENTION_PARENT_LABEL);
  
  for (i=0; i<targetlist.length; i++) {
    // strip away the parent label
    target=targetlist[i].getName();
    tta=target.slice(ATTENTION_PARENT_LABEL.length, target.length);
    searchPhrase="label:"+target+" older_than:"+tta;

    try {
      //We are processing in pages of 100 messages to prevent script errors
      //large search results may throw Exceed Maximum Execution Time exception in Apps Script
      threadList=GmailApp.search(searchPhrase, 0, BATCH_SIZE);
      
      while (threadList.length > 0) {
        //delete the threads tagged and aged
        for (var j=0; j<threadList.length; j++) {
          thread=threadList[j];
          thread.Archive();
          _removeAttentionLabels(thread)
        }

        //get the next results
        threadList=GmailApp.search(searchPhrase, 0, BATCH_SIZE);
      }

    } catch (e) {
      console.error("ERROR preparing message actions - ", e);
      // If the script fails for some reason or catches an exception, it will simply defer auto-purge until the next day.
      // Could add more logic here to notify the user, but that would complicate the script.
    }
  }
}




/**
 * Prunes sublabels which have become empty from specific parent labels
 * TODO: accept a list of parent labels to clean out
 * @param none
 */
function pruneEmptyLabels() {
  if (!SHOULD_PRUNE_LABELS) {
    //yes I know this is a double check
    return 0;
  }
  //same for each so loop the actions
  for (p=0; p<PARENT_LABELS_TO_PRUNE.length; p++) {//same thing for each one
    console.log("checking '"+PARENT_LABELS_TO_PRUNE[p]+"' children for zero threads");

    subLabelList = _getSublabels(PARENT_LABELS_TO_PRUNE[p]);
    //this returns an array of GmailLabel objects

    Logger.log(subLabelList.length+" children found")
    for (s=0; s<subLabelList.length; s++) {
      //iterate through the sublabels (if any)
      subLabel=subLabelList[s];
      threadsFound = subLabel.getThreads();
      if (threadsFound == 0) {
        Logger.log("erasing empty label "+subLabel.getName());
        //it's a good day to die
        subLabel.deleteLabel();
        continue;
      }
      Logger.log("retaining "+subLabel.getName()+" with "+threadsFound.length+" threads");
    }//for sublabel

  }//for targetlist
  
}
