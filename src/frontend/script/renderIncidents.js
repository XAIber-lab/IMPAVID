/*
TODO: AGGIUSTARE RFC: mettere solo qualche ID
*/

function renderIncidentsBlock(fullData) {

    d3.select("#parallelIncidents").selectAll("*").remove();
    d3.select("#barIncidents").selectAll("*").remove();

    const countCategories = fullData.reduce((accumulator, object) => {
        if(filteredData.map(e => e.incident_id).includes(object.incident_id)){
            if(Object.keys(accumulator).includes(object.category)){
                accumulator[object.category] +=1;
            } else {
                accumulator[object.category] = 1;
            }
        } else {
            accumulator[object.category] = 0;
        }
        return accumulator
    }, {});
    const countCategoriesArr = Object.keys(countCategories).map(elem => {
        return {category: elem, value: countCategories[elem]}
    }).sort((a,b) => b.value - a.value);
    
    const sortCat = countCategoriesArr.sort((a,b) => b.value - a.value).map(e => e.category);
  
    const sortedByCat = fullData.sort( function (a, b) {
        var A = a.category, B = b.category;
        if (sortCat.indexOf(A) > sortCat.indexOf(B)) return 1;
        else return -1;
    });

    renderParallelIncidents(sortedByCat, "parallelIncidents", countCategoriesArr);
    renderBarCategory(countCategoriesArr, fullData, "barIncidents");
}

function renderParallelIncidents(fullData, selector, countCategoriesArr) {

    d3.select("#parallelIncidents").selectAll("*").remove();

    var margin = {top: 30, right: 0, bottom: 10, left: 10},
    width = 400 - margin.left - margin.right,
    height = 490 - margin.top - margin.bottom;

    var svg = d3.select("#"+selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    dimensions = Object.keys(fullData[0]).filter(function(d) { return d == "impact" || d=="urgency" || d=="priority" /*|| d=="rfc" || d=="sla" || d=="category"*/ });
    dimensions.push("category")

    var y = {}
    for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scalePoint()
        .domain( fullData.map(function(p) {return p[name]; }).reverse()/*.sort()*/ )
        .range([height, 0])
    }

    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);
        
    var c = d3.scaleLinear()
    .range([0, 0.8])
    .domain(d3.extent(countCategoriesArr.map(e => e.value)));

    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    var brushP = d3.brushY()
    .on("end", brushParallel)
    .extent([[-20, 0], [20, height]])

    svg.selectAll("myPath")
        .data(fullData)
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("stroke", function(d) {return filteredData.map(e => e.incident_id).includes(d.incident_id) ? colorRectCat.checked : colorRectCat.notChecked; })
        .style("opacity", function(d) {/*console.log(c(countCategoriesArr.find(e => e.category == d.category).value));*/ return c(countCategoriesArr.find(e => e.category == d.category).value)/*filteredData.map(e => e.incident_id).includes(d.incident_id) ? 1 : 0.3;*/ })

    svg.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", function(d) {return "translate(" + x(d) + ")"; })
        .each(function(d) {d == "category" ? 
            d3.select(this).call(d3.axisRight().scale(y[d])) 
            : d3.select(this).call(d3.axisLeft().scale(y[d]))
            .call(brushP)
            .call(d3.brushY().move, brushParallelSelection[d]);; 
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) {return d; })
        .style("fill", "black")

    function brushParallel({selection}, key){
        if(selection){
            selectedAssessment[key] = [];
            if(key === "priority"){
                if(selection[0] <= 0) selectedAssessment[key].push("4 - Low"); //low
                if(selection[0] <= 160 && selection[1] >= 160) selectedAssessment[key].push("3 - Moderate"); //medium
                if(selection[0] <= 320 && selection[1] >= 320) selectedAssessment[key].push("2 - High"); //high
                if(selection[1] >= 480) selectedAssessment[key].push("1 - Critical"); //critical
            } else {
                if(selection[0] <= 0) selectedAssessment[key].push("3 - Low"); //low
                if(selection[0] <= 240 && selection[1] >= 240) selectedAssessment[key].push("2 - Medium"); //medium
                if(selection[1] >= 480) selectedAssessment[key].push("1 - High"); //high
            }
    
        } else {
            selectedAssessment[key] = [];
        }
        brushParallelSelection[key] = selection;
        filterAll(fullData);

        renderMetrics(fullData);
        renderOverviewBlock(fullData);

        renderDeviationsBlock(fullData);
        renderFitnessBlock(fullData);
        renderParallelIncidents(fullData, "parallelIncidents", countCategoriesArr);

        renderPattern();
        renderDatasetAnalysis(fullData);
    }
}

function renderBarCategory(data, fullData, selector){
    const maxVal = d3.max(data, d => d.value);

    var margin = {top: 20, right: 0, bottom: 30, left: 0},
    width = 350 - margin.left - margin.right,
    height = 520 - margin.top - margin.bottom;

    var svg = d3.select("#"+selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
    .domain([0, maxVal])
    .range([ 0, width]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        //.tickFormat(d3.format("d"))
        //.ticks(Math.round(maxVal/2)+1, "d")
    )
    .selectAll("text")
        .style("text-anchor", "end");

    var y = d3.scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.category; })/*.sort().reverse()*/)
    .padding(.1);
    svg.append("g")
    .call(d3.axisLeft(y))

    svg.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "barCat")
    .attr("x", 0 )
    .attr("y", function(d) { return y(d.category); })
    .attr("width", function(d) {return d.value ? x(d.value) : 0; })
    .attr("height", y.bandwidth() )
    .attr("fill", function(d) {return selectedCategories.includes(d.category) ? colorRectCat.checked : colorRectCat.notChecked})
    .style("opacity", 0.5)
    .on("click", function(d,i) {
        if(selectedCategories.includes(i.category)){
            selectedCategories = selectedCategories.filter(e => e !== i.category)
            //d3.select(this).style("opacity", "0.5");
            d3.select(this).attr("fill", colorRectCat.notChecked)
        } else {
            selectedCategories = [...selectedCategories, i.category]
            //d3.select(this).style("opacity", "1");
            d3.select(this).attr("fill", colorRectCat.checked)
        }
        
        // combineFilters(fullDataAlignment, fullIncidentData);
        filterAll(fullData);


        renderMetrics(fullData);
        renderOverviewBlock(fullData);

        renderDeviationsBlock(fullData);
        renderFitnessBlock(fullData);
        renderParallelIncidents(fullData, "parallelIncidents", data);

        renderPattern();
        renderDatasetAnalysis(fullData);

    });
}