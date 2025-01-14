function removeAllFromParameters(){

    d3.select(".paramDeviation").remove();
    d3.select("#btnParam").remove();
    d3.select("#precRecall").remove();
    d3.select("#paramFitness").remove();
    d3.select("#paramIncidents").remove();
    document.getElementById("deviation").style.display = "inline-block";
    document.getElementById("detail").style.display = "inline-block";

    document.getElementById("container_header").style.padding = "10px";
    document.getElementById("container_middle").style.padding = "10px";

 /*   
    // Remove parameters elements
    d3.select("#paramDeviation").remove();
    d3.select("#paramFitness").remove();
    d3.select("#paramIncidents").remove();

    d3.select("#containerState").selectAll("*").remove();
    d3.select("#pattern").selectAll("*").remove();
    d3.select("#detail").selectAll("*").remove();
    
    // Adjust display styles
    document.getElementById("legend").style.display = "";
    document.getElementById("containerDev").style.display = "table";
    document.getElementById("containerTop").style.display = "";
    document.getElementById("containerState").style.overflowY = "scroll";
    document.getElementById("containerState").style.width = "100%";
    document.getElementById("containerState").style.height = "150px"; //todo
    document.getElementById("container_bottom").style.display = "flex";
    
    document.getElementById("fitness").style.display = "inline-block";
    document.getElementById("incident").style.display = "inline-block";
    document.getElementById("pattern").style.width = "500px";
    */
}

function removeAllFromExploration(){

    document.getElementById("deviation").style.display = "none";
    document.getElementById("detail").style.display = "none";

    document.getElementById("container_header").style.paddingTop = "0px";
    document.getElementById("container_header").style.paddingBottom = "0px";
    document.getElementById("container_middle").style.padding = "0px";


/*

    // Remove deviation
    d3.select("#barMissing").selectAll("*").remove();
    d3.select("#barRepetition").selectAll("*").remove();
    d3.select("#barMismatch").selectAll("*").remove();
    // d3.select("#divTopOne").selectAll("*").remove();
    // d3.select("#divTopTwo").selectAll("*").remove();
    // d3.select("#divTopThree").selectAll("*").remove();
    d3.select("#stateDeviations").selectAll("*").remove();

    // Remove fitness
    d3.select("#fitnessViolin").selectAll("*").remove();
    d3.select("#fitnessBar").selectAll("*").remove();
    d3.select("#costViolin").selectAll("*").remove();
    d3.select("#costBar").selectAll("*").remove();

    // Remove incidents
    d3.select("#parallelIncidents").selectAll("*").remove();
    d3.select("#barIncidents").selectAll("*").remove();

    // Remove patterns
    d3.select("#pattern").selectAll("*").remove(); //patternChart
    d3.select("#detail").selectAll("*").remove();

    // Adjust display styles
    document.getElementById("deviation").style.display = "none";
    document.getElementById("detail").style.display = "none";
    document.getElementById("containerState").style.display = "none";
    document.getElementById("pattern").style.display = "none";
    document.getElementById("detail").style.display = "none";
    document.getElementById("detail").style.display = "none";
    document.getElementById("fitness").style.display = "none";
    document.getElementById("incident").style.display = "none";

    document.getElementById("containerDev").style.display = "none";
    // document.getElementById("containerTop").style.display = "none";

    // document.getElementById("containerState").style.overflow = "hidden";
    // document.getElementById("containerState").style.width = "300%";
    // document.getElementById("containerState").style.height = "400px"; //todo

    // document.getElementById("container_bottom").style.display = "none";
    // document.getElementById("pattern").style.width = "60%";
    // document.getElementById("detail").style.width = "75%";
    // document.getElementById("legend").style.display = "none";
*/
}



function filterAll(fullData){
    const activityIN = Object.keys(selectedActivities).reduce((acc, elem) => {
        if(selectedActivities[elem]) return [...acc, elem]
        else return acc;
    }, []);
    const activityOUT = Object.keys(selectedActivities).filter(x => !activityIN.includes(x));
    const endRange = new Date(dateRange[1]);
    const startRange = new Date(dateRange[0]);

    filteredData = fullData.reduce((acc, elem) => {
        const eventList = elem.alignment.split(";").filter(e => !e.includes("M")).map(el => el.split("]")[1]).slice(0, -1);
        const start = new Date(elem.openTs.replace(/(\d+[/])(\d+[/])/, '$2$1'));
        const end = new Date(elem.closeTs.replace(/(\d+[/])(\d+[/])/, '$2$1'));

        if((activityIN.some(e => !eventList.includes(e.toUpperCase())) || activityOUT.some(e => eventList.includes(e.toUpperCase()))) && activityIN.length !== 0);
        else {
            if(elem["fitness"]<=fitnessRange[0] && elem["fitness"]>=fitnessRange[1] && !acc.includes(elem))
                if(elem["costTotal"]<=costRange[0] && elem["costTotal"]>=costRange[1] && !acc.includes(elem))
                    if(((start <= endRange && start >= startRange) || (end <= endRange && end >= startRange)) && !acc.includes(elem))
                        if((selectedCategories.includes(elem.category) || selectedCategories.length === 0) && !acc.includes(elem)){
                            if(selectedAssessment.priority.length == 0 || selectedAssessment.priority.includes(elem.priority)){
                                if(selectedAssessment.impact.length == 0 || selectedAssessment.impact.includes(elem.impact)){
                                    if(selectedAssessment.urgency.length == 0 || selectedAssessment.urgency.includes(elem.urgency)){
                                        if(selectedErrors.missing == false || (selectedErrors.missing && elem.totMissing>0)){
                                            if(selectedErrors.repetition == false || (selectedErrors.repetition && elem.totRepetition>0)){
                                                if(selectedErrors.mismatch == false || (selectedErrors.mismatch && elem.totMismatch>0)){
                                                    acc.push(elem);
                                                }
                                            }

                                        }
                                    }
                                }
                            }
                            // if(selectedErrors.missing && selectedErrors.repetition && selectedErrors.mismatch){
                            //     if(elem.totMissing>0 && elem.totRepetition>0 && elem.totMismatch>0) acc.push(elem);
                            // }
                            // else if(selectedErrors.missing && selectedErrors.repetition){
                            //     if(elem.totMissing>0 && elem.totRepetition>0 && elem.totMismatch<=0) acc.push(elem);
                            // }
                            // else if(selectedErrors.missing && selectedErrors.mismatch){
                            //     if(elem.totMissing>0 && elem.totMismatch>0 && elem.totRepetition<=0) acc.push(elem);
                            // }
                            // else if(selectedErrors.repetition && selectedErrors.mismatch){
                            //     if(elem.totRepetition>0 && elem.totMismatch>0 && elem.totMissing<=0) acc.push(elem);
                            // }
                            // else if(selectedErrors.missing){
                            //     if(elem.totMissing>0 && elem.totRepetition<=0 && elem.totMismatch<=0) acc.push(elem);
                            // }
                            // else if(selectedErrors.repetition){
                            //     if(elem.totRepetition>0 && elem.totMissing<=0 && elem.totMismatch<=0) acc.push(elem);
                            // }
                            // else if(selectedErrors.mismatch){
                            //     if(elem.totMismatch>0 && elem.totMissing<=0 && elem.totRepetition<=0) acc.push(elem);
                            // }
                            // else{
                            //     acc.push(elem);
                            // }
                        }
        }
        return acc;
    }, []);

    return;
}

// function combineFilters(alignmentsData, incidentsData){

//     filteredAlignmentsData = filterError(alignmentsData, selectedErrors);
//     filteredAlignmentsData = filterActivities(filteredAlignmentsData, selectedActivities);
//     filteredAlignmentsData = filterBrushes(filteredAlignmentsData, fitnessRange, "fitness");
//     filteredAlignmentsData = filterBrushes(filteredAlignmentsData, costRange, "costTotal");
    
//     filteredIncidentsData = filterDate(dateRange, incidentsData);
    
//     filteredAlignmentsData = filterAlignmentsByCategory(filteredAlignmentsData, filteredIncidentsData, selectedCategories);

//     filteredIncidentsData = filterIncidentsByAlignments(filteredAlignmentsData, incidentsData);
//     filteredAlignmentsData = filterAlignmentsByIncidents(alignmentsData, filteredIncidentsData);
// }

// function filterIncidentsByAlignments(alignment, incidents){
//     return incidents.filter(elem => {
//         return alignment.map(e => e.incident_id).includes(elem.incident_id);
//     });
// }

// function filterAlignmentsByIncidents(alignment, incidents){
//     return alignment.filter(elem => {
//         return incidents.map(e => e.incident_id).includes(elem.incident_id);
//     });
// }

// function filterError(data, errorFilter){
//     return data.filter(function(elem) {
//         if(errorFilter.missing && errorFilter.repetition && errorFilter.mismatch){
//             return elem.totMissing>0 && elem.totRepetition>0 && elem.totMismatch>0
//         }
//         else if(errorFilter.missing && errorFilter.repetition){
//             return elem.totMissing>0 && elem.totRepetition>0 && elem.totMismatch<=0
//         }
//         else if(errorFilter.missing && errorFilter.mismatch){
//             return elem.totMissing>0 && elem.totMismatch>0 && elem.totRepetition<=0
//         }
//         else if(errorFilter.repetition && errorFilter.mismatch){
//             return elem.totRepetition>0 && elem.totMismatch>0 && elem.totMissing<=0
//         }
//         else if(errorFilter.missing){
//             return elem.totMissing>0 && elem.totRepetition<=0 && elem.totMismatch<=0
//         }
//         else if(errorFilter.repetition){
//             return elem.totRepetition>0 && elem.totMissing<=0 && elem.totMismatch<=0
//         }
//         else if(errorFilter.mismatch){
//             return elem.totMismatch>0 && elem.totMissing<=0 && elem.totRepetition<=0
//         }
//         else{
//             return true
//         }
//     });
// }

// function filterActivities(data, activityFilter){
//     const activityIN = Object.keys(activityFilter).reduce((acc, elem) => {
//         if(activityFilter[elem]) return [...acc, elem]
//         else return acc;
//     }, []);
//     const activityOUT = Object.keys(activityFilter).filter(x => !activityIN.includes(x));

//     if(activityIN.length === 0) return data;
//     else {
//         return data.filter(elem => {
//             const eventList = elem.alignment.split(";").filter(e => !e.includes("M")).map(el => el.split("]")[1]).slice(0, -1);
//             if(activityIN.some(e => !eventList.includes(e.toUpperCase())) || activityOUT.some(e => eventList.includes(e.toUpperCase()))) return false;
//             else return true;
//         });
//     }
// }

// function filterBrushes(data, rangeFilter, brushType){
//     return data.filter(elem => {
//         return elem[brushType]<=rangeFilter[0] && elem[brushType]>=rangeFilter[1]
//     });
// }

// function filterAlignmentsByCategory(alignment, incidents, selectedCat){
//     const listFilteredInc = incidents.reduce((acc, elem) => {
//         if(selectedCat.includes(elem.category)){
//             acc.push(elem.incident_id);
//         }
//         return acc;
//     }, []);
//     return alignment.filter(elem => {
//         return listFilteredInc.includes(elem.incident_id);
//     })
// }

// function filterDate(rangeDate, incidents){
//     return incidents.filter(elem => {
//         const endRange = new Date(rangeDate[1]);
//         const startRange = new Date(rangeDate[0]);
//         const start = new Date(elem.openTs.replace(/(\d+[/])(\d+[/])/, '$2$1'));
//         const end = new Date(elem.closeTs.replace(/(\d+[/])(\d+[/])/, '$2$1'));
//         return (start <= endRange && start >= startRange) || (end <= endRange && end >= startRange);
//     })
// }