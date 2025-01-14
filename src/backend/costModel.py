threshold = {"low":0.37,"medium":0.69,"high":0.89}

def calculateMissing(dfMiss, dictAlfaMiss, Tmiss):
    if int(dfMiss["N"])+int(dfMiss["A"])+int(dfMiss["R"])+int(dfMiss["C"]) > Tmiss:
        tot = 1
    else:
        tot = dictAlfaMiss["N"]*dfMiss["N"]\
        +dictAlfaMiss["A"]*dfMiss["A"]\
        # +dictAlfaMiss["W"]*dfMiss["W"]\
        +dictAlfaMiss["R"]*dfMiss["R"]\
        +dictAlfaMiss["C"]*dfMiss["C"]
    return tot

def calculateMultiple(dfMult, numEv, dictAlfaMult, Tmult):
    if int(dfMult["N"]) > Tmult or int(dfMult["A"]) > Tmult or int(dfMult["W"]) >Tmult or int(dfMult["R"])>Tmult or int(dfMult["C"])>Tmult:
        tot=1
    else:
        tot = dictAlfaMult["N"]*(int(dfMult["N"])/numEv)\
        + dictAlfaMult["A"]*(int(dfMult["A"])/numEv)\
        + dictAlfaMult["W"]*(int(dfMult["W"])/numEv)\
        + dictAlfaMult["R"]*(int(dfMult["R"])/numEv)\
        + dictAlfaMult["C"]*(int(dfMult["C"])/numEv)
    return tot

def calculateMismatch(dfMism, numEv,dictAlfaMismatch, Tmism):
    if int(dfMism["N"]) + int(dfMism["A"]) + int(dfMism["W"]) + int(dfMism["R"]) + int(dfMism["C"]) > Tmism:
        tot=1
    else:
        tot = dictAlfaMismatch["N"]*(int(dfMism["N"])/numEv)\
        + dictAlfaMismatch["A"]*(int(dfMism["A"])/numEv)\
        + dictAlfaMismatch["W"]*(int(dfMism["W"])/numEv)\
        + dictAlfaMismatch["R"]*(int(dfMism["R"])/numEv)\
        + dictAlfaMismatch["C"]*(int(dfMism["C"])/numEv)
    return tot

def calculateCost(cMiss, cRep, cMism, dictAlfaCost):
    return dictAlfaCost["miss"]*cMiss+ dictAlfaCost["rep"]*cRep+ dictAlfaCost["mism"]*cMism

def calculateSeverity(cost):
    if(cost == 0):
        return "none"
    elif(cost>0 and cost<=threshold["low"]):
        return "low"
    elif(cost >threshold["low"] and cost<=threshold["medium"]):
        return "medium"
    elif(cost>threshold["medium"] and cost<=threshold["high"]):
        return "high"
    else:
        return "critical"