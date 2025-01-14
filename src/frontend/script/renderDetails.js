function renderDatasetAnalysis(fullData){

    d3.select("#overviewBar").selectAll("*").remove();
    d3.select("#containerTraces").selectAll("*").remove();

    var margin = {top: 10, right: 10, bottom: 20, left: 60},
    width = 1600 - margin.left - margin.right,
    height = 70 - margin.top - margin.bottom;

    const allDates = fullDateRange.map(elem => {return {date: new Date(elem), value: 0, ids:[]}});
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
                accumulator[indexReplace] = {date:foundDay.date, value:foundDay.value+1, ids:[...foundDay.ids, elem.incident_id]}
            }
        }
        return accumulator;
    }, allDates);

    const sum = dataIncTime.reduce((partialSum, a) => partialSum + a.value, 0); 

    const part1 = dataIncTime.slice(0, 73);
    const sum1 = part1.reduce((partialSum, a) => partialSum + a.value, 0);
    const part2 = dataIncTime.slice(74, 146);
    const sum2 = part2.reduce((partialSum, a) => partialSum + a.value, 0);
    const part3 = dataIncTime.slice(147, 219);
    const sum3 = part3.reduce((partialSum, a) => partialSum + a.value, 0);
    const part4 = dataIncTime.slice(220, 292);
    const sum4 = part4.reduce((partialSum, a) => partialSum + a.value, 0);
    const part5 = dataIncTime.slice(293, dataIncTime.length);
    const sum5 = part5.reduce((partialSum, a) => partialSum + a.value, 0);

    const distroSum = [sum1, sum2, sum3, sum4, sum5];

    // console.log(sum, sum1, sum2, sum3, sum4, sum5);

    var svg = d3.select("#overviewBar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height*2 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear()
    .domain([0, sum])
    .range([0, width-70])

    svg.append("rect")
    .attr("y", 0)
    .attr("x",0)
    .attr("width", x(sum)+40)
    .attr("height", height)
    .attr("style", "fill:none")
    .style("stroke", "black")
    .style("stroke-width", 2);

    allW = []
    distroSum.map((elem,i) => {
        var sumPrev=0;
        for(var j=0; j<i; j++){
            sumPrev+=x(distroSum[j])
        }
        svg.append("rect")
        .data([i])
        .attr("id", "rect"+i)
        .attr("y", 0)
        .attr("x", i==0 ? 0 : sumPrev)
        .attr("width", x(elem)-20 > 20 ?  x(elem)-20 : 20)
        .attr("height", height)
        .attr("style", "fill:"+colorRectCat.checked)
        .on("click", function(d,i) {
            renderTraces(i);
        });
        allW.push(sumPrev);
    })

    var x1 = d3.scaleTime()
    .domain(dateRange)
    .range([ 0, width-200 ]);

    var x1 = d3.scaleOrdinal()
    .domain([part1[0].date, part2[0].date, part3[0].date, part4[0].date, part5[0].date])
    .range(allW);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x1)
            //.ticks(15/*d3.timeWeek.every(2)*/)
            .tickFormat(d3.timeFormat('%-m/%-d/%y'))
        )

    

    const contDiv = d3.select("#containerTraces");
    
    function renderTraces(num){

        d3.select("#containerTraces").selectAll("*").remove();

        var len = 0;
        const offset = 1;
        const dBlock = 20;
        const colorActivity = d3.scaleOrdinal()
        .domain(["N","A","W","R","C"])
        .range([colorDev.N,colorDev.A,colorDev.W,colorDev.R,colorDev.C]);

        for(var j=0; j<5; j++){
            d3.select("#rect"+j).style("opacity", "0.6");
        }
        var data = [];
        switch(num){
            case 0:
                data = part1;
                d3.select("#rect0").style("opacity", "1");
                break;
            case 1:
                data = part2;
                d3.select("#rect1").style("opacity", "1");
                break;
            case 2:
                data = part3;
                d3.select("#rect2").style("opacity", "1");
                break;
            case 3:
                data = part4;
                d3.select("#rect3").style("opacity", "1");
                break;
            default:
                data = part5;
                d3.select("#rect4").style("opacity", "1");
                break;
        }

        const ids = [...new Set(data.map(e => e.ids).flat())];

        const formatData = filteredData
        .filter(e => {
            return ids.includes(e.incident_id)
        })
        .reduce((acc, elem)=> {
            var structures = acc.map(e => e.structure);
            if(structures.includes(elem.alignment)){
                const currentInc = acc.find(e => e.structure == elem.alignment);
                tmp = acc.filter(e => e.structure != elem.alignment);
                acc = [...tmp, {structure:elem.alignment, count:currentInc.count+1}]
            } else {
                acc = [...acc, {structure:elem.alignment, count:1}]
            }
            return acc;
        }, []);


        var prevW = 0
        var svg = contDiv.append("svg")
        .attr("width", 6000 + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // .append("g")
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        formatData.map((elem,i) => {
            const eventList = elem.structure.split(";").filter(e => !e.includes("M")).map(el => el.split("]")[1]).slice(0, -1);
            //width = eventList.length*dBlock+ margin.left + margin.right + 2*dBlock;

            var container = svg.selectAll("containerTraces"+".item"+i)
            .data(eventList)
            .enter()/*.append('g')
            .attr("transform", function (d, i) {
                if (i === 0) {
                    len = d.length + offset 
                    return "translate(0,0)"
                } else { 
                    var prevLen = len
                    len +=  d.length + offset
                    return "translate(" + (prevLen) + ",0)"
                }
            });*/
    
            const wBar = x(elem.count) > 0 ? x(elem.count)+dBlock : dBlock
    
            container.append("rect")
            .attr("x", function(d,i){i==0 ? prevW += 2*dBlock : prevW+=dBlock/*+wBar*/; return prevW/*(i*dBlock)+wBar*/})
            .attr("y", dBlock)
            .attr("width", dBlock)
            .attr("height", dBlock)
            .style("fill", function(d){return colorActivity(d)})
            .style("stroke", "black")
            .style("stroke-width", 1); 
            container.append("text")
            .attr("y", dBlock+(dBlock/2)+(dBlock/4))
            .attr("x", function(d,i){return /*i==0 ? prevW-2*(eventList.length-i-1)*dBlock :*/ prevW-(eventList.length-i-1)*dBlock/*(i*dBlock)+2+wBar*/})
            .text(function(d){return d});
        });
    }
}


// const xScaleVariants = d3.scaleLinear()
// .domain([0, numIncidents])
// .range([0, width])

// const colors = ["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"];

// var sum = 0;
// data.map((elem,i) => {

//     svg.append("rect")
//     .attr("y", height)
//     .attr("x", sum)
//     .attr("width", xScaleVariants(elem.count))
//     .attr("height", height/2)
//     .attr("style", "fill:"+colors[i%colors.length])
//     .style("stroke", "black")
//     .style("stroke-width", 1);

//     i<5 && svg.append("text")
//     .attr("y", height+15)
//     .attr("x", sum)
//     .attr("font-family", "Helvetica")
//     .text(elem.count)
//         // .append("tspan")
//         .attr("font-weight", "bold");

//     sum += xScaleVariants(elem.count);
// })