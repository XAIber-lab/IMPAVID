"""
This function returns the only activity name from alignment format
@param activity="[S/M/L]activity_name"
"""
def extractActivtyName(activity):
    return activity.split("]")[1]

"""
This function converts the trace alignent from string to list
"""
def convertTraceList(traceString):
    return traceString.split(";")[:-1]

"""
This function calculates the number of events of the log from the
alignment
"""
def countEvents(traceList):
    return len([ x for x in traceList if "M" not in x ])

"""
This function adds the keys of non-existend activity to uniform data structure
"""
def addAllActivities(traceDict):
    if "N" not in traceDict.keys():
        traceDict["N"] = 0
    if "A" not in traceDict.keys():
        traceDict["A"] = 0
    if "W" not in traceDict.keys():
        traceDict["W"] = 0
    if "R" not in traceDict.keys():
        traceDict["R"] = 0
    if "C" not in traceDict.keys():
        traceDict["C"] = 0
    return traceDict