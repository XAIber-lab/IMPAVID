/* TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
- OTTENERE width in modo dinamico
*/

const maxTracesBarchart = 100;

function renderFitnessBlock(fullData) {

    d3.select("#fitnessViolin").selectAll("*").remove();
    d3.select("#fitnessBar").selectAll("*").remove();
    d3.select("#costViolin").selectAll("*").remove();
    d3.select("#costBar").selectAll("*").remove();

    // Render fitness analysis
    // var violinDataFitness = filteredData.map(elem => {
    //     return {metric: "fitness", value: elem.fitness};
    // });
    // var violinDataCost = filteredData.map(elem => {
    //     return {metric: "cost", value: elem.costTotal};
    // });
    const violinData = filteredData.reduce((acc, elem)=> {
        if(acc[0].includes(elem.alignment)){
        } else {
            acc[0].push(elem.alignment);
            acc[1].push({metric: "fitness", value: elem.fitness});
            acc[2].push({metric: "cost", value: elem.costTotal});
        }
        return acc;
    }, [[],[],[]]);


    var filterFitness = filteredData.map(elem => {
        return {incident_id: elem.incident_id, value: elem.fitness};
    }).sort((a, b) => a.value < b.value ? 1 : -1).slice(0, maxTracesBarchart);
    // renderViolinChart(violinDataFitness, fullData, "fitnessViolin", "fitness");
    renderViolinChart(violinData[1], fullData, "fitnessViolin", "fitness");
    renderFitnessBar(filterFitness, "fitnessBar")

    // Render cost analysis
    var filterCostsInPercentage = filteredData.map(elem => {
        const tot = elem.costMissing+elem.costMismatch+elem.costRepetition;
        const percMiss = elem.costMissing*100/tot;
        const percRep = elem.costRepetition*100/tot;
        const percMism = elem.costMismatch*100/tot;
        
        return {incident_id: elem.incident_id, 
            costTot: elem.costTotal, 
            missing: percMiss*elem.costTotal/100, 
            repetition: percRep*elem.costTotal/100, 
            mismatch: percMism*elem.costTotal/100
        };
    });
    const keyFit = filterFitness.map(elem => elem.incident_id);
    filterCostsInPercentage = filterCostsInPercentage.sort((a, b) => keyFit.indexOf(a.incident_id) - keyFit.indexOf(b.incident_id));

    // renderViolinChart(violinDataCost, fullData, "costViolin", "cost");
    renderViolinChart(violinData[2], fullData, "costViolin", "cost");
    renderCostStackedBar(filterCostsInPercentage, "costBar")
}

function renderViolinChart(data, fullData, selector, metric){
    const jitterWidth = 30;

    var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 250 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    var svg = d3.select("#"+selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var brushV = d3.brushY()
    .on("end", brushAxis)
    .extent([[0, 0], [height, height]])
    
    // Y scale
    var y = d3.scaleLinear()
    .domain([0,1])
    .range([height, 0]);
    
    //const initialBrush = metric === "fitness" ? [y(fitnessRange[0]), y(fitnessRange[1])] : [y(costRange[0]), y(costRange[1])]
    svg.append("g")
    .attr("class", metric == "fitness" ? "brushFitness" : "brushCost")
    .call(d3.axisLeft(y))
    .call(brushV)
    .call(d3.brushY().move, brushViolinSelection[metric]);

    // X scale
    var x = d3.scaleBand()
    .range([ 0, width ])
    .domain([metric])
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

    var histogram = d3.histogram()
        .domain(y.domain())
        .thresholds(y.ticks(10))
        .value(d => d)

    var sumstat = d3.rollup(data, d => {
        input = d.map(function(g) { return g.value;})
        bins = histogram(input)
        return(bins)
    }, d=> d.metric)

    sumstat = Array.from(sumstat, ([name, value]) => ({ name, value }));

    var maxNum = 0
    for ( i in sumstat ){
    allBins = sumstat[i].value
    lengths = allBins.map(function(a){return a.length;})
    longuest = d3.max(lengths)
    if (longuest > maxNum) { maxNum = longuest }
    }

    var xNum = d3.scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum,maxNum])

    const domainArray = [0, threshold.low, threshold.medium, threshold.high, 1];
    const domain = metric == "fitness" ? domainArray.reverse(): domainArray;
    const color = d3.scaleLinear()
    .domain(domain)
    .range([colorSeverity.none,colorSeverity.low,colorSeverity.medium,colorSeverity.high,colorSeverity.critical]);

    svg.selectAll("myViolin")
    .data(sumstat)
    .enter()
    .append("g")
        .attr("transform", function(d){return("translate(" + x(d.name) +" ,0)") } )
    .append("path")
        .datum(function(d){ return(d.value)})
        .style("stroke", "black")
        .style("fill", "#a6bddb")
        .attr("d", d3.area()
            .x0( xNum(0) )
            .x1(function(d){ return(xNum(d.length)) } )
            .y(function(d){ return(y(d.x0)) } )
            .curve(d3.curveCatmullRom)
        )
    
    svg.selectAll("indPoints")
    .data(data)
    .enter()
    .append("circle")
        .attr("cx", function(d){return(x(d.metric) + x.bandwidth()/2 - Math.random()*jitterWidth )})
        .attr("cy", function(d){return(y(d.value))})
        .attr("r", 3)
        .style("fill", function(d){ return(color(d.value))})
        .attr("stroke", "white")

    function brushAxis({selection}) {
        if(selection){
            brushViolinSelection[metric] = selection;
            metricRange = selection.map(y.invert, y);
            if(metric == "fitness") fitnessRange = metricRange
            else costRange = metricRange
    
        } else {
            brushViolinSelection[metric] = [];
            if(metric == "fitness") fitnessRange = [1,0];
            else costRange = [1,0];
        }
        filterAll(fullData);

        var filterFitness = filteredData.map(elem => {
            return {incident_id: elem.incident_id, value: elem.fitness};
        }).sort((a, b) => a.value < b.value ? 1 : -1).slice(0, maxTracesBarchart);
        var filterCostsInPercentage = filteredData.map(elem => {
            const tot = elem.costMissing+elem.costMismatch+elem.costRepetition;
            const percMiss = elem.costMissing*100/tot;
            const percRep = elem.costRepetition*100/tot;
            const percMism = elem.costMismatch*100/tot;
            
            return {incident_id: elem.incident_id, 
                costTot: elem.costTotal, 
                missing: percMiss*elem.costTotal/100, 
                repetition: percRep*elem.costTotal/100, 
                mismatch: percMism*elem.costTotal/100
            };
        });
        const keyFit = filterFitness.map(elem => elem.incident_id);
        filterCostsInPercentage = filterCostsInPercentage.sort((a, b) => keyFit.indexOf(a.incident_id) - keyFit.indexOf(b.incident_id));

        d3.select("#fitnessBar").selectAll("*").remove();
        d3.select("#costBar").selectAll("*").remove();
        renderFitnessBar(filterFitness, "fitnessBar");
        renderCostStackedBar(filterCostsInPercentage, "costBar")

        renderMetrics(fullData);
        renderOverviewBlock(fullData);
        
        renderDeviationsBlock(fullData);
        renderIncidentsBlock(fullData);

        renderPattern();
        renderDatasetAnalysis(fullData);
        
    }
}

function renderFitnessBar(data, selector){
    const margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = 550 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    const svg = d3.select("#"+selector)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(d => d.incident_id));
    var xAxis = d3.axisBottom(x)
    .tickValues(0);//x.domain().filter(function(d,i){ return !(i%10)}));
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height + margin.top + 10)
        .text("traces");

    // Y axis
    const y = d3.scaleLinear()
    .domain([0, 1])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("fitness");

    // Bars
    svg.selectAll("mybar")
    .data(data)
    .join("rect")
        .attr("x", d => x(d.incident_id))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "#a6bddb");
}

function renderCostStackedBar(data,selector){
    const margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = 550 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

    var svg = d3.select("#"+selector)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var subgroups = ["missing", "repetition", "mismatch"];

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range([colorDev.miss, colorDev.rep, colorDev.mism]);

    var stackedData = d3.stack()
    .keys(subgroups)(data)

    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.incident_id));
    var xAxis = d3.axisBottom(x)
        .tickValues(0);//x.domain().filter(function(d,i){ return !(i%10)}));
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height + margin.top + 10)
        .text("traces");

    // Y axis
    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("cost");

    // Bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
            .attr("x", function(d) {return x(d.data.incident_id); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
}



// const filterSeverity = alignmentData.reduce((accumulator, object) => {
//     switch(object.severity){
//         case "none":
//             accumulator[0].value++
//             break;
//         case "low":
//             accumulator[1].value++
//             break;
//         case "medium":
//             accumulator[2].value++
//             break;
//         case "high":
//             accumulator[3].value++
//             break;
//         case "critical":
//             accumulator[4].value++
//             break;
//         default:
//             break;
//     }
//     return accumulator;
// }, [{severity:"none", value:0}, {severity:"low", value:0}, {severity:"medium", value:0}, {severity:"high", value:0}, {severity:"critical", value:0}]);
// //console.log(filterSeverity)

// //renderSeverityBar(filterSeverity, "severityBar")




// function renderSeverityBar(data,selector){

//     var maxVal = d3.max(data, d => d.value);

//     // set the dimensions and margins of the graph
//     const margin = {top: 30, right: 30, bottom: 70, left: 60},
//     width = 460 - margin.left - margin.right,
//     height = 200 - margin.top - margin.bottom;

//     // append the svg object to the body of the page
//     const svg = d3.select("#"+selector)
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//     // X axis
//     const x = d3.scaleBand()
//     .range([ 0, width ])
//     .domain(data.map(d => d.severity))
//     .padding(0.2);
//     var xAxis = d3.axisBottom(x);
//     svg.append("g")
//     .attr("transform", `translate(0, ${height})`)
//     .call(xAxis)
//     .selectAll("text")
//     .attr("transform", "translate(-10,0)rotate(-45)")
//     .style("text-anchor", "end");

//     // Add Y axis
//     const y = d3.scaleLinear()
//     .domain([0, maxVal])
//     .range([ height, 0]);
//     svg.append("g")
//     .call(d3.axisLeft(y));

//     // Bars
//     svg.selectAll("mybar")
//     .data(data)
//     .join("rect")
//     .attr("x", d => x(d.severity))
//     .attr("y", d => y(d.value))
//     .attr("width", x.bandwidth())
//     .attr("height", d => height - y(d.value))
//     .attr("fill", "#69b3a2");
// }