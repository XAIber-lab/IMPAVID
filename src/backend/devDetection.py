import utilsPM as upm

# List of activities in the exact order to check mismatch deviations
orderedActivities = ["N", "A", "R", "C"]

"""
Check if any of the activity is missing in the process, returning a dictionary
of the missing activities.
@param trace = ["[L/M/S]activity"]
@return dict = {"activity_1": 1/0} 1 if missing, 0 otherwise
"""
def detectMissing(trace):
    resDict = {}
    for activity in trace:
        activityName = upm.extractActivtyName(activity)
        if activityName not in resDict.keys():
            resDict[activityName] = 0

        if "M" in activity:
            resDict[activityName] = 1
    return resDict

"""
Check how many times acivities are repeated, returning a dict of the repeated activities
@param trace = ["[L/M/S]activity"]
@return dict = {"activity_1": int}
"""
def detectMutliple(trace):
    resDict = {}
    for activity in trace:
        activityName = upm.extractActivtyName(activity)
        if activityName not in resDict.keys():
            resDict[activityName] = 0
        if "L" in activity:
            resDict[activityName] += 1
    return resDict

"""
Check how many times an activity is mismatched, returning a dict of mismatched activities
@param trace = ["[L/M/S]activity"]
@return dict = {"activity_1": int}
"""
def detectMismatch(trace):
    resDict = {}
    nextActivities = []
    for elem in trace:
        nextActivities.append(upm.extractActivtyName(elem))

    for activity in trace:
        nextActivities.pop(0)
        activityName = upm.extractActivtyName(activity)
        if activityName not in resDict.keys():
            resDict[activityName] = 0

        if activityName == "C" and ("N" in nextActivities or "A" in nextActivities or "W" in nextActivities or "R" in nextActivities):
            resDict[activityName] += 1
        elif activityName == "R" and ("N" in nextActivities or "A" in nextActivities or "W" in nextActivities):
            resDict[activityName] += 1
        elif (activityName == "A" or activityName == "W") and ("N" in nextActivities):
            resDict[activityName] += 1

    return resDict