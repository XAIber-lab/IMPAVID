eel.expose(paramsCosts);
function paramsCosts() {
    return {
        missing: paramMissing,
        repetition: paramRepetition,
        mismatch: paramMismatch,
        weights: paramWeights};
}
eel.expose(recalculateDate);
function recalculateDate(){
    return {
        missing: paramMissing,
        repetition: paramRepetition,
        mismatch: paramMismatch,
        weights: paramWeights};
}

function convertEventToAbbr(ev){
    switch(ev){
        case "Missing":
            return "miss";
        case "Repetition":
            return "rep";
        case "Mismatch":
            return "mism";
        case "Detection":
            return "N";
        case "Activation":
            return "A";
        case "Awaiting":
            return "W";
        case "Resolution":
            return "R";
        case "Closure":
            return "C";
        default:
            return "";
    }
}


async function renderSingleSlider(svg, margin, width, p, i, err, ranges){

    var def;
    switch(err){
        case "Missing":
            def = paramMissing[convertEventToAbbr(p)];
            break;
        case "Repetition":
            def = paramRepetition[convertEventToAbbr(p)];
            break;
        case "Mismatch":
            def = paramMismatch[convertEventToAbbr(p)];
            break;
        case "Weigths":
            def = paramWeights[convertEventToAbbr(p)];
            break;
        default:
            def = 0;
            break;
    }

    var sliderParam = d3.sliderBottom()
    .min(0)
    .max(1)
    .width(width-100)
    .tickFormat(d3.format('.2'))
    .ticks(10)
    .default(def/*err == "Missing" ? paramMissing[convertEventToAbbr(p)] : err == "Repetition" ? 0.33 : 0.2*/)
    .handle(
      d3.symbol()
        .type(d3.symbolCircle)
        .size(200)()
    )
    .on('end', val => sliderChange(val));

    const yDim = 50*i+2*margin.top;
    const g = svg.append("g")
    .attr("transform", "translate("+ 100 +"," + yDim + ")")
    .attr("height", 40)
    .call(sliderParam);

    svg.append("text")
    .attr("y", yDim+5)
    .attr("x", 0)
    .attr("font-family", "Helvetica")
    .text(p);

    function sliderChange(val){
        switch(err){
            case "Missing":
                paramMissing[convertEventToAbbr(p)] = val;
                break;
            case "Repetition":
                paramRepetition[convertEventToAbbr(p)] = val;
                break;
            case "Mismatch":
                paramMismatch[convertEventToAbbr(p)] = val;
                break;
            case "Weigths":
                paramWeights[convertEventToAbbr(p)] = val;
                break;
            default:
                break;
        }
    }

    const aa = d3.select(".slider");
    const w = 386/*aa.node().getBoundingClientRect().width;*/

    const x = d3.scaleLinear()
    .domain([0,1]) 
    .range([ 0, w ]);


    var rCrit;
    var rMed;
    var rLow;
    if(p == "Detection" && err == "Missing"){ rCrit = ranges["critical"]["Nmiss"]; rMed=ranges["medium"]["Nmiss"]; rLow =ranges["low"]["Nmiss"];}
    if(p == "Activation" && err == "Missing"){ rCrit = ranges["critical"]["Amiss"]; rMed=ranges["medium"]["Amiss"]; rLow =ranges["low"]["Amiss"];}
    if(p == "Resolution" && err == "Missing"){ rCrit = ranges["critical"]["Rmiss"]; rMed=ranges["medium"]["Rmiss"]; rLow =ranges["low"]["Rmiss"];}
    if(p == "Closure" && err == "Missing"){ rCrit = ranges["critical"]["Cmiss"]; rMed=ranges["medium"]["Cmiss"]; rLow =ranges["low"]["Cmiss"];}

    if(p == "Detection" && err == "Repetition"){ rCrit = ranges["critical"]["Nrep"]; rMed=ranges["medium"]["Nrep"]; rLow =ranges["low"]["Nrep"];}
    if(p == "Activation" && err == "Repetition"){ rCrit = ranges["critical"]["Arep"]; rMed=ranges["medium"]["Arep"]; rLow =ranges["low"]["Arep"];}
    if(p == "Awaiting" && err == "Repetition"){ rCrit = ranges["critical"]["Wrep"]; rMed=ranges["medium"]["Wrep"]; rLow =ranges["low"]["Wrep"];}
    if(p == "Resolution" && err == "Repetition"){ rCrit = ranges["critical"]["Rrep"]; rMed=ranges["medium"]["Rrep"]; rLow =ranges["low"]["Rrep"];}
    if(p == "Closure" && err == "Repetition"){ rCrit = ranges["critical"]["Crep"]; rMed=ranges["medium"]["Crep"]; rLow =ranges["low"]["Crep"];}

    if(p == "Detection" && err == "Mismatch"){ rCrit = ranges["critical"]["Nmism"]; rMed=ranges["medium"]["Nmism"]; rLow =ranges["low"]["Nmism"];}
    if(p == "Activation" && err == "Mismatch"){ rCrit = ranges["critical"]["Amism"]; rMed=ranges["medium"]["Amism"]; rLow =ranges["low"]["Amism"];}
    if(p == "Awaiting" && err == "Mismatch"){ rCrit = ranges["critical"]["Wmism"]; rMed=ranges["medium"]["Wmism"]; rLow =ranges["low"]["Wmism"];}
    if(p == "Resolution" && err == "Mismatch"){ rCrit = ranges["critical"]["Rmism"]; rMed=ranges["medium"]["Rmism"]; rLow =ranges["low"]["Rmism"];}
    if(p == "Closure" && err == "Mismatch"){ rCrit = ranges["critical"]["Cmism"]; rMed=ranges["medium"]["Cmism"]; rLow =ranges["low"]["Cmism"];}

    
    var xPosM = rMed ? rMed.mean>=1 ? x(1)-25 : x(rMed.mean-rMed.std) : null;
    var wPosM = xPosM ? rMed.mean>=1 ? 25 : 2*x(rMed.std) : 0;
    xPosM && g.append("rect")
    .attr("width", /*wPosM*/xPosM + wPosM > x(1) ? x(1) - xPosM : wPosM)
    .attr("height", 8)
    .attr("fill", colorSeverity.high)
    .attr("opacity", 0.8)
    .attr("x", xPosM)
    .attr("y", -4)
    .attr("rx", 10)
    .attr("ry", 10);

    var xPosL = rLow ? rLow.mean>=1 ? x(1)-25 : x(rLow.mean-rLow.std) : null;
    var wPosL = xPosL ? rLow.mean>=1 ? 25 : 2*x(rLow.std) : 0;
    xPosL && g.append("rect")
        .attr("width", /*wPosL*/xPosL + wPosL > x(1) ? x(1) - xPosL : wPosL)
        .attr("height", 8)
        .attr("fill", colorSeverity.low)
        .attr("opacity", 0.8)
        .attr("x", xPosL)
        .attr("y", -4)
        .attr("rx", 10)
        .attr("ry", 10);
    
    var xPosC = rCrit ? rCrit.mean>=1 ? x(1)-25 : x(rCrit.mean-rCrit.std) : null;
    var wPosC = xPosC ? rCrit.mean>=1 ? 25 : 2*x(rCrit.std) : 0;
    xPosC && g.append("rect")
        .attr("width", /*wPosC*/xPosC + wPosC > x(1) ? x(1) - xPosC : wPosC)
        .attr("height", 8)
        .attr("fill", colorSeverity.critical)
        .attr("opacity", 0.8)
        .attr("x", xPosC)
        .attr("y", -4)
        .attr("rx", 10)
        .attr("ry", 10);


    // /*TODO FARE MEGLIO*/
    // var xPosM = rMed ? rMed.mean>1 ? w-margin.left : x(rMed.mean) : null;
    // var xPosMinM = xPosM? x(rMed.mean-rMed.std) > x(1) ? x(1) : x(rMed.mean-rMed.std) : null;
    // var xPosMaxM = xPosM ? x(rMed.mean+rMed.std) > x(1) ? x(1) : x(rMed.mean+rMed.std) : null;

    // xPosM && g.append("rect")
    //     .attr("width", xPosMinM > xPosM ? 10 : (xPosMaxM-xPosMinM)-2*margin.left)
    //     .attr("height", 8)
    //     .attr("fill", "yellow")
    //     .attr("opacity", 0.8)
    //     .attr("x", xPosM-margin.left)
    //     .attr("y", -4)
    //     .attr("rx", 10)
    //     .attr("ry", 10);

    // /*TODO FARE MEGLIO*/
    // var xPosL = rLow ? rLow.mean>1 ? w-margin.left : x(rLow.mean) : null;
    // var xPosMinL = xPosL? x(rLow.mean-rLow.std) > x(1) ? x(1) : x(rLow.mean-rLow.std) : null;
    // var xPosMaxL = xPosL ? x(rLow.mean+rLow.std) > x(1) ? x(1) : x(rLow.mean+rLow.std) : null;

    // xPosL && g.append("rect")
    //     .attr("width", xPosMinL > xPosL ? 10 : (xPosMaxL-xPosMinL)-2*margin.left)
    //     .attr("height", 8)
    //     .attr("fill", "green")
    //     .attr("opacity", 0.8)
    //     .attr("x", xPosL-margin.left)
    //     .attr("y", -4)
    //     .attr("rx", 10)
    //     .attr("ry", 10);

    // /*TODO FARE MEGLIO*/
    // var xPosC = rCrit ? rCrit.mean>1 ? w-margin.left : x(rCrit.mean) : null;
    // var xPosMinC = xPosC? x(rCrit.mean-rCrit.std) > x(1) ? x(1) : x(rCrit.mean-rCrit.std) : null;
    // var xPosMaxC = xPosC ? x(rCrit.mean+rCrit.std) > x(1) ? x(1) : x(rCrit.mean+rCrit.std) : null;

    // xPosC && g.append("rect")
    //     .attr("width", xPosMinC > xPosC ? 10 : (xPosMaxC-xPosMinC)-2*margin.left)
    //     .attr("height", 8)
    //     .attr("fill", "red")
    //     .attr("opacity", 0.8)
    //     .attr("x", xPosC-margin.left)
    //     .attr("y", -4)
    //     .attr("rx", 10)
    //     .attr("ry", 10);
}

function renderParamSpace(fullData, ranges){

    var margin = {top: 15, right: 10, bottom: 20, left: 10},
    width = 480 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;
    
    const devs = ["Missing", "Repetition", "Mismatch"];
    devs.map(err => {

        d3.select("#paramDeviation"+err).remove();

        var svg = d3.select("#container_middle")
        .append("svg")
        .attr("id", "paramDeviation"+err)
        .attr("class", "paramDeviation")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("border-style", "dotted")
        .style("padding", "8px")
        .style("margin", "5px")
        .style("padding-bottom", 0);
        
        svg.append("text")
        .attr("y", margin.top)
        .attr("x", (width + margin.left + margin.right)/2)
        .attr("font-family", "Helvetica")
        .text(err);

        const params = err == "Missing" ? ["Detection", "Activation", "Resolution", "Closure"] : ["Detection", "Activation", "Awaiting", "Resolution", "Closure"];
        params.map((p,i) => {
            renderSingleSlider(svg, margin, width, p, i, err, ranges);
        });
    });

    d3.select("#paramDeviationWeights").remove();
    d3.select("#btnParam").remove();

    var svgLast = d3.select("#container_middle")
        .append("svg")
        .attr("id", "paramDeviationWeights")
        .attr("class", "paramDeviation")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("border-style", "dotted")
        .style("padding", "8px")
        .style("margin", "5px")
        .style("padding-bottom", 0);
    
    svgLast.append("text")
    .attr("y", margin.top)
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("font-family", "Helvetica")
    .text("Error weights");

    devs.map((p,i) => {
        renderSingleSlider(svgLast, margin, width, p, i, "Weigths", ranges);
    });

    // var svgPrecRec = d3.select("#container_middle")
    // .append("svg")
    // .attr("id", "precRecall")
    // .attr("class", "paramDeviation")
    // .attr("width", 400)
    // .attr("height", 300)
    // .style("border-style", "dotted");
    var svgPrecRec = null;
    var divPrecRec = document.createElement("div");
    divPrecRec.id = "precRecall";
    divPrecRec.class = "paramDeviation";
    divPrecRec.style.width = "400px";
    divPrecRec.style.height = "280px";
    divPrecRec.style.borderStyle = "dotted";
    divPrecRec.style.margin = "5px";
    document.getElementById("container_middle").appendChild(divPrecRec);

    var btn = document.createElement("button");
    btn.id = "btnParam"
    btn.innerHTML = "Submit";
    btn.addEventListener("click", async function () {
        const pars = {
            missing: paramMissing,
            repetition: paramRepetition,
            mismatch: paramMismatch,
            weights: paramWeights}
        const parData = await eel.calculateParamCosts(pars)();
        const newCosts = await eel.calculateNewCost(pars)();
        filteredData = fullData.map(elem => {
            newEl = newCosts.find(e => e.incident_id === elem.incident_id)
            return newEl ? {
                ...elem,
                costMismatch: parseFloat(newEl.costMismatch)>1 ? 1 : parseFloat(newEl.costMismatch),
                costMissing: parseFloat(newEl.costMissing)>1 ? 1 : parseFloat(newEl.costMissing),
                costRepetition: parseFloat(newEl.costRepetition)>1 ? 1 : parseFloat(newEl.costRepetition),
                costTotal: parseFloat(newEl.costTotal)>1 ? 1 : parseFloat(newEl.costTotal),
            } : {...elem}
        })

        for(var i=0; i<parData.precision.length; i++){
            var sev;
            switch(i){
                case 0:
                    sev = "low";
                    break;
                case 1:
                    sev = "medium";
                    break;
                case 2:
                    sev = "high";
                    break;
                default:
                    sev = "critical";
                    break;
            }
            modelMetrics.push({severity:sev, precision:parData.precision[i], recall:parData.recall[i]})
        }

        // renderParamAnalysis()
        // writePrecRecall() //restore

        // console.log(filteredData);
        renderMetrics(fullData);
        renderPattern();
        renderFitnessBlock(fullData);
        renderParamAnalysis(svgPrecRec, "precision");
        renderParamAnalysis(svgPrecRec, "recall");
      });

    document.getElementById("container_middle").appendChild(btn);

    renderParamAnalysis(svgPrecRec, "precision");
    renderParamAnalysis(svgPrecRec, "recall");


    // var svgRecall = d3.select("#container_middle")
    //     .append("svg")
    //     .attr("class", "paramDeviation")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //     .style("border-style", "dotted")
    //     // .style("padding", "8px")
    //     // .style("margin", "5px")
    //     .style("padding-bottom", 0);
    // // svgRecall.append("rect")
    // // .attr("width", 20)
    // // .attr("height", 20);
    
}

function renderParamAnalysis(svg, metric){

    d3.select("#"+metric+"Curve").remove();

    var margin = {top: 10, right: 30, bottom: 30, left: 20},
    width = 400 - margin.left - margin.right,
    height = 130 - margin.top - margin.bottom;

    // var svg = d3.select("#pattern")
    // .append("svg")
    // .attr("id", "paramFitness")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var svgM = d3.select("#precRecall")
    .append("svg")
    .attr("id", metric+"Curve")
    .attr("class", "paramDeviation")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .style("border-style", "dotted")
    // .style("padding", "8px")
    // .style("margin", "5px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // group the data: I want to draw one line per group
    const sumstat = d3.group(modelMetrics, d => d.severity);

    var x = d3.scaleBand()
    .domain(/*[*/[...Array(modelMetrics.length/4).keys()]/*modelMetrics.length/4]*//*d3.extent(modelMetrics, function(d) { return d.recall; })*/) //0,1
    .range([ 0, width-70 ]);
    svgM.append("g")
    .attr("transform", "translate("+margin.left+"," + (height+margin.top) + ")")
    .call(d3.axisBottom(x).ticks(modelMetrics.length/4));
    svgM.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height + 3*margin.top - 5)
        .text(metric);

    // Add Y axis --> precision
    var y = d3.scaleLinear()
    .domain([0, 1/*d3.max(modelMetrics, function(d) { return +d.precision; })*/]) //0,1
    .range([ height, 0 ]);
    svgM.append("g")
    .attr("transform", "translate("+ margin.left +","+ margin.top+")")
    .call(d3.axisLeft(y));
    // svg.append("text")
    //     .attr("text-anchor", "end")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", -margin.left)
    //     .attr("x", margin.top)
    //     .text("precision");

    // color palette
    var color = d3.scaleOrdinal()
    .range([colorSeverity.low,colorSeverity.medium,colorSeverity.high,colorSeverity.critical])

    // Draw legend
    var legend_keys = ["low", "medium", "high", "critical"]

    var lineLegend = svgM.selectAll(".lineLegend").data(legend_keys)
        .enter().append("g")
        .attr("class","lineLegend")
        .attr("transform", function (d,i) {
                return "translate(" + (width-50) + "," + (i*20+5)+")"; //todo aggiustare
            });

    lineLegend.append("text").text(function (d) {return d;})
        .attr("transform", "translate(15,9)"); //align texts with boxes

    lineLegend.append("rect")
        .attr("fill", function (d, i) {return color(d); })
        .attr("width", 10).attr("height", 10);

    // Draw the line
    var lines = svgM.selectAll(".line")
    .data(sumstat);

    lines.exit().remove();

    lines.enter().append("path")
    .attr("fill", "none")
    .attr("stroke", function(d){ return color(d[0]) })
    .attr("stroke-width", 1.5)
    .attr("d", function(d){
        return d3.line()
        .x(function(d,i) {return x(/*d.recall*/i)+margin.left; })
        .y(function(d) {return y(+d[metric]/*.precision*/); })
        (d[1])
    })

    // var selectCircle = svgM.selectAll(".circle")
    // .data(modelMetrics)

    // numCircles = modelMetrics.length/4;

    // for(j=0;j<numCircles;j++){
    //     selectCircle.enter().append("circle")
    //         .attr("class", "circle")
    //         .attr("r", 3)
    //         .attr("cx", x(j)+margin.left)
    //         .attr("cy", function(d) {
    //             return y(d[metric])
    //         })
    //         .attr("fill",  function(d){ return color(d.severity) })
    //     }
    
}

function writePrecRecall(){

    d3.select("#paramFitness").remove();

    var margin = {top: 20, right: 30, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    var svg = d3.select("#pattern")
    .append("svg")
    .attr("id", "paramFitness")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // group the data: I want to draw one line per group
    const sumstat = d3.group(modelMetrics, d => d.severity);

    // color palette
    var color = d3.scaleOrdinal()
    .range([colorSeverity.low,colorSeverity.medium,colorSeverity.high,colorSeverity.critical])

    // // Draw legend
    // var legend_keys = ["low", "medium", "high", "critical"]

    // var lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
    //     .enter().append("g")
    //     .attr("class","lineLegend")
    //     .attr("transform", function (d,i) {
    //             return "translate(" + (width-50) + "," + (i*20)+")"; //todo aggiustare
    //         });

    // lineLegend.append("text").text(function (d) {return d;})
    //     .attr("transform", "translate(15,9)"); //align texts with boxes

    // lineLegend.append("rect")
    //     .attr("fill", function (d, i) {return color(d); })
    //     .attr("width", 10).attr("height", 10);

    modelMetrics.map((elem,i) => {
        svg.append("text")
            .attr("y", i*20)
            .attr("x", 0)
            .text(modelMetrics[i].severity+": "+modelMetrics[i].precision.toFixed(3)+", "+modelMetrics[i].recall.toFixed(3))
    });

}

function renderTraces(){

    d3.select("#paramIncidents").remove();

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
    width = 300 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

    var svg = d3.select("#detail")
    .append("svg")
    .attr("id", "paramIncidents")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // svg.append("text")
    // .attr("y", 70)
    // .attr("x", 0)
    // .attr("font-family", "Helvetica")
    // .text(" TRACCE ORDINATE IN BASE AL COSTO ");
}