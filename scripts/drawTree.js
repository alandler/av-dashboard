margin = { top: 20, right: 50, bottom: 20, left: 20 },
    width = 740 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;


function instantiateSVG() {
    var svg = d3.select("#svg").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function drawLegend(){
    console.log("Draw legend")
    console.log(trees)
    var svg = d3.select("svg")
    console.log(Object.values(trees))
    var legend = svg.selectAll("rect")
                .data(Object.keys(trees));
    var legendEnter = legend.enter()
        .append("rect")
        .attr("fill", d => {return trees[d]["color"]})
        .attr("width", 15)
        .attr("height", 15)
        .attr("transform", function (d) {
            return "translate(" + 5 + "," + d*20 + ")";
        })
}

function drawTree(tree) {

    let duration = 400;

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x, d.y]; });

    Object.values(nodes).map(n => {
        if (n.depth > 1) { n.shown = false }
    })

    var nodes = tree["nodes"]
    var edges = tree["edges"]
    var head = tree["head"]

    update(head)

    function update(source) {
        visibleNodes = Object.values(nodes)
        visibleNodes = visibleNodes.filter(obj => obj.shown != 0)

        // Access nodes
        var node = svg.selectAll("g.node")
            .data(visibleNodes, function (d) {
                return d.id || (d.id = ++i);
            });

        //Access the existing nodes
        var nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

        //Add a circle for collapse purposes
        nodeEnter.append("circle")
            .attr("cy", -15)
            .attr("r", 5)
            .attr("fill", d => {
                if (edges[d["id"]].length == 0 || edges[d["id"]][0].shown){
                    return "#ffffff"
                } else {
                    return tree["color"]
                }
            })
            .attr("stroke-width", 10)
            .on("click", toggleCollapse)
            .on("contextmenu", function (d, i) {
                d3.event.preventDefault();
                handleRightClick(d, i);
            });

        nodeEnter.append("g")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("fill-opacity", 1)
            .selectAll("text")
            .data(d => d.label.split("\n"))
            .enter().append("text")
            .text(d => d)
            .attr("dy", function (d, i) {
                return 12 * i
            })
            .on("click", handleMouseClick)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)

        //Create links
        links = getLinks();

        // Declare the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter the links.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", diagonal);

        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + nodes[source].x + "," + nodes[source].y + ")";
            })
            .remove();

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function (d) {
                var o = {
                    "source": { "x": nodes[source].x, "y": nodes[source].y },
                    "target": { "x": nodes[source].x, "y": nodes[source].y }
                }
                return diagonal(o)
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

    }

    function getChildren(source) {
        if (edges[source] == undefined) {
            return []
        }
        else if (edges[source].length == 1) {
            return [nodes[edges[source][0]]]
        } else {
            return [nodes[edges[source][0]], nodes[edges[source][1]]]
        }
    }

    function toggleCollapse(d) {
        let chidren = getChildren(d.id)
        if (chidren.length == 0) {
            return
        } else if (chidren[0].shown) {
            collapse(d.id)
            nodes[d.id].shown = true
        } else {
            showChildren(d.id)
        }
        update(d.id)
    }

    function handleRightClick(d, i) {
        console.log(d)
        if (edges[d["id"]].length == 0) {
            alert("Add a leaf node?")
        } else if (Object.values(edges)) { // TODO
            alert("Add a parent node?")
        }
        else {
            alert("Cannot add a node here!")
        }
        console.log(d)
        console.log(i)
    }
}
