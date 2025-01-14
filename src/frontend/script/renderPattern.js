function renderRadviz(data,selector){
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // // append the svg object to the body of the page
    // var svg = d3.select("#"+selector)
    // .append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //     .attr("class", "radv")
    // .append("g")
    //     .attr("transform",
    //         "translate(" + margin.left + "," + margin.top + ")");

    // console.log(set);
    const radviz = d3.radviz()
    .data(data/*,set*/)
    // const set = radviz.data().dimensions.map(d => !d.incident_id)
    
    radviz.setMargin(0)
    //radviz.updateRadviz([4,2,1,3,0])
    // let prova = function(_) {
    //     console.log("I have connected the fuction to the click action on a point in radviz", _)
    // }
    // radviz.setFunctionClick(prova)
    // let results1 = function(error_value) {
    //     console.log(error_value.toFixed(4))
    // }
    // radviz.setFunctionUpdateResults(results1)
    //radviz.setRightClick(false)
    //radviz.disableDraggableAnchors(false)
    //radviz.setDefaultColorPoints('purple')

    // radviz.setFunctionMouseOver((d,i) => {
    //     console.log(data);
    //     console.log(d,i);
    // });
    radviz.setColorClassification("impact");
    // radviz.setDefaultColorPoints("purple");
    // radviz.setColorPoint(2);
    
    d3.select('#'+selector)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(radviz)


    // const radviz1 = d3.radviz()
    // d3.csv('data/12-CSM.csv').then(dataset => {
    //     radviz1.data(dataset)
    //     const set = radviz1.data().dimensions.map(d => d.values)
    //     d3.select('#container1').call(radviz1)
    // })
    // const radviz2 = d3.radviz()
    // d3.csv('data/12-CSM.csv').then(dataset => {
    //     radviz2.data(dataset)
    //     const set = radviz2.data().dimensions.map(d => d.values)
    //     d3.select('#container2').call(radviz2)
    // })
    // const radviz3 = d3.radviz()
    // d3.csv('data/12-CSM.csv').then(dataset => {
    //     radviz3.data(dataset)
    //     const set = radviz3.data().dimensions.map(d => d.values)

    //     d3.select('#container3').call(radviz3)
    // })
}

function renderPattern() {
    d3.select("#patternChart").selectAll("*").remove(); //patternChart

    const data = filteredData.map(elem => {
        return {
            ...elem,
            impact: parseInt(elem.impact.split(" ")[0]),
            urgency: parseInt(elem.urgency.split(" ")[0]),
            priority: parseInt(elem.priority.split(" ")[0]),
            // incident_id: parseInt(elem.incident_id.split("C")[1])
        }
    })

    renderRadviz(data, "patternChart"); //patternChart
}