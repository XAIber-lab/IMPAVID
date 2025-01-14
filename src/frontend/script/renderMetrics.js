function renderMetrics(fullData){

    d3.select("#metrics").selectAll("*").remove();

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
    width = 320 - margin.left - margin.right,
    height = 110 - margin.top - margin.bottom;

    // Calculate number of incidents
    const numIncidents = filteredData.length;
    const totIncidents = fullData.length;

    // Calculate number of variants
    const numVariants = [...new Set(filteredData.map(e => e.alignment))].length;
    const totVariants = [...new Set(fullData.map(e => e.alignment))].length;

    // Calculate average fitness
    const avgF = (filteredData.reduce((acc,e) => {return acc + parseFloat(e.fitness)},0)/numIncidents).toFixed(3);

    // Calculate average cost
    const avgC = (filteredData.reduce((acc,e) => {return acc + parseFloat(e.costTotal)},0)/numIncidents).toFixed(3);

    // Calculate average reopen count
    const avgR = (filteredData.reduce((acc,e) => {return acc + parseFloat(e.reopen)},0)/numIncidents).toFixed(3);

    var svgContainer = d3.select("#metrics")
    // .append("svg")
    // .attr("width", width*3 + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    // // .append("g")
    // // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // svgContainer.append("text")
    // .attr("y", 0)
    // .attr("x", 0)
    // .attr("font-family", "Helvetica")
    // .attr("font-size", "14px")
    // .text("Summary");
    const x = d3.scaleLinear()
    .domain([0, totIncidents])
    .range([0, width])

    const xV = d3.scaleLinear()
    .domain([0, totVariants])
    .range([0, width])

    var svgCount = svgContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svgCount.append("rect")
    .attr("y", 50)
    .attr("x",0)
    .attr("width", x(totIncidents))
    .attr("height", /*height/2*/20)
    .attr("style", "fill:none")
    .style("stroke", "black")
    .style("stroke-width", 2);
    svgCount.append("rect")
    .attr("y", 50)
    .attr("x",0)
    .attr("width", x(numIncidents))
    .attr("height", /*height/2*/20)
    .attr("style", "fill:"+colorRectCat.checked);
    svgCount.append("text")
    .attr("y", 40)
    .attr("x", "0")
    .attr("font-family", "Helvetica")
    .attr("font-size", "22px")
    .text("N. incidents: ")
        .append("tspan")
        .attr("font-weight", "bold")
        .text(numIncidents+" ("+(numIncidents/fullData.length*100).toFixed(2)+"%)");

    var svgVariants = svgContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svgVariants.append("rect")
    .attr("y", 50)
    .attr("x",0)
    .attr("width", xV(totVariants))
    .attr("height", /*height/2*/20)
    .attr("style", "fill:none")
    .style("stroke", "black")
    .style("stroke-width", 2);
    svgVariants.append("rect")
    .attr("y", 50)
    .attr("x",0)
    .attr("width", xV(numVariants))
    .attr("height", /*height/2*/20)
    .attr("style", "fill:"+colorRectCat.checked);
    svgVariants.append("text")
    .attr("y", 40)
    .attr("x", "0")
    .attr("font-family", "Helvetica")
    .attr("font-size", "22px")
    .text("N. variants: ")
        .append("tspan")
        .attr("font-weight", "bold")
        .text(numVariants+" ("+(numVariants/totVariants*100).toFixed(2)+"%)");

    var svgFitness = svgContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svgFitness.append("rect")
    .attr("x", 0)
    .attr("y", 50)
    .attr("width", width-margin.left-margin.right)
    .attr("height", 20)
    .style("fill", avgF < 0.4 ? colorSeverity.critical : avgF > 0.7 ? colorSeverity.none : colorSeverity.high)
    svgFitness.append("text")
    .attr("y", 40)
    .attr("x", "10%")
    .attr("font-family", "Helvetica")
    .attr("font-size", "22px")
    .text("Avg fitness: ")
        .append("tspan")
        .attr("font-weight", "bold")
        .text(avgF);

    var svgCost = svgContainer
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");    
    svgCost.append("rect")
    .attr("x", 0)
    .attr("y", 50)
    .attr("width", width-margin.left-margin.right)
    .attr("height", 20)
    .style("fill", avgC < 0.4 ? colorSeverity.none : avgC > 0.7 ? colorSeverity.critical : colorSeverity.high)
    svgCost.append("text")
    .attr("y", 40)
    .attr("x", "10%")
    .attr("font-family", "Helvetica")
    .attr("font-size", "22px")
    .text("Avg cost: ")
        .append("tspan")
        .attr("font-weight", "bold")
        .text(avgC);
    
    // var svgReopen = svgContainer
    // .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    // .append("g")
    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");    
    // svgReopen.append("text")
    // .attr("y", 40)
    // .attr("x", 0)
    // .attr("font-family", "Helvetica")
    // .attr("font-size", "22px")
    // .text("Avg reopen: ")
    //     .append("tspan")
    // // svgReopen.append("text")
    // //     .attr("y", 65)
    // //     .attr("x", 0)
    // //     .attr("font-family", "Helvetica")
    // //     .attr("font-size", "22px")
    //     .attr("font-weight", "bold")
    //     .text(avgR);
}

function renderLegendError(selector){

    d3.select("#"+selector).selectAll("*").remove();

    var len = 0;
    var offset = 100;
    const dBlock = 20;
    var margin = {top: 10, right: 10, bottom: 20, left: 40},
    width = 550 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

    const keysError = ["Missing", "Repetition", "Mismatch"]
    const keysActivity = ["Detection", "Activation", "Awaiting", "Resolution", "Closure"]
    const colorError = d3.scaleOrdinal()
    .domain(keysError)
    .range([colorDev.miss, colorDev.rep, colorDev.mism]);
    const colorActivity = d3.scaleOrdinal()
    .domain(keysActivity)
    .range([colorDev.N,colorDev.A,colorDev.W,colorDev.R,colorDev.C]);

    var svg = d3.select("#"+selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "auto");

    svg.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .attr("font-family", "Helvetica")
    .text("Errors");
    svg.append("text")
    .attr("x", 180)
    .attr("y", 20)
    .attr("font-family", "Helvetica")
    .text("Activities");

    var legContainerError = svg.selectAll(selector+".itemE")
        .data(keysError)
        .enter().append('g')
        .attr("class", selector+".itemE")
        .attr("transform", function (d, i) {
            if (i === 0) {
                len = d.length + offset 
                return "translate(0,20)"
            } else { 
                var prevLen = len
                len +=  d.length + offset
                // return "translate(" + (prevLen) + ",0)"
                var l = (40*i)+20;
                return "translate(0,"+ l +")";
            }
        });
    legContainerError.append("rect")
    .attr("class", "barErr")
    .attr("x", dBlock)
    .attr("y", dBlock)
    .attr("width", dBlock)
    .attr("height", dBlock)
    .style("fill", function(d){ return colorError(d)})
    .style("stroke", "grey")
    .style("stroke-width", 2)
    //.style("opacity", "0.5");
    legContainerError.append("text")
    .attr("x", dBlock + dBlock*1.2)
    .attr("y", dBlock+ (dBlock/2))
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

    var legContainerActivity = svg.selectAll(selector+".itemA")
        .data(keysActivity)
        .enter().append('g')
        .attr("transform", function (d, i) {
            if (i === 0) {
                len = d.length + offset 
                return "translate(150,-20)"
            } else {
                var l = -20+(30*i)
                return "translate(150,"+ l +")";
            }
        })
    legContainerActivity.append("rect")
        .attr("class", "barAct")
        .attr("x", dBlock)
        .attr("y", 3*dBlock)
        .attr("width", dBlock)
        .attr("height", dBlock)
        .style("fill", function(d){ return colorActivity(d)})
        .style("stroke", "grey")
        .style("stroke-width", 2)
        //.style("opacity", "0.5");
    legContainerActivity.append("text")
        .attr("x", dBlock + dBlock*1.2)
        .attr("y", 3*dBlock + (dBlock/2))
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
}