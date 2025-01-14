import csv
import itertools

import pandas as pd
from numpy import Inf
import costModel as cm
import procMining as pm
import utilsPM as upm
import devDetection as dd
import incidentData as id


Tmiss = 1000
Tmult = 1500
Tmism = 5000

"""
Write in a csv file incident processes to parametrize
"""
fileLog = "data/simple_log.csv"
fileModel = "data/base_model.pnml"
csv_columns = ["incident_id", "alignment", "numEvent"]
csv_columns2 = ["incidents", "alignment", "count", "numEvents"]
csv_file = "data/simpleTraces.csv"
csv_weigths = "data/weightsLight.csv"
csv_weigths2 = "data/weightsLight2.csv"

def writeAlignmentsOnFile():
    listElems = []
    aligns = pm.compute_trace_alignment(fileLog,fileModel)
    for e in aligns:
        trace = upm.convertTraceList(e["alignment"])
        numEvents = upm.countEvents(trace)
        newE = {"incident_id": e["incident_id"], "alignment": e["alignment"], "numEvent": numEvents}
        listElems.append(newE)
    try:
        with open(csv_file, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
            writer.writeheader()
            for data in listElems:
                writer.writerow(data)
    except IOError:
        print("I/O error")


def permutation():
    # listWeights = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    listWeights = ["l","m","h"]
    errs=["miss","rep","mism"]
    all = []
    with open('data/weightsLight.csv','w', newline='') as out:
        csv_out=csv.writer(out)
        csv_out.writerow(errs)
        for perm in itertools.product(listWeights, repeat = len(errs)):
            # # totW = sum(list(perm))
            # # if totW == 1:
            # csv_out.writerow(perm)
            all.append(''.join(perm))
    
        # print(all)
        for comb in itertools.product(all, repeat = 3):
            # print(comb)
            csv_out.writerow(comb)

dictAlfaCost = {"miss":0.33,"rep":0.34,"mism":0.33}
def computeParamCosts():
    maxMiss=0
    maxRep=0
    maxMism=0
    with open('data/maxCosts.csv','w', newline='') as out:
        nextW=csv.writer(out)
        nextW.writerow(["maxMiss", "maxRep", "maxMism"])
        with open(csv_file, "r") as f:
            # with open(csv_weigths, "r") as w:
            with open(csv_weigths2, "r") as w:
                #with open('data/allCosts.csv','w', newline='') as out:
                with open('data/allCosts2.csv','w', newline='') as out:
                    csv_out=csv.writer(out)
                    csv_out.writerow(["alignment", 
                    # "wMiss", "cMiss", "wRep", "cRep", "wMism", "cMism", "cTot", 
                    "severity"])

                    reader = csv.DictReader(f)
                    traces = list(reader)

                    readerErr = csv.DictReader(w)
                    wErr = list(readerErr)

                    for elem in traces:
                        trace = upm.convertTraceList(elem["alignment"])
                        resMissing = dd.detectMissing(trace)
                        resRepetition = dd.detectMutliple(trace)
                        resMismatch = dd.detectMismatch(trace)

                        numEvents = int(elem["numEvents"])
                        
                        for weight in wErr:
                            missW = list(weight["miss"])
                            repW = list(weight["rep"])
                            mismW = list(weight["mism"])

                            dictAlfaMiss = {
                            "N": convertStringToWeigth(missW[0]),
                            "A": convertStringToWeigth(missW[1]),
                            "W": convertStringToWeigth(missW[2]),
                            "R": convertStringToWeigth(missW[3]),
                            "C": convertStringToWeigth(missW[4])}

                            dictAlfaMult = {
                            "N": convertStringToWeigth(repW[0]),
                            "A": convertStringToWeigth(repW[1]),
                            "W": convertStringToWeigth(repW[2]),
                            "R": convertStringToWeigth(repW[3]),
                            "C": convertStringToWeigth(repW[4])}

                            dictAlfaMismatch = {
                            "N": convertStringToWeigth(mismW[0]),
                            "A": convertStringToWeigth(mismW[1]),
                            "W": convertStringToWeigth(mismW[2]),
                            "R": convertStringToWeigth(mismW[3]),
                            "C": convertStringToWeigth(mismW[4])}

                            costMissing = cm.calculateMissing(upm.addAllActivities(resMissing),dictAlfaMiss, Tmiss)
                            costRepetition = cm.calculateMultiple(upm.addAllActivities(resRepetition), numEvents, dictAlfaMult, Tmult)
                            costMismatch = cm.calculateMismatch(upm.addAllActivities(resMismatch), numEvents, dictAlfaMismatch, Tmism)

                            if costMissing > maxMiss:
                                maxMiss=costMissing
                                nextW.writerow([maxMiss,maxRep,maxMism])
                            if costRepetition > maxRep:
                                maxRep = costRepetition
                                nextW.writerow([maxMiss,maxRep,maxMism])
                            if costMismatch > maxMism:
                                maxMism = costMismatch
                                nextW.writerow([maxMiss,maxRep,maxMism])

                            normalcostMissing = costMissing/4
                            normalcostRepetition = costRepetition/1.1428571428571428
                            normalcostMismatch = costMismatch/0.5714285714285714

                            cost = cm.calculateCost(normalcostMissing,normalcostRepetition,normalcostMismatch, dictAlfaCost)
                            severity = cm.calculateSeverity(cost)
                            csv_out.writerow([elem["alignment"],
                            # weight["miss"],normalcostMissing,weight["rep"],normalcostRepetition,weight["mism"],normalcostMismatch, cost, 
                            severity])
    
    

from collections import Counter
def writeAligns():
    listElems = []
    aligns = pm.compute_trace_alignment(fileLog,fileModel)

    k = [x['alignment'] for x in aligns]

    for i in Counter(k):
        all = [x for x in aligns if x['alignment']==i]
        listElems.append(all)
    
    listAll = []
    with open(csv_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=csv_columns2)
        writer.writeheader()
        for a in listElems:
            countEl = len(a)
            ali = a[0]["alignment"]
            trace = upm.convertTraceList(ali)
            numEvents = upm.countEvents(trace)

            listInc = a[0]["incident_id"]
            for i in range(1,len(a)-1):
                listInc = listInc + ";" + a[i]["incident_id"]
            # listAll.append({"incidents": listInc, "alignment": ali, "count": countEl, "numEvents": numEvents})
            writer.writerow({"incidents": listInc, "alignment": ali, "count": countEl, "numEvents": numEvents})

from sklearn.metrics import precision_recall_fscore_support as score
def calculateMetrics():

    ### Precision and recall

    # predicted = [0, 1, 1, 2, 3] 
    # y_test = [0, 3, 3, 0, 0]

    # precision, recall, fscore, support = score(y_test, predicted)

    # print('precision: {}'.format(precision))
    # print('recall: {}'.format(recall))
    # print('fscore: {}'.format(fscore))
    # print('support: {}'.format(support))

    with open('data/allCosts2.csv','r') as f:
        reader = csv.DictReader(f)
        traces = list(reader)
        for elem in traces:
            print(elem)
    # print("Done")

# dictAlfaMiss = {"N":0.2,"A":0.2, "W":0.2, "R":0.2,"C":0.2}
# threshold = {"low":0.37,"medium":0.69,"high":0.89}
def convertStringToWeigth(level):
    if(level == "l"):
        return 1
    elif level=="m":
        return 1.5
    else:
        return 2


def permutation2():
    # listWeights = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    listWeights = ["l","h"]
    errs=["miss","rep","mism"]
    all = []
    with open('data/weightsLight2.csv','w', newline='') as out:
        csv_out=csv.writer(out)
        csv_out.writerow(errs)
        for perm in itertools.product(listWeights, repeat = 5):
            # # totW = sum(list(perm))
            # # if totW == 1:
            # csv_out.writerow(perm)
            all.append(''.join(perm))
    
        # print(all)
        for comb in itertools.product(all, repeat = 3):
            # print(comb)
            csv_out.writerow(comb)


def writeAlignmentTruth():
    aligns = pm.compute_trace_alignment(fileLog,fileModel)
    listData = []
    computedInc = []

    with open("data/simple_log.csv", "r") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            inc = row["incident_id"]
            priority = row["priority"]
            for elem in aligns:
                if(elem["incident_id"] == inc and inc not in computedInc):
                    computedInc.append(inc)
                    listData.append({"incident_id": inc, "trace": elem["alignment"], "priority":priority})
    
    with open("data/groundTruth.csv", "w", newline='') as fw:
        keys = listData[0].keys()
        dict_writer = csv.DictWriter(fw, keys)
        dict_writer.writeheader()
        dict_writer.writerows(listData)



def computeTruthWeights():
    c=0
    listTrueWeights = []
    dictAlfaMiss = {"N":0.25,"A":0.25, "W":0, "R":0.25,"C":0.25}
    Tmiss = 1000
    dictAlfaMult = {"N":0.25,"A":0.25,"W":0.2,"R":0.2,"C":0.1}
    Tmult = 10000
    dictAlfaMismatch = {"N":0.35,"A":0.35,"W":0.1,"R":0.1,"C":0.1}
    Tmism = 4000
    dictAlfaCost = {"miss":0.33,"rep":0.34,"mism":0.33}
    with open("data/groundTruth.csv", "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            trace = upm.convertTraceList(row["trace"])
            severityTrue = row["priority"]

            resMissing = dd.detectMissing(trace)
            resRepetition = dd.detectMutliple(trace)
            resMismatch = dd.detectMismatch(trace)

            numEvents = upm.countEvents(trace)
            costMissing = cm.calculateMissing(upm.addAllActivities(resMissing),dictAlfaMiss, Tmiss)
            costRepetition = cm.calculateMultiple(upm.addAllActivities(resRepetition), numEvents, dictAlfaMult, Tmult)
            costMismatch = cm.calculateMismatch(upm.addAllActivities(resMismatch), numEvents, dictAlfaMismatch, Tmism)
            cost = cm.calculateCost(costMissing,costRepetition,costMismatch, dictAlfaCost)
            severity = cm.calculateSeverity(cost)
            if convertSeverityToLabel(severityTrue) == convertSeverityToLabel(severity):
                listTrueWeights.append({"priority": row["priority"], 
                "Nmiss":dictAlfaMiss["N"], "Amiss":dictAlfaMiss["A"], "Wmiss":dictAlfaMiss["W"], "Rmiss":dictAlfaMiss["R"], "Cmiss":dictAlfaMiss["C"],
                "Nrep":dictAlfaMult["N"], "Arep":dictAlfaMult["A"], "Wrep":dictAlfaMult["W"], "Rrep":dictAlfaMult["R"], "Crep":dictAlfaMult["C"],
                "Nmism":dictAlfaMismatch["N"], "Amism":dictAlfaMismatch["A"], "Wmism":dictAlfaMismatch["W"], "Rmism":dictAlfaMismatch["R"], "Cmism":dictAlfaMismatch["C"],
                 })
                c+=1
            else:
                foundW = True
                dictAlfaMiss = {"N":0.25,"A":0.25, "W":0, "R":0.25,"C":0.25}
                dictAlfaMult = {"N":0.25,"A":0.25,"W":0.2,"R":0.2,"C":0.1}
                dictAlfaMismatch = {"N":0.35,"A":0.35,"W":0.1,"R":0.1,"C":0.1}
                counter = 0
                costMissing = cm.calculateMissing(upm.addAllActivities(resMissing),dictAlfaMiss, Tmiss)
                costRepetition = cm.calculateMultiple(upm.addAllActivities(resRepetition), numEvents, dictAlfaMult, Tmult)
                costMismatch = cm.calculateMismatch(upm.addAllActivities(resMismatch), numEvents, dictAlfaMismatch, Tmism)
                cost = cm.calculateCost(costMissing,costRepetition,costMismatch, dictAlfaCost)
                severity = cm.calculateSeverity(cost)
                while(foundW):
                    for elem in ["N","A","W","R","C"]:
                        if convertSeverityToLabel(severityTrue) < convertSeverityToLabel(severity):
                            dictAlfaMiss[elem] = dictAlfaMiss[elem]/2
                            dictAlfaMult[elem] = dictAlfaMult[elem]/2
                            dictAlfaMismatch[elem] = dictAlfaMismatch[elem]/2
                        else:
                            dictAlfaMiss[elem] = dictAlfaMiss[elem]*2
                            dictAlfaMult[elem] = dictAlfaMult[elem]*3
                            dictAlfaMismatch[elem] = dictAlfaMismatch[elem]*3
                            
                        costMissing = cm.calculateMissing(upm.addAllActivities(resMissing),dictAlfaMiss, Tmiss)
                        costRepetition = cm.calculateMultiple(upm.addAllActivities(resRepetition), numEvents, dictAlfaMult, Tmult)
                        costMismatch = cm.calculateMismatch(upm.addAllActivities(resMismatch), numEvents, dictAlfaMismatch, Tmism)
                        cost = cm.calculateCost(costMissing,costRepetition,costMismatch, dictAlfaCost)
                        severity = cm.calculateSeverity(cost)

                        if counter == 5:
                            foundW = False
                        if convertSeverityToLabel(severityTrue) == convertSeverityToLabel(severity):
                                c += 1
                                listTrueWeights.append({"priority": row["priority"], 
                                "Nmiss":dictAlfaMiss["N"], "Amiss":dictAlfaMiss["A"], "Wmiss":dictAlfaMiss["W"], "Rmiss":dictAlfaMiss["R"], "Cmiss":dictAlfaMiss["C"],
                                "Nrep":dictAlfaMult["N"], "Arep":dictAlfaMult["A"], "Wrep":dictAlfaMult["W"], "Rrep":dictAlfaMult["R"], "Crep":dictAlfaMult["C"],
                                "Nmism":dictAlfaMismatch["N"], "Amism":dictAlfaMismatch["A"], "Wmism":dictAlfaMismatch["W"], "Rmism":dictAlfaMismatch["R"], "Cmism":dictAlfaMismatch["C"],
                                })
                                foundW = False
                        counter +=1
    print(c/24918*100)

    with open("data/groundTruthWeights.csv", "w", newline='') as fw:
        keys = listTrueWeights[0].keys()
        dict_writer = csv.DictWriter(fw, keys)
        dict_writer.writeheader()
        dict_writer.writerows(listTrueWeights)
    
def paramanalysis():
    df = pd.read_csv('data/groundTruthWeights.csv')
    ranges = df.agg(["mean", "std"])
    el = ranges.to_dict('dict')

    critical = pd.concat([df.loc[df['priority'] == "1 - Critical"], df.loc[df['priority'] == "2 - High"]])
    medium = df.loc[df['priority'] == "3 - Moderate"]
    low = df.loc[df['priority'] == "4 - Low"]

    rCrit = critical.agg(["mean", "std"])
    rMed = medium.agg(["mean", "std"])
    rLow = low.agg(["mean", "std"])


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


dictAlfaMiss = {"N":0.25,"A":0.25, "W":0, "R":0.25,"C":0.25}
Tmiss = 1
dictAlfaMult = {"N":0.25,"A":0.25,"W":0.2,"R":0.2,"C":0.1}
Tmult = 10
dictAlfaMismatch = {"N":0.35,"A":0.35,"W":0.1,"R":0.1,"C":0.1}
Tmism = 4
dictAlfaCost = {"miss":0.33,"rep":0.34,"mism":0.33}
def writeDataOnFile():
    incidents = sorted(id.formatIncidents(fileLog), key=lambda d: d['incident_id'])

    aligns = pm.compute_trace_alignment(fileLog,fileModel)
    alignments = pm.compute_deviations(aligns, dictAlfaMiss, Tmiss, dictAlfaMult, Tmult, dictAlfaMismatch, Tmism, dictAlfaCost, True)
    # incidents = id.formatIncidents(fileLog)
    # print(alignments, incidents)

    res = []
    i=0
    for incident in alignments.keys():
        res.append({"incident_id": incident,
        "alignment": alignments[incident]["alignment"],
        'fitness': alignments[incident]['fitness'],
        'missing': alignments[incident]['missing'],
        'repetition': alignments[incident]['repetition'],
        'mismatch': alignments[incident]['mismatch'],
        'totMissing': alignments[incident]['totMissing'],
        'totRepetition': alignments[incident]['totRepetition'],
        'totMismatch': alignments[incident]['totMismatch'],
        'costMissing': alignments[incident]['costMissing'],
        'costRepetition': alignments[incident]['costRepetition'],
        'costMismatch': alignments[incident]['costMismatch'],
        'costTotal': alignments[incident]['costTotal'],
        'severity': alignments[incident]['severity'],

        "impact": incidents[i]["impact"],
        "urgency": incidents[i]["urgency"],
        "priority": incidents[i]["priority"],
        "category": incidents[i]["category"],
        "openTs": incidents[i]["openTs"],
        "closeTs": incidents[i]["closeTs"],
        "reassignment": incidents[i]["reassignment"],
        "reopen": incidents[i]["reopen"],
        "updates": incidents[i]["updates"],
        "rfc": incidents[i]["rfc"],
        "sla": incidents[i]["sla"]
        })
        i+=1

    keys = res[0].keys()
    a_file = open("data/fullOutputFull.csv", "w", newline='')
    dict_writer = csv.DictWriter(a_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(res)
    a_file.close()

    # keysInc = incidents[0].keys()
    # a_fileInc = open("outputInc.csv", "w", newline='')
    # dict_writerInc = csv.DictWriter(a_fileInc, keysInc)
    # dict_writerInc.writeheader()
    # dict_writerInc.writerows(incidents)
    # a_fileInc.close()

if __name__ == "__main__":
    # permutation()
    # writeAlignmentsOnFile()
    # writeAligns()
    # computeParamCosts()
    # calculateMetrics()
    # permutation2()
    # computeParamCosts()
    # calculateMetrics()
    # writeAlignmentTruth()
    # computeTruthWeights()

    writeDataOnFile()
    # paramanalysis()
