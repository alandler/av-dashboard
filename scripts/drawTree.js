// ************** Drag MAINTREE ONLY *****************

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
        addExpert = true
        d3.select(this).remove()
        console.log("X: " + d.x +" ...Y: " + d.y)
        var nearNode = nearestNode(d.x, d.y)
        console.log("dragged" + nearNode)
        console.log(JSON.stringify(d))
        sessionStorage.setItem("addExpert", true)
        addExpert = true
        if (isExpertIDInMainTree(d["id"]) == true) {
            alert("That expert is already in the tree. To change its location, remove it and drag again.")
        } else if (isNodeIDAnExpert(nearNode) == true) {
            alert("Do not add an expert below an expert.")
        }else {
            var tempTree = parseSessionStorage("expertTree")
            expertTree = trees[d["id"]]
            sessionStorage.setItem("expertTree", JSON.stringify(expertTree))
            console.log(expertTree["description"])
            addLeaf(e, nearNode, trees[d["id"]]["color"], d["id"], mainTree)
            expertTree = tempTree
            sessionStorage.setItem("expertTree", JSON.stringify(expertTree))
            // autosizeSVGWidthHeight()
            // IF the expert is already in the meta controller... prompt to delete and re add
            console.log(mainTree)
            console.log(isExpertIDInMainTree(d["id"]))
            console.log("SE E AOEVE")
            staticAutosize()
            var [n, e] = getNodePositions(mainTree["nodes"], mainTree["edges"], mainTree["head"], width / 2, 25, -1, false, getMaxDepth(mainTree))
            mainTree["nodes"] = n
            mainTree["edges"] = e
            // setLabelShowns()
            addExpert = false
            sessionStorage.setItem("addExpert", false)
            sessionStorage.setItem("metaController", JSON.stringify(mainTree))
        }
        console.log("trees after drag")
        console.log(trees)
        redoSVG();
    })
function isNodeIDAnExpert(ID){
    if (mainTree["nodes"][ID]["expertID"]){
        return true
    }
    return false
}
function isExpertIDInMainTree(ID) {
    for (var node in mainTree["nodes"]) {
        if (mainTree["nodes"][node].expertID == ID) {
            return true
        }
    }
    return false
}

function nearestNode(x, y) {
    var minDist = Infinity
    var minNode = null
    for (var node in mainTree["nodes"]) {
        var diffX = mainTree["nodes"][node]["x"] - x
        var diffY = mainTree["nodes"][node]["y"] + margin.top - 15 - y //y is offset from 200, and circle -15 from that
        var dist = Math.sqrt(diffX * diffX + diffY * diffY)
        if (dist < minDist) {
            minNode = node
            minDist = dist
        }
    }
    return minNode
}

//TODO: Columns as these grow
function drawLegend() {
    console.log("Draw legend with the following mainTree")
    console.log(trees)
    d3.selectAll("g.legend").remove()
    var data = []

    //Dynamically create objects for each tree
    for (var key in trees) {
        var xShift = Math.floor(key / 7) * 200
        var extraY = 0
        if (xShift > 0) {
            extraY = 30
        }
        var yShift = key % 7
        data.push({ "id": key, "x": 10 + xShift, "y": yShift * 30 + extraY, "color": trees[key]["color"], "description": trees[key]["description"] })
    }

    //Write onto the existing SVG
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
        .call(drag)
        .on('click', function () {
            if (d3.event.defaultPrevented) return;
        });

    // Add descriptions
    legend.append("text")
        .text(d => { return d.description })
        .attr("x", function (d) { return d.x + 20; })
        .attr("y", function (d) { return d.y + 2; })
        .attr("dy", ".7em")
        .attr("text-anchor", "start")
}

function drawTree(tree) {
    var nodes = tree["nodes"]
    var edges = tree["edges"]
    var head = tree["head"]
    convertLeafLabelAction(tree)

    let duration = 400
    var i = 0

    var svg = d3.select("svg")
        .append("g")
        .attr("class", "tree")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.x, d.y]; });

    //Only do this if it's the first upload
    // Object.values(nodes).map(n => {
    //     if (n.depth > 1) { n.shown = false }
    // })

    update(head)

    function update(source) {
        var nodes = tree["nodes"]
        var edges = tree["edges"]
        var head = tree["head"]

        //Only visible nodes
        var nodeList = Object.values(nodes)
        visibleNodes = nodeList.filter(obj => (obj.shown != 0))


        // Access nodes
        var node = svg.selectAll("g.node")
            .data(visibleNodes, function (d) { return d.id; });

        //Access the existing nodes
        var nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
            .attr("id", function (d) {
                return "node-" + d.id
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })

        //Add a circle for collapse purposes
        nodeEnter.append("circle")
            .attr("cy", -8)
            .attr("r", 5)
            .attr("fill", d => {
                if (edges[d["id"]].length == 0 || !edges[d["id"]][0]) {
                    return "#ffffff"
                }
                // else if (nodes[edges[d["id"]][0]].shown){
                //     return "#ffffff"
                // }
                else {
                    return d["color"]
                }
            })
            .attr("stroke-width", 6)
            .attr("stroke", function (d) { return d["color"] })
            .on("click", toggleCollapse)
            .on("contextmenu", function (d, i) {
                d3.event.preventDefault();
                handleRightClick(d, i);
                // redoSVG()
            });

        nodeEnter.append("text")
            .attr("text-anchor", "middle")
            .style("fill-opacity", 1)
            .text(function (d) {
                if (!nodes[d["id"]]["show_label"] || nodes[d["id"]]["show_label"] == false) {
                    return ""
                } else {
                    return d["label"]
                }
            })
            .attr("dy", function (d, i) {
                var parent = getParent(d["id"], tree)
                var j = 0
                if (parent != null) {
                    if (d["id"] != edges[parent][0] && (d["depth"] > 3 && tree == mainTree)) {
                        j = .65
                    }
                }
                return (.65 + j) + "em"
            })
            .on("click", function (d) { handleLabelClick(d, this) })
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
        if (!edges[source] || edges[source].length == 0) {
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
        if (children.length == 0) {
            return
        } else if (children[0].shown) {
            collapse(d.id)
            // shiftVisibleNodes()
            nodes[d.id].shown = true
            // redoSVG()
        } else {
            showChildren(d.id)
        }
        // resetNodes()
        // drawTree()
        update(d.id)
    }

    function handleRightClick(d, i) {
        rightClickNode = d
        var menu = document.getElementById("tree-right-click-menu")
        menu.style.left = d3.event.pageX + "px"
        menu.style.top = d3.event.pageY + "px"
        menu.classList.add("context-menu-active")
        menu.classList.remove("context-menu")
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

    function handleLabelClick(d, element) {
        //Remove previous input boxes
        let toRemove = document.getElementsByClassName("overlayText")[0]
        if (toRemove != undefined) {
            toRemove.parentNode.removeChild(toRemove);
        }

        //Get coordinates
        var rect = element.getBoundingClientRect()
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
        input.value = d["label"]
        // input.onblur = (e) => { e.target.remove() }
        input.addEventListener('keyup', (e) => changeLabel(e, element.parentNode.id.substring(5)))
        document.body.appendChild(input);
    }

    function handleLabelMouseOver(d, field) {
        d3.select(this).style('fill', 'darkOrange');
    }

    function handleLabelMouseOut(d, field) {
        d3.select(this).style('fill', 'black');
    }

    function changeLabel(e, field) {
        if (!e) { var e = window.event; }
        e.preventDefault();

        // Enter is released
        if (e.keyCode == 13) {
            tree["nodes"][field]["label"] = e.target.value
            e.target.remove()
            resetNodes(tree)
        };
    }
}

// ************** Instantiating Functions *****************
function instantiateSVG(legend = true) {
    console.log("Draw legend")
    console.log(trees)
    var svg = d3.select("#svg").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)

    // Border SVG
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.right + margin.left)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 1);

    if (legend == true) {
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
}

// ************** Reset Functions *****************
function resetNodes(tree) {
    var svg = d3.select("svg")
    var node = svg.selectAll("g.node").remove()
    drawTree(tree)
}

function redoSVG(tree = mainTree, legend = true) {
    // var oldWidth = width
    var svg = d3.select("svg").remove()
    // autosizeSVGWidthHeight(tree)
    staticAutosize(tree)
    // for (var nodeID in mainTree["nodes"]) {
    //     tree["nodes"][nodeID]["x"] += width / 2 - oldWidth / 2
    // }
    instantiateSVG()
    if (legend == true) {
        drawLegend()
    }
    drawTree(tree)
}