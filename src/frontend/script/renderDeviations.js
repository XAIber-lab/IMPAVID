/* TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
- OTTENERE width in modo dinamico
*/
const minW = 20;

function renderDeviationsBlock(fullData) {
    const sorter = (a, b) => parseInt(a.totMissing)+parseInt(a.totRepetition)+parseInt(a.totMismatch) < parseInt(b.totMissing)+parseInt(b.totRepetition)+parseInt(b.totMismatch) ? 1 : -1;
    const sortedErrors = fullData.filter(inc => parseInt(inc.totMissing)+parseInt(inc.totRepetition)+parseInt(inc.totMismatch)>0).sort(sorter);
    const sortedFilteredErrors = filteredData.sort(sorter);
    
    d3.select("#barMissing").selectAll("*").remove();
    d3.select("#barRepetition").selectAll("*").remove();
    d3.select("#barMismatch").selectAll("*").remove();

    d3.select("#divTopOne").selectAll("*").remove();
    d3.select("#divTopTwo").selectAll("*").remove();
    d3.select("#divTopThree").selectAll("*").remove();

    d3.select("#stateDeviations").selectAll("*").remove();

    // Render bars for each error category    
    renderActivityBars(sortedFilteredErrors, "missing", "barMissing");
    renderActivityBars(sortedFilteredErrors, "repetition", "barRepetition");
    renderActivityBars(sortedFilteredErrors, "mismatch","barMismatch");
    
    // // Render bars for the top 3 wrong traces
    // renderErrorsBars(sortedErrors[0], "divTopOne");
    // renderErrorsBars(sortedErrors[1], "divTopTwo");
    // renderErrorsBars(sortedErrors[2], "divTopThree");
    
    // Render state block
    renderState(sortedFilteredErrors, "stateDeviations");
}

/* ERROR CATEGORY BLOCK */
function renderActivityBars(alignments, error, selector){

    const objDeviations = sumErrorsDeviation(alignments, error);
    const sumTotal = Object.values(objDeviations).reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    const data = [{error:error, ...objDeviations}]
    const subgroups = ["N","A","W","R","C"];

    var margin = {top: 10, right: 10, bottom: 20, left: 40},
    width = 500 - margin.left - margin.right,
    height = 55 - margin.top - margin.bottom;

    var svg = d3.select("#"+selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height*2 + margin.top /*+ margin.bottom*/)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
    .domain([0, sumTotal])
    .range([0, width-40]) //TODO: modificare

    var y = d3.scaleBand()
    .domain(data.map(d => d.error))
    .range([ height, 0 ])
    .padding([0.2]);

    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range([colorDev.N,colorDev.A,colorDev.W,colorDev.R,colorDev.C]);

    var stackedData = d3.stack()
    .keys(subgroups)(data)

    var count=0;
    const dim = stackedData.reduce((acc, elem, i) => {
        const d = elem[0];
        const wCurr = x(d[1]) - x(d[0]) < minW && x(d[1]) - x(d[0])!=0 ? minW : x(d[1]) - x(d[0]);
        x(d[1]) - x(d[0]) < minW && x(d[1]) - x(d[0])!=0 && count++;
        var xCurr;

        if(wCurr>0 && i!=0){
            xCurr = acc[i-1].x+acc[i-1].w;
        } else {
            xCurr=0;
        }
        return [...acc, {err:d.data.error, k: elem.key, w: wCurr, x:xCurr, val:d[1]-d[0]}]
    }, []);

    const colorTop = error=="missing" ? colorDev.miss : error=="repetition" ? colorDev.rep : colorDev.mism;
    sumTotal>0 && svg.append("rect")
    .attr("y", 0)
    .attr("x",0)
    .attr("width",x(sumTotal)+minW*count)
    .attr("height", height)
    .attr("style", "fill:"+colorTop)
    .style("stroke", "black")
    .style("stroke-width", 1);
    sumTotal>0 && svg.append("text")
    .attr("y", height/2+5)
    .attr("x",width/2)
    .attr("font-family", "Helvetica")
    .text(sumTotal)

    svg.append("g")
    .selectAll("rect")
    .data(dim)
    .enter().append("rect")
        .attr("x", function(d) {
            /*const w = x(d[1]) - x(d[0]) < 20 && x(d[1]) - x(d[0])!=0 ? 20 : x(d[1]) - x(d[0]);
            if(d[1] == sumTotal) return x(d[0])
            return x(d[1])-w;
            console.log(x(d[0]));
            return x(d[0]);*/
            return d.x;
        })
        .attr("width", function(d) {
            /*return x(d[1]) - x(d[0]) < 20 && x(d[1]) - x(d[0])!=0 ? 20 : x(d[1]) - x(d[0]);
            return x(d[1]) - x(d[0]);*/
            return d.w;
        })
        .attr("y", function(d) {/*return y(d.data.error)+height;*/ return y(d.err)+height; })
        .attr("height", y.bandwidth())
        .attr("fill", function(d) {return color(d.k); })
        .style("stroke", "black")
        .style("stroke-width", 1);

    svg.selectAll("text.activity")
    .data(dim)
    .enter()
    .append("text")
        .attr("text-anchor", "middle")
        .attr("x", function(d) {/*return x(d[0][0]);*/return d.x+(d.w/2) })
        .attr("y",  function(d) {return y(d.err)*4+height})
        .attr("font-family", "Helvetica")
        .text(function(d) {/*return d[0][1]-d[0][0] == 0 ? "" : d[0][1]-d[0][0]*/return d.val == 0 ? "" : d.val})
}

function renderErrorsBars(objAlignment, selector){

    const sumTotal = objAlignment.totMissing+objAlignment.totRepetition+objAlignment.totMismatch;
    const data = [{error: "tot", missing: objAlignment.totMissing, repetition:objAlignment.totRepetition, mismatch:objAlignment.totMismatch}]
    const subgroups = ["missing","repetition","mismatch"];
    const fullW = 350;//selector == "stateDeviations" ? 800 : 400;

    var margin = {top: 0, right: 10, bottom: 20, left: 40},
    width = fullW - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

    var svg = d3.select("#"+selector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height*2 + margin.top /*+ margin.bottom*/)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
    var x = d3.scaleLinear()
    .domain([0, sumTotal])
    .range([0, width-100])
    
    var y = d3.scaleBand()
    .domain(data.map(d => d.error))
    .range([ height, 0 ])
    .padding([0.2]);
    
    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range([colorDev.miss,colorDev.rep,colorDev.mism]);
    
    var stackedData = d3.stack()
    .keys(subgroups)(data)
    
    var count=0;
    const dim = stackedData.reduce((acc, elem, i) => {
        const d = elem[0];
        const wCurr = x(d[1]) - x(d[0]) < minW && x(d[1]) - x(d[0])!=0 ? minW : x(d[1]) - x(d[0]);
        x(d[1]) - x(d[0]) < minW && x(d[1]) - x(d[0])!=0 && count++;
        var xCurr;
        
        if(wCurr>0 && i!=0){
            xCurr = acc[i-1].x+acc[i-1].w;
        } else {
            xCurr=0;
        }
        return [...acc, {err:d.data.error, k: elem.key, w: wCurr, x:xCurr, val:d[1]-d[0]}]
    }, []);

    sumTotal>0 && svg.append("text")
    .attr("y", 25/*y("tot")+height+15*/)
    .attr("x", 0)
    .attr("font-family", "Helvetica")
    .text(objAlignment.incident_id)
    
    svg.append("g")
    .selectAll("rect")
    .data(dim)
    .enter().append("rect")
        .attr("x", function(d) {
            /*
            // const w = x(d[1]) - x(d[0]) < 20 && x(d[1]) - x(d[0])!=0 ? 20 : x(d[1]) - x(d[0]);
            // if(d[1] == sumTotal) return x(d[0])
            // return x(d[1])-w;
            return x(d[0]);*/
            return d.x/*+100*/;
        })
        .attr("width", function(d) {
            /*
            //return x(d[1]) - x(d[0]) < 20 && x(d[1]) - x(d[0])!=0 ? 20 : x(d[1]) - x(d[0]);
            return x(d[1]) - x(d[0]);*/
            return d.w;
        })
        .attr("y", function(d) {/*return y(d.data.error)+height;*/return y(d.err)+height; })
        .attr("height", y.bandwidth())
        .attr("fill", function(d) {return color(d.k); })
        .style("stroke", "black")
        .style("stroke-width", 1);

    svg.selectAll("text.error")
    .data(dim)
    .enter()
    .append("text")
        .attr("text-anchor", "middle")
        .attr("x", function(d) {/*return x(d[0][0]);*/return d.x+(d.w/2)/*+100*/ })
        .attr("y",  function(d) {return y("tot")+height+15/*y(d.err)*4+height+100*/})
        .attr("font-family", "Helvetica")
        //.attr("font-size", "15px")
        .text(function(d) {/*return d[0][1]-d[0][0] == 0 ? "" : d[0][1]-d[0][0]*/return d.val == 0 ? "" : d.val})

}

function renderState(alignments, selector) {
    for(var i=0;i</*alignments.length*/50;i++){
        renderErrorsBars(alignments[i],selector)
    }
}

/* AUXILIARY FUNCTIONS */
function sumErrorsDeviation(data, error){
    return data.reduce((accumulator, object) => {
        obj = object[error]
        return {
            N: accumulator.N + obj.N,
            A: accumulator.A + obj.A,
            W: accumulator.W + obj.W || 0,
            R: accumulator.R + obj.R,
            C: accumulator.C + obj.C,
        }
    }, {N:0, A:0, W:0, R:0, C:0});
}