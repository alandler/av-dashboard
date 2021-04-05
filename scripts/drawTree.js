rightClickNode = 0

margin = { top: 200, right: 10, bottom: 10, left: 10 },
    width = 1020 - margin.right - margin.left,
    height = 2000 - margin.top - margin.bottom;

mainTree = {
    "nodes": { 0: { "id": 0, "label": "Root node", "x": width / 2, "y": 25, "color": "#999999", "shown": true } },
    "edges": { 0: [] },
    "head": 0
}

function instantiateSVG() {
    var svg = d3.select("#svg").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        // .call(d3.zoom().on("zoom", function () {
        //     svg.attr("transform", d3.event.transform)
        //  }))

    // Border SVG
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.right + margin.left)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 1);

    // Legend border
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", margin.top)
        .attr("width", width + margin.right + margin.left)
        .style("stroke", "black")
        .style("fill", "#FFECD1")
        .style("stroke-width", 1);
}
// function drag(event) {

//     function dragstarted(event, d) {
//       console.log("Start")
//       console.group(event)
//       console.log(d)
//       d3.select(this).raise().attr("stroke", "black");
//     }

//     function dragged(event, d=true) {
//         console.log("Dragged")
//         console.group(event)
//         d3.select(this).attr("x", event.x).attr("y", event.y);
//       d3.select(this).attr("x", d.x = event.x).attr("y", d.y = event.y);
//     }

//     function dragended(event, d) {
//         console.log("Ended")
//       d3.select(this).attr("stroke", null);
//     }

//     return d3.drag()
//         .on("start", dragstarted)
//         .on("drag", dragged)
//         .on("end", dragended);
//   }

var drag = d3.behavior.drag()
    // .origin(function (d) { return d })
    .on('drag', function (d) {
        d3.select(this).attr('x', function (d) { return d.x += d3.event.dx });
        d3.select(this).attr('y', function (d) { return d.y += d3.event.dy });
    })
    .on('dragstart', function (d) {
        d3.event.sourceEvent.stopPropagation()
    })
    .on('dragend', function (d) {
        d3.select(this).remove()
        var nearNode = nearestNode(d.x, d.y)
        console.log("Nearest Node" + nearNode)
        var [newN, newE] = mergeTrees(mainTree["nodes"], trees[d.id]["nodes"],
            mainTree["edges"], trees[d.id]["edges"],
            nearNode, trees[d.id]["head"])
        // console.log(newN)
        var [n, e] = getNodePositions(newN, newE, mainTree["head"], width / 2, 25, -1, false)
        mainTree["nodes"] = n
        mainTree["edges"] = e
        console.log("Post drag main tree")
        console.log(mainTree)
        resetNodes()
        drawLegend();
    })

function nearestNode(x, y) {
    console.log("node nearest to: (" + x +","+y+")")
    var minDist = Infinity
    var minNode = null
    for (var node in mainTree["nodes"]) {
        var diffX = mainTree["nodes"][node]["x"] - x
        var diffY = mainTree["nodes"][node]["y"]+margin.top-15 - y //y is offset from 200, and circle -15 from that
        console.log ("delta x: " + diffX + "... delta y: " + diffY)
        var dist = Math.sqrt(diffX * diffX + diffY * diffY)
        if (dist < minDist) {
            minNode = node
            minDist = dist
        }
    }
    return minNode
}
function drawLegend() {
    d3.selectAll("g.legend").remove()
    var data = []
    for (var key in trees) {
        data.push({ "id": key, "x": 10, "y": key * 30, "color": trees[key]["color"], "description": trees[key]["description"] })
    }
    var svg = d3.select("svg")
    var legend = svg.selectAll("g.rect")
        .remove()
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend");
    legend.append("rect")
        .attr("fill", d => { return d.color })
        .attr("width", 15)
        .attr("height", 15)
        .attr("x", function (d) { return d.x })
        .attr("y", function (d) { return d.y })
        // .attr("transform", function (d) {
        //     return "translate(" + 10 + "," + d * 30 + ")";
        // })
        // .on("ondragstart", dragged)
        .call(drag)
        .on('click', function () {
            if (d3.event.defaultPrevented) return;
            console.log('clicked');
        });
    // .on("ondragstart", dragged)

    legend.append("text")
        .text(d => { return d.description })
        .attr("x", function (d) { return d.x + 20; })
        .attr("y", function (d) { return d.y; })
        .attr("dy", ".7em")
        .attr("text-anchor", "start")
}

function drawTree() {
    var nodes = mainTree["nodes"]
    var edges = mainTree["edges"]
    var head = mainTree["head"]

    let duration = 400
    var i = 0

    var svg = d3.select("svg")
        .append("g")
        .attr("class", "tree")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x, d.y]; });

    Object.values(nodes).map(n => {
        if (n.depth > 1) { n.shown = false }
    })

    update(head)

    function update(source) {
        var nodes = mainTree["nodes"]
        var edges = mainTree["edges"]
        var head = mainTree["head"]
        // console.log("Nodes upon enter update:")
        // console.log(nodes)
        // visibleNodes = Object.values(nodes)
        // visibleNodes = visibleNodes.filter(obj => obj.shown != 0)
        // console.log(visibleNodes)

        //Move new nodes to the end of the list
        childrenIDS = getChildren(source).map(x => x.id)
        visibleNodes = Object.values(nodes).filter(obj => (obj.shown != 0 && !(childrenIDS.includes(obj.id))))
        for (var childID of childrenIDS) {
            if (nodes[childID].shown) {
                visibleNodes.push(nodes[childID])
            }
        }


        // Access nodes
        var node = svg.selectAll("g.node")
            .data(visibleNodes
                // , 
                // function (d) {
                // console.log("g.node")
                // console.log(d)
                // return d.id || (d.id = ++i);}
            );

        //Access the existing nodes
        var nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                // console.log("Change: " + d.id)
                return "translate(" + d.x + "," + d.y + ")";
            })

        //Add a circle for collapse purposes
        nodeEnter.append("circle")
            .attr("cy", -15)
            .attr("r", 5)
            .attr("fill", d => {
                if (edges[d["id"]].length == 0 || edges[d["id"]][0] == undefined) {
                    return "#ffffff"
                }
                // else if (nodes[edges[d["id"]][0]].shown){
                //     return "#ffffff"
                // }
                else {
                    // console.log("Fill" + d["color"])
                    return d["color"]
                }
            })
            .attr("stroke-width", 10)
            .attr("stroke", function (d) {return d["color"]})
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
            .on("click", handleLabelClick)
            .on("mouseover", handleLabelMouseOver)
            .on("mouseout", handleLabelMouseOut)

        //Create links
        links = getLinks(nodes, edges);

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

    drawTree.update = update;

    function getChildren(source) {
        if (edges[source] == undefined || edges[source].length == 0) {
            return []
        }
        else if (edges[source].length == 1) {
            return [nodes[edges[source][0]]]
        } else {
            return [nodes[edges[source][0]], nodes[edges[source][1]]]
        }
    }

    function toggleCollapse(d) {
        let children = getChildren(d.id)
        // console.log("Children of " + d.id)
        // console.log(children)
        if (children.length == 0) {
            return
        } else if (children[0].shown) {
            collapse(d.id)
            nodes[d.id].shown = true
        } else {
            showChildren(d.id)
        }
        // resetNodes()
        // drawTree()
        update(d.id)
    }

    function handleRightClick(d, i) {
        console.log("handle right click")
        rightClickNode = d
        console.log(d, i)
        console.log(d3.event.pageX);
        console.log(document.getElementById("tree-right-click-menu"))
        var menu = document.getElementById("tree-right-click-menu")
        menu.style.left = d3.event.pageX+"px"
        menu.style.top = d3.event.pageY+"px"
        menu.classList.add("context-menu-active")
        menu.classList.remove("context-menu")

        return 
        if (edges[d["id"]].length == 0) {
            confirm("Do you want to add a leaf node?")
        } else if (Object.values(edges)) { // TODO
            alert("Add a parent node?")
        }
        else {
            alert("Cannot add a node here!")
        }
    }

    // ************** D3 Operations *****************
    function collapse(source) {
        nodes[source].shown = false
        if (edges[source] == undefined || edges[source].length == 0) {
            return
        }
        if (edges[source].length == 1) {
            collapse(edges[source][0])
        } else {
            collapse(edges[source][0])
            collapse(edges[source][1])
        }
    }

    function showChildren(source) {
        if (edges[source].length == 1) {
            nodes[edges[source][0]]['shown'] = true
        } else {
            nodes[edges[source][0]]['shown'] = true
            nodes[edges[source][1]]['shown'] = true

            // console.log("Shown:")
            // console.log(edges[source])
            // console.log(nodes[edges[source][0]])
            // console.log(nodes[edges[source][1]])
        }
    }

    function getLinks(nodes, edges) {
        links = []

        for (let node in edges) {
            for (let i = 0; i < edges[node].length; i++) {
                if (nodes[edges[node][i]].shown) {
                    links.push({ "source": nodes[node], "target": nodes[edges[node][i]] })
                }
            }
        }
        return links
    }

    function handleLabelClick(d, field) {
        //Remove previous input boxes
        let toRemove = document.getElementsByClassName("overlayText")[0]
        if (toRemove != undefined) {
            toRemove.parentNode.removeChild(toRemove);
        }

        //Get coordinates
        var rect = this.getBoundingClientRect()
        var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        var y = rect.y + scrollTop

        //Set up input over the svg
        var input = document.createElement("input");
        input.type = "text";
        input.className = "overlayText"
        input.style.zIndex = 2
        input.style.position = "absolute"
        input.style.left = rect.x + 'px'
        input.style.top = y + 'px'
        input.style.width = rect.width + 'px'
        input.style.height = rect.height + 'px'
        input.style.fontSize = 8 + 'px'
        input.value = d
        input.addEventListener('keyup', (e) => changeLabel(e, d, field))
        document.body.appendChild(input);
    }

    function handleLabelMouseOver(d, field) {
        d3.select(this).style('fill', 'darkOrange');
    }

    function handleLabelMouseOut(d, field) {
        d3.select(this).style('fill', 'black');
    }

    function changeLabel(e, d, field) {

        if (!e) { var e = window.event; }
        e.preventDefault();

        // Enter is released
        if (e.keyCode == 13) {
            var newString = mainTree["nodes"][field]["label"].replace(d, e.target.value)
            mainTree["nodes"][field]["label"] = newString
            e.target.remove()
            resetNodes()
        };
    }
}

function getNodeMaxID(nodes) {
    var keys = Object.keys(nodes)
    var asInts = keys.map(x => parseInt(x))
    return Math.max(...asInts)
}

function mergeTrees(nodes1, nodes2, edges1, edges2, target, head2) {
    // console.log("MergeTrees")
    // console.log(edges2)
    //Sanity checks
    if (!(target in Object.keys(nodes1))) {
        alert("Target is not in the destination tree")
        return
    }

    // Get new (non overlapping) IDs for the second tree
    var newNodeIDs = {}
    var maxID = getNodeMaxID(nodes1)
    var nodes2Keys = Object.keys(nodes2)
    for (var i = 0; i < nodes2Keys.length; i++) {
        newNodeIDs[nodes2Keys[i]] = maxID + i + 1
    }

    //exchange nodes2 ids
    var sortedKeysNodes2 = Object.keys(nodes2)
    var copyNodes2 = {}
    for (var i in sortedKeysNodes2) {
        let temp = {}
        temp = Object.assign(temp, nodes2[i]) //Assign temp to value of node
        temp["id"] = newNodeIDs[i]
        copyNodes2[i] = temp
    }
    nodes2 = {}
    for (var i in sortedKeysNodes2) {
        nodes2[newNodeIDs[i]] = copyNodes2[i]
    }

    var copyEdges2 = {}
    for (var i in sortedKeysNodes2) {
        if (edges2[i].length == 0) {
            copyEdges2[i] = []
            continue
        }
        copyEdges2[i] = edges2[i].map(x => newNodeIDs[x])
    }
    edges2 = {}
    for (var i in sortedKeysNodes2) {
        edges2[newNodeIDs[i]] = copyEdges2[i]
    }

    // remove remaining old entries
    for (i = 0; i <= maxID; i++) {
        delete nodes2[i]
        delete edges2[i]
    }

    head2 = newNodeIDs[head2]

    //Execute the merge
    var nodes = { ...nodes1, ...nodes2 }
    var edges = { ...edges1, ...edges2 }
    edges[target].push(head2) //Add the link from the target node to the second tree's head
    // console.log("NODES")
    // console.log(nodes)
    // console.log("EDGES")
    // console.log(edges)

    return [nodes, edges]
}

function resetNodes() {
    var svg = d3.select("svg")
    var node = svg.selectAll("g.tree").remove()
    drawTree()
}

function resetNodesWithNewPositions(){
    var [n, e] = getNodePositions(mainTree["nodes"], mainTree["edges"], mainTree["head"], width / 2, 25, -1, false)
        mainTree["nodes"] = n
        mainTree["edges"] = e

    var svg = d3.select("svg")
    var node = svg.selectAll("g.tree").remove()
    drawTree()
}

function getParent(nodeID){
    for (let i in mainTree["edges"]){
        if (mainTree["edges"][i].includes(nodeID)){
            return i
        }
    }
    return null
}