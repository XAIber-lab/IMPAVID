/*
TODO: aggiustare width dinamica delle sequenze
*/

function renderOverviewBlock(fullData){

    // d3.select("#focus").selectAll("*").remove();
    d3.select("#focusTraces").selectAll("*").remove();
    d3.select("#focusLine").selectAll("*").remove();
    d3.select("#contextLine").selectAll("*").remove();

    renderSequences("focusTraces");
    
    const allDates = fullDateRange.map(elem => {return {date: new Date(elem), value: 0}});
    var dataIncTime = filteredData.reduce((accumulator, elem) => {
        const start = buildDate(elem.openTs);
        const end = buildDate(elem.closeTs);
        const numDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

        for(var i=0; i<=numDays; i++){
            const nextDay = new Date(start);
            nextDay.setDate(nextDay.getDate()+i);
            const foundDay = accumulator.find(e => {return e.date.toDateString() == nextDay.toDateString()});
            if(foundDay){
                const indexReplace = accumulator.indexOf(foundDay);
                accumulator[indexReplace] = {date:foundDay.date, value:foundDay.value+1}
            }
        }
        return accumulator;
    }, allDates);

    dataIncTime = dataIncTime.sort((a,b) => Date.parse(a.date) - Date.parse(b.date))

    renderLineLog(dataIncTime, "contextLine", fullData)
}

function renderSequences(selector){

    // const w = d3.select("#focus").node().offsetWidth;
    // console.log(w)

    d3.select("#focusTraces").selectAll("*").remove();

    var len = 0;
    const offset = 1;
    const dBlock = 20;

    var margin = {top: 0, right: 5, bottom: 0, left: 10},
    width = 850 - margin.left - margin.right,
    height = 40 - margin.top - margin.bottom;

    const data = filteredData.reduce((acc, elem)=> {
        var structures = acc.map(e => e.structure);
        if(structures.includes(elem.alignment)){
            const currentInc = acc.find(e => e.structure == elem.alignment);
            tmp = acc.filter(e => e.structure != elem.alignment);
            acc = [...tmp, {structure:elem.alignment, count:currentInc.count+1}]
        } else {
            acc = [...acc, {structure:elem.alignment, count:1}]
        }
        return acc;
    }, []).sort((a,b) => b.count - a.count);
    /*to check correctness of data management*/
    // const sumTotal =data.reduce((a, elem) => a+elem.count, 0);
    // console.log(sumTotal);

    const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) {return d.count; }))
    .range([ 4*dBlock, width/2]);

    const colorActivity = d3.scaleOrdinal()
    .domain(["N","A","W","R","C"])
    .range([colorDev.N,colorDev.A,colorDev.W,colorDev.R,colorDev.C]);

    /* to get maximum number of events ==> maximum length */
    // const counters = data.map(object => {
    //     console.log(object);
    //     return object.count;
    //   });
    // const maxVal = Math.max(...counters)*dBlock;

    //data = data.sort((a,b) => b.count - a.count);

    // d3.select("#"+selector).append("text")
    // .attr("x", width/2)
    // .attr("y", 5)
    // .attr("font-family", "Helvetica")
    // .text("Sequence Analysis");

    // var svgHeader = d3.select("#"+selector);
    var svgContainer = d3.select("#"+selector);

    // /*todo: controllare */
    // svgHeader.append("svg")
    // .attr("height", 30)
    // //.attr("width", width/2)
    // .append("text")
    // .attr("x", 10)
    // .attr("y", 20)
    // .attr("text-align", "center")
    // .attr("font-family", "Helvetica")
    // .text("Trace Variants Analysis");
    // // .text("Sequence Analysis  ("+data.length+" variants)");



    // var sliderParam = d3.sliderBottom()
    // .min(0)
    // .max(1)
    // .width(width/2-50)
    // //.tickFormat(d3.format('.2'))
    // //.ticks(10)
    // .default(0)
    // .handle(
    //   d3.symbol()
    //     .type(d3.symbolCircle)
    //     .size(200)()
    // )
    // .on('end', val => sliderChange(val));

    // svgContainer.append("svg")
    // .attr("height", 60)
    // .attr("width", width/2)
    // .append("g")
    // .attr("transform", "translate("+ 20 +"," + 20 + ")")
    // .call(sliderParam);

    // function sliderChange(val){
    //     console.log(val);
    // }



    // TODO: vedi se aggiustare width
    data.map((elem,i) => {
        const eventList = elem.structure.split(";").filter(e => !e.includes("M")).map(el => el.split("]")[1]).slice(0, -1);
        //width = eventList.length*dBlock+ margin.left + margin.right + 2*dBlock;

        //var svg = d3.select("#"+selector)
        var svg = svgContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        var container = svg.selectAll(selector+".item"+i)
        .data(eventList)
        .enter().append('g')
        .attr("transform", function (d, i) {
            if (i === 0) {
                len = d.length + offset 
                return "translate(0,0)"
            } else { 
                var prevLen = len
                len +=  d.length + offset
                return "translate(" + (prevLen) + ",0)"
            }
        });

        const wBar = x(elem.count) > 0 ? x(elem.count)+dBlock : dBlock

        svg.append("rect")
        .attr("x", 0)
        .attr("y", dBlock)
        .attr("width", wBar-dBlock)
        .attr("height", dBlock)
        .style("fill", colorRectCat.checked)
        .style("opacity", 0.5);
        svg.append("text")
        .attr("y", dBlock+(dBlock/2)+(dBlock/4))
        .attr("x", 0)
        .attr("font-family", "Helvetica")
        .text(elem.count + ' ('+(elem.count/filteredData.length*100).toFixed(1)+'%)');

        container.append("rect")
        .attr("x", function(d,i){return (i*dBlock)+wBar})
        .attr("y", dBlock)
        .attr("width", dBlock)
        .attr("height", dBlock)
        .style("fill", function(d){return colorActivity(d)})
        .style("stroke", "black")
        .style("stroke-width", 1); 
        container.append("text")
        .attr("y", dBlock+(dBlock/2)+(dBlock/4))
        .attr("x", function(d,i){return (i*dBlock)+2+wBar})
        .text(function(d){return d});

        // svg.selectAll("text.count")
        // .data(eventList)
        // .enter()
        // .append("text")
        //     .attr("text-anchor", "middle")
        //     .attr("x", (eventList.length)*dBlock+2*dBlock+wBar/*width-margin.left-margin.right*/) 
        //     .attr("y", dBlock+(dBlock/2)+(dBlock/4))
        //     .attr("font-family", "Helvetica")
        //     .text(function(d,i) {return eventList.length-1 == i ? elem.count : ""})
    });
}

function renderFocus(data, selector){

    const filteredDate = data.filter(e => e.date >= dateRange[0] && e.date <= dateRange[1]);

    var margin = {top: 10, right: 30, bottom: 30, left: 60};
    width = 1600/*1100*/ - margin.left - margin.right;
    heightF = 150 - margin.top - margin.bottom;

    var svgF = d3.select("#"+selector)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", heightF + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // svgF.append("text")
    //     .attr("x", width/2)
    //     .attr("y", 20)
    //     .attr("font-family", "Helvetica")
    //     .text("Temporal Analysis")

    var xF = d3.scaleTime()
    .domain(dateRange)
    .range([ 0, width ]);

    svgF.append("g")
        .attr("transform", "translate(0," + heightF + ")")
        .call(d3.axisBottom(xF)
            .ticks(d3.timeWeek.every(2))
            .tickFormat(d3.timeFormat('%-m/%-d/%y'))
        )

    var yF = d3.scaleLinear()
        .domain([0, d3.max(filteredDate, function(d) { return +d.value; })])
        .range([ heightF, 0 ]);

    svgF.append("g")
        .call(d3.axisLeft(yF))

    svgF.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left+20)
        .attr("x", -margin.top)
        .text("Active incidents");

    // Add the line

    svgF.append("path")
        .datum(filteredDate)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) {return xF(d.date) })
            .y(function(d) {return yF(d.value) })
        )
}


function renderLineLog(data, selector, fullData){

    renderFocus(data, "focusLine");

    var margin = {top: 10, right: 30, bottom: 30, left: 60};
    width = 1600/*1100*/ - margin.left - margin.right;
    heightC = 60 - margin.top - margin.bottom;

    var svgC = d3.select("#"+selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", heightC + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis --> it is a date format
   
    var xC = d3.scaleTime()
        .domain(d3.extent(data, function(d) {return d.date; }))
        .range([ 0, width ]);

    
    svgC.append("g")
        .attr("transform", "translate(0," + heightC + ")")
        .call(d3.axisBottom(xC)
            .ticks(d3.timeWeek.every(2))
            .tickFormat(d3.timeFormat('%-m/%-d/%y'))
        )

    // Add Y axis

    var yC = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.value; })])
        .range([ heightC, 0 ]);

    var brushO = d3.brushX()
    .on("end", brushDate)
    .extent([[0, 0], [width, width]]);

    const initialBrush = [xC(dateRange[0]), xC(dateRange[1])];

    const gP = svgC.append("g").call(brushO)
    .call(d3.brushX().move, initialBrush);
    gP.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) {return xC(d.date) })
            .y(function(d) {return yC(d.value) })
        )

    function brushDate({selection}) {
        dateRange = selection.map(xC.invert, xC);
        filterAll(fullData);
        
        renderMetrics(fullData);
        renderSequences("focusTraces");
        d3.select("#focusLine").selectAll("*").remove();
        renderFocus(data, "focusLine")

        renderDeviationsBlock(fullData);
        renderFitnessBlock(fullData)
        renderIncidentsBlock(fullData);

        renderPattern();
        renderDatasetAnalysis(fullData);
    }
}

function buildDate(str){
    var parts = str.split("/");
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
}
