/**
 * Returns a Label object specified by the name.
 * Creates a new one if label does not already exist
 * handles creating parent trees for nested labels
 * @param {String} LabelName 
 */
function _getLabel(LabelName) {
  try {
    //check here for existing label, nothing needed if it exists already
    //Logger.log("_getLabel input: "+LabelName);
    var label=null;
    label=GmailApp.getUserLabelByName(LabelName);
    if (label != null) {
      //the label already exists
      return label;

    } else {
      //otherwise the label doesn't exist
      //trim (if any) first and last '/'
      if (LabelName.indexOf('/') == (LabelName.length-1)) {
        Logger.log("last char is /");
        LabelName = LabelName.substr(0,LabelName.length-1);
        Logger.log("New LabelName = "+LabelName);
      }
      if ((LabelName.indexOf('/') == 0) && LabelName.length>1) {
        LabelName = LabelName.substr(1,LabelName.length+1)
        Logger.log("New LabelName = "+LabelName);
      }
      if (LabelName.split('/').length == 1) {
        //label is a dired list
        //Logger.log("non-dired label");
        console.info("creating single label:"+LabelName);
        label=GmailApp.createLabel(LabelName);
        //create the single label
        return label;
        //return it

      } else {
        //the label is a dired list
        //Logger.log("dired label");

        var leafParent="";
        //start with an empty parent label
        var leafNameList = LabelName.split('/');
        //split on label separators to make array for looping
        //now we have an individual entry in the array

        diredLevels=leafNameList.length;
        //Logger.log("diredLevels:"+diredLevels);

        // EACH DIRED LEVEL
        for (i=0; i<diredLevels; i++) {
          //loop through each level of the list
          //the first entry is the top level label in the tree

          var leafName=leafNameList[i];
          //Logger.log("level "+i+" leafName:"+leafName);

          if ( ((leafName.length == 0)&&(i==0)) ||
               ((leafName.length == 0)&&(i==diredLevels)) ) {
            //Logger.log("ignoring blank first/last leaf");
            //ignore blank first and last entry
            continue;
          }

          //so at this point the leafName is nonzero length and needs to be validated
          leafName=leafParent+leafName;
          //concatenate with the parent leaf because of the way labels are created
          //Logger.log("new leafName set: "+leafName);

          //check to see if this leaf already exists
          label=null;
          //Logger.log("_getLabel getting leafName:"+leafName);
          label=GmailApp.getUserLabelByName(leafName);

          if (label != null) {
            //if the leaf already exists try the next level
            //Logger.log(leafName+" found!");

            //Logger.log("leafParent Set: "+leafParent);
  
          } else {
            //this leaf does not exist
            //Logger.log(leafName+" does not exist");

            console.info("creating label:"+leafName);
            label=GmailApp.createLabel(leafName);
            //if the array is longer then we need to create each level in the tree
          }
          leafParent=leafName+'/';
          //blank entries are skipped so if this leaf is the final one, so the trailing slash is okay

        }//dired loop

        //last command before breaking the loop is setting the 'label' variable
        //Logger.log("input LabelName:"+LabelName);
        //Logger.log("label object returned:"+label.getName());
        //after creating all the branches of the tree we can pull the correct GMailLabel object matching the input value 
        return label;

      }//if-else dired

    }//if-else null label

  } catch (e) {
    console.error("_getLabel("+LabelName+") Exception", e);
    throw(e);
  }
}//*/


/**
 * Returns an array of GmailLabels applied to a specific thread
 * @param {GmailThread} Thread    The GmailThread under inspectoin
 * @returns {GmailLabel} An array of labels found, otherwise false
 */
function _getThreadLabels(Thread) {
  try {
    labelList = Thread.getLabels();
    if (labelList != null) {
      return labelList;
    } else {
      return false;
    }
  } catch (e) {
    console.error("_getMessageLabels Exception", e);
    console.error("subject: "+Email.getSubject());
    Thread.addLabel(PrX);
    return false;
  }
}//*/



/**
 * Returns an array of GMailLabel objects filed under 'ParentName' label
 * @param {string} ParentName 
 */
function _getSublabels(ParentName) {
  try {
    var name=ParentName;
    return GmailApp.getUserLabels().filter(function(label) {
      return label.getName().slice(0, name.length) == name;
    });
  } catch (e) {
    throw(e);
  }
}





/**
 * deletes all labels applied to a Thread
 * @param {GMailThread} Thread 
 */
function _removeAllLabels(Thread) {
  labelList=Thread.getLabels();
  for (i=0; i<labelList.length; i++) {
    Thread.removeLabel(labelList[i]);
  }
}




/**
 * deletes any retention policies applied to an email thread
 * @param {GmailThread} Thread  
 */
function _removeRetentionLabels(Thread) {
  labelList=Thread.getLabels();
  for (i=0; i<labelList.length; i++) {
    label=labelList[i];
    labelName=label.getName();
    if (labelName.slice(0,RETENTION_PARENT_LABEL.length) == RETENTION_PARENT_LABEL.slice(0,RETENTION_PARENT_LABEL.length)){
      Thread.removeLabel(label);
    }
  }
}




/**
 * deletes any attention policies applied to an email thread
 * @param {GmailThread} Thread  
 */
function _removeAttentionLabels(Thread) {
  labelList=Thread.getLabels();
  for (i=0; i<labelList.length; i++) {
    label=labelList[i];
    labelName=label.getName();
    if (labelName.slice(0,ATTENTION_PARENT_LABEL.length) == ATTENTION_PARENT_LABEL.slice(0,ATTENTION_PARENT_LABEL.length)){
      Thread.removeLabel(label);
    }
  }
}




/**
 * Deletes all filters associated with the entire project
 * @param none
 */
function _removeAllTriggers() {
  var triggers=ScriptApp.getProjectTriggers();
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}




/**
 * Removes triggers from a specific function
 * @param {String} HandlerFunction The name of the function
 */
function _removeHandlerTriggers(HandlerFunction) {
  var triggers=_getTriggerList(HandlerFunction);
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}




/**
 * Collects the triggers 
 * @param {String} HandlerFunction The name of the function
 * @returns   ScriptApp.Trigger array
 */
function _getTriggerList(HandlerFunction) {
  return ScriptApp.getProjectTriggers().filter(function(trigger) {
    return trigger.getHandlerFunction() == HandlerFunction;
  });
}




/**
 * Creates a trigger to run the [HandlerFunction] every [Interval] days
 * @param {String} HandlerFunction The name of the function
 * @param {int} Interval The frequency of the schedule
 */
function _setDailyTrigger(HandlerFunction,Interval) {
  ScriptApp.newTrigger(HandlerFunction)
  .timeBased().everyDays(Interval).create();
}




/**
 * Creates a trigger to run the [HandlerFunction] every [Interval] hours
 * @param {String} HandlerFunction The name of the function
 * @param {int} Interval The frequency of the schedule
 */
function _setHourlyTrigger(HandlerFunction,Interval) {
  ScriptApp.newTrigger(HandlerFunction)
  .timeBased().everyHour(Interval).create();
}




/**
 * Creates a trigger to run the [HandlerFunction] every [Interval] minutes
 * valid [Interval] values are 1,5,10,15,30
 * @param {String} HandlerFunction The name of the function
 * @param {int} Interval The frequency of the schedule
 */
function _setMinutelyTrigger(HandlerFunction,Interval) {
  ScriptApp.newTrigger(HandlerFunction)
  .timeBased().everyMinutes(Interval).create();
}




/**
 * Creates a trigger to run the [HandlerFunction] in [Delay] seconds from now
 * @param {String} HandlerFunction The name of the function
 * @param {int} Delay The frequency of the schedule
 */
function _setDelayTrigger(HandlerFunction,Delay) {
  ScriptApp.newTrigger(HandlerFunction)
  .timeBased().after(1000*Delay).create();
}
