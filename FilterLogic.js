/**
 * Abstracted intelligent message tagger
 * Uses an Object map to define what to match and what labels to apply
 * @param {Object} MAP    Object map of the rules to match
 * @param {GmailThread} Thread    The GMailThread the message belongs to
 * @param {GmailMessage} Email    The GMailMessage under inspection
 */
function MatchFilters(MAP, Thread, Email) {
  try {
    var loopsMatched=0;
    var ruleMatched=0;
    for (i=0; i<MAP.length; i++) {
      var rule=MAP[i];
      if (rule.Label == null) {
        continue;//skip rules without labels
      }

      if (rule.From != null) {
        fromField=Email.getHeader("From");
        if (fromField.indexOf(rule.From) > -1) {
          ruleMatched++;
        }
      }
      
      if (rule.To != null) {
        toField=Email.getHeader("To");
        if (toField.indexOf(rule.To) > -1) {
          ruleMatched++;
        }
      }

      if (rule.Subject != null) {
        subjectField=Email.getSubject();
        if (subjectField.indexOf(rule.Subject) > -1) {
          ruleMatched++;
        }
      }

      if (rule.Contains != null) {
        messageBody=Email.getBody();
        if (messageBody.indexOf(Rule.Contains) > -1) {
          ruleMatched++;
        }
      }
      
      if (rule.Header != null) {
        if (rule.Match != null) {
          header = Email.getHeader(rule.Header);
          valueList = rule.Match;
          for (j=0; j<valueList.length; j++) {
            if (header.indexOf(valueList[j]) > -1 ) {
              ruleMatched++;
            }
          }//end of j-loop
        }
      }

      if (ruleMatched > 0) {
        Thread.addLabel(_getLabel(rule.Label));
        if (rule.Archive) { 
          Thread.moveToArchive();
        }
        if (rule.Important) {
          Thread.markImportant();
        }
        if (rule.MarkRead) {
          Thread.markRead();
        }
        if (rule.Delete) {
          Thread.moveToTrash();
        }
        if (rule.Star) {
          Email.star();
        }
        if (SHOULD_APPLY_RETENTION) {
          if (rule.Retention != null) {
            Thread.addLabel(_getLabel(RETENTION_PARENT_LABEL+rule.Retention));
          }
          if (rule.Retention == "0") {
            Thread._removeRetentionLabels();
          }
        }
        if (SHOULD_APPLY_ATTENTION) {
          if (rule.Attention != null) {
            Thread.addLabel(_getLabel(ATTENTION_PARENT_LABEL+rule.Attention));
          }
          if (rule.Retention == "0") {
            Thread._removeAttentionLabels();
          }
        }
        if (ruleMatched > 0) {
          loopsMatched++;
          ruleMatched=0;
        }
      }
    } //end of i-loop (list of filter rules)

    if (loopsMatched > 0) {
      return true;
    } else { //no rules matched
      return false;
    }
  
  } catch (e) {
    console.error("MessageFilters", e);
    console.error("subject: "+Email.getSubject());
    Thread.addLabel(PrX);
    return false;
  }

}

/**
 * Automagically creates and assigns the appropriate label for a mailing list
 * @param {GMailThread} Thread  GMailThread the message resides in
 * @param {GMailMessage} Email  GMailMessage object
 */
function MatchMailingLists(Thread, Email) {
  try {
    if (Email.getHeader("List-Id") != "") {
      // creating the labels when needed
      var header=Email.getHeader("List-Id");
      if (header == "null") {//yes in quotes, it's text
        //found an email that puked the filter because of this
        destination=MAILING_LIST_PARENT_LABEL+"?"
      } else {
        // strip away the mailing list identity
        var start=header.indexOf("<");
        var end=header.indexOf(">",start);
        var list=header.substr(start+1, end-start-1);
        
        internal=list.indexOf(".redhat.com");
        if (internal > -1) {
          list=list.substr(0,internal);
        }
        while (list.indexOf("-") > -1) {
          list=list.replace("-","_");
          //not entirely sure why this x.replace comand doesn't replace all occurances, docs say it should
        }
        var destination=MAILING_LIST_PARENT_LABEL + list
      }

      listLabel=_getLabel(destination);
      Thread.addLabel(listLabel);

      Thread.addLabel(_getLabel(MAILING_LIST_PARENT_LABEL.slice(0, (MAILING_LIST_PARENT_LABEL.length-1))));
      if (SHOULD_APPLY_RETENTION) {
        Thread.addLabel(_getLabel(MAILING_LIST_RETENTION_LABEL));
      }
      if (SHOULD_ARCHIVE_MAILING_LISTS) {
        Thread.moveToArchive();
      }
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error("MatchMailingLists exception", e);
    console.error("subject: "+Email.getSubject());
    Thread.addLabel(PrX);
    return false;
  }
}




/**
 * Renames hard-to-understand or meaningless tags
 * @param {Object}  MAP
 * @param {GMailThread} Thread 
 * @param {GMailMessage} Email 
 */
function RenameTags(MAP, Thread, Email) {
  ruleMatched = 0;
  try {
    labelList = Thread.getLabels();
    // get a list of labels the thread has
    if (labelList.length > 0) {
      for (i=0; i<labelList.length; i++)
      {
        label = labelList[i];
        //iterate through hem one at a time
        for (j=0; j<MAP.length; j++) {
          //check each message against the rules in the map
          rule=MAP[j];
          loopsMatched=0;
          if (rule.OldLabel == label.getName()) {
            if (rule.NewLabel != null) {
              console.log("renaming "+rule.OldLabel+" to "+rule.NewLabel)
              Thread.removeLabel(label);
              Thread.addLabel(_getLabel(rule.NewLabel));
              ruleMatched++;
            }//set new rule
            //don't want the old one hanging around for no reason
            if (!SHOULD_PRUNE_LABELS) {
              //unless prune labels will get them tonight
              oldLabelThreadsFound = label.getThreads();
              if (oldLabelThreadsFound == 0) {
                console.log("erasing empty label "+label.getName());
                //it's a good day to die
                label.deleteLabel();
                continue;
              }
            }
            continue;
          }//matched rule
        }//iterate 
      }//iterate thread
    }//labels > 0
  } catch (e) {
    console.error("RenameTags exception",e);
    console.error("subject: "+Email.getSubject());
    Thread.addLabel(PrX);
    return false;
  }
}