import procMining as pm
import incidentData as id
import json
import csv
import pandas as pd

import eel
eel.init("./frontend")

fileLog = "data/dummy_log.csv"
fileModel = "data/base_model.pnml"
csv_file = "data/simpleTraces.csv"

dictAlfaMiss = {"N":0.25,"A":0.25, "W":0, "R":0.25,"C":0.25}
Tmiss = 1
dictAlfaMult = {"N":0.25,"A":0.25,"W":0.2,"R":0.2,"C":0.1}
Tmult = 10
dictAlfaMismatch = {"N":0.35,"A":0.35,"W":0.1,"R":0.1,"C":0.1}
Tmism = 4
dictAlfaCost = {"miss":0.33,"rep":0.34,"mism":0.33}

def convertSeverityToLabel(sev):
    if sev == '1 - Critical' or sev == "critical":
        return 4
    elif sev == '2 - High' or sev == "high":
        return 3
    elif sev == '3 - Moderate' or sev == "medium":
        return 2
    elif sev == '4 - Low' or sev == "low" or sev == "none":
        return 1
    else:
        return 1
    
from sklearn.metrics import precision_recall_fscore_support as score
@eel.expose
def calculateParamCosts(params):
    missDict = params["missing"]
    repDict = params["repetition"]
    mismDict = params["mismatch"]
    wDict = params["weights"]
    predicted = []
    actual = []

    incidents = id.formatIncidents(fileLog)
    # print(incidents)
    for elem in incidents:
            actual.append({"incident_id": elem["incident_id"], "severity": elem["priority"]})

    # with open(fileLog, "r") as flog:
    #     readerLog = csv.DictReader(flog, delimiter=";")
    #     rows = list(readerLog)
    #     for elem in rows:
    #         actual.append({"incident_id": elem["incident_id"], "severity": elem["priority"]})

    with open(csv_file, "r") as f:
        reader = csv.DictReader(f)
        traces = list(reader)
        devs = pm.compute_deviations(traces, missDict, Tmiss, repDict, Tmult, mismDict, Tmism, wDict, False)
        for inc in devs.keys():
            predicted.append({"incident_id": inc, "severity": devs[inc]["severity"]})
        # return pm.compute_deviations(traces, missDict, Tmiss, repDict, Tmult, mismDict, Tmism, wDict, False)

    predicted = sorted(predicted, key=lambda d: d['incident_id'])
    actual = sorted(actual, key=lambda d: d['incident_id'])
    labelPredicted = []
    labelActual = []
    for i in range(0,len(predicted)):
        labelPredicted.append(convertSeverityToLabel(predicted[i]["severity"]))
        labelActual.append(convertSeverityToLabel(actual[i]["severity"]))

    # predicted = [0, 1, 1, 2, 3] 
    # y_test = [0, 3, 3, 0, 0]
    precision, recall, fscore, support = score(labelActual, labelPredicted)
    return {"precision": list(precision), "recall": list(recall)}

eel.paramsCosts()(calculateParamCosts)

@eel.expose
def calculateNewCost(params):
    missDict = params["missing"]
    repDict = params["repetition"]
    mismDict = params["mismatch"]
    wDict = params["weights"]
    with open(csv_file, "r") as f:
        reader = csv.DictReader(f)
        traces = list(reader)
        devs = pm.compute_deviations(traces, missDict, Tmiss, repDict, Tmult, mismDict, Tmism, wDict, False)
        incidents = sorted(id.formatIncidents(fileLog), key=lambda d: d['incident_id'])

        res = []
        for inc in devs.keys():
            i=0
            for incident in inc.split(";"):
                res.append({"incident_id": incident,
                # "alignment": devs[inc]["alignment"],
                # 'fitness': devs[inc]['fitness'],
                'missing': devs[inc]['missing'],
                'repetition': devs[inc]['repetition'],
                'mismatch': devs[inc]['mismatch'],
                'totMissing': devs[inc]['totMissing'],
                'totRepetition': devs[inc]['totRepetition'],
                'totMismatch': devs[inc]['totMismatch'],
                'costMissing': devs[inc]['costMissing'],
                'costRepetition': devs[inc]['costRepetition'],
                'costMismatch': devs[inc]['costMismatch'],
                'costTotal': devs[inc]['costTotal'],
                'severity': devs[inc]['severity'],

                # "impact": incidents[i]["impact"],
                # "urgency": incidents[i]["urgency"],
                # "priority": incidents[i]["priority"],
                # "category": incidents[i]["category"],
                # "openTs": incidents[i]["openTs"],
                # "closeTs": incidents[i]["closeTs"],
                # "reassignment": incidents[i]["reassignment"],
                # "reopen": incidents[i]["reopen"],
                # "updates": incidents[i]["updates"]
                })
                i+=1
    return res


eel.recalculateDate()(calculateNewCost)

@eel.expose
def rangeParams():
    # df = pd.read_csv('data/groundTruthWeights.csv')
    # ranges = df.agg(["mean", "std"])
    # return ranges.to_dict('dict')
    df = pd.read_csv('data/groundTruthWeights.csv')

    critical = pd.concat([df.loc[df['priority'] == "1 - Critical"], df.loc[df['priority'] == "2 - High"]])
    medium = df.loc[df['priority'] == "3 - Moderate"]
    low = df.loc[df['priority'] == "4 - Low"]

    rCrit = critical.agg(["mean", "std"])
    rMed = medium.agg(["mean", "std"])
    rLow = low.agg(["mean", "std"])

    return {"critical":rCrit.to_dict("dict"), "medium": rMed.to_dict("dict"), "low":rLow.to_dict("dict")}

@eel.expose
def processData():
    # aligns = pm.compute_trace_alignment(fileLog,fileModel)
    # alignments = pm.compute_deviations(aligns, dictAlfaMiss, Tmiss, dictAlfaMult, Tmult, dictAlfaMismatch, Tmism, dictAlfaCost, True)

    # incidents = id.formatIncidents(fileLog)

    # return [json.dumps(alignments), json.dumps(incidents)]
    print("Started")
eel.start('index.html', mode='edge')

# if __name__ == "__main__":
#     aligns = pm.compute_trace_alignment(fileLog,fileModel)
#     alignments = pm.compute_deviations(aligns, dictAlfaMiss, Tmiss, dictAlfaMult, Tmult, dictAlfaMismatch, Tmism, dictAlfaCost, True)

#     res = []
#     for incident in alignments.keys():
#         res.append({"incident_id": incident,
#         "alignment": alignments[incident]["alignment"],
#         'fitness': alignments[incident]['fitness'],
#         'missing': alignments[incident]['missing'],
#         'repetition': alignments[incident]['repetition'],
#         'mismatch': alignments[incident]['mismatch'],
#         'totMissing': alignments[incident]['totMissing'],
#         'totRepetition': alignments[incident]['totRepetition'],
#         'totMismatch': alignments[incident]['totMismatch'],
#         'costMissing': alignments[incident]['costMissing'],
#         'costRepetition': alignments[incident]['costRepetition'],
#         'costMismatch': alignments[incident]['costMismatch'],
#         'costTotal': alignments[incident]['costTotal'],
#         'severity': alignments[incident]['severity']
#         })

#     # keys = res[0].keys()
#     # a_file = open("output.csv", "w", newline='')
#     # dict_writer = csv.DictWriter(a_file, keys)
#     # dict_writer.writeheader()
#     # dict_writer.writerows(res)
#     # a_file.close()

#     # incidents = id.formatIncidents(fileLog)
#     # keysInc = incidents[0].keys()
#     # a_fileInc = open("outputInc.csv", "w", newline='')
#     # dict_writerInc = csv.DictWriter(a_fileInc, keysInc)
#     # dict_writerInc.writeheader()
#     # dict_writerInc.writerows(incidents)
#     # a_fileInc.close()