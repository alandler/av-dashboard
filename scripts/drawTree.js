function getLeaves(tree = mainTree) {
    var leaves = []
    for (let node in tree["nodes"]) {
        if (tree["edges"][node].length != 1 && tree["edges"][node].length != 2) {
            leaves.push(node)
        }
    }
    return leaves
}

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
        // var [newN, newE] = mergeTrees(mainTree["nodes"], trees[d.id]["nodes"],
        //     mainTree["edges"], trees[d.id]["edges"],
        //     nearNode, trees[d.id]["head"])
        // mainTree["nodes"] = newN
        // mainTree["edges"] = newE
        addLeaf(undefined, nearNode, mainTree, trees[d.id]["color"], d.id)
        autosizeSVGWidthHeight()
        var [n, e] = getNodePositions(mainTree["nodes"], mainTree["edges"], mainTree["head"], width / 2, 25, -1, false, getMaxDepth(mainTree))
        mainTree["nodes"] = n
        mainTree["edges"] = e
        setLabelShowns()
        // resetNodes()
        // drawLegend();
        redoSVG();
    })

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
        });
    // .on("ondragstart", dragged)

    legend.append("text")
        .text(d => { return d.description })
        .attr("x", function (d) { return d.x + 20; })
        .attr("y", function (d) { return d.y; })
        .attr("dy", ".7em")
        .attr("text-anchor", "start")
}

function drawTree(tree = mainTree) {
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
                if (edges[d["id"]].length == 0 || edges[d["id"]][0] == undefined) {
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
                redoSVG()
            });

        nodeEnter.append("text")
            .attr("text-anchor", "middle")
            .style("fill-opacity", 1)
            .text(function (d) {
                if (nodes[d["id"]]["show_label"] == undefined || nodes[d["id"]]["show_label"] == false) {
                    return ""
                } else {
                    return d["label"]
                }
            })
            .attr("dy", function (d, i) {
                var parent = getParent(d["id"], tree)
                var j = 0
                if (parent != null) {
                    if (d["id"] != edges[parent][0] && d["depth"] > 5) {
                        j = .65
                    }
                }
                return (.65 + j) + "em"
            })
            .on("click", function (d) { handleLabelClick(d, this) })
            .on("mouseover", handleLabelMouseOver)
            .on("mouseout", handleLabelMouseOut)


        // nodeEnter.append("g")
        //     .attr("dy", ".35em")
        //     .attr("text-anchor", "middle")
        //     .style("fill-opacity", 1)
        //     .selectAll("text")
        //     .data(d => d.label.split("\n"))
        //     .enter().append("text")
        //     .text(d => d)
        //     .attr("dy", function (d, i) {
        //         return 12 * i
        //     })
        //     .on("click", handleLabelClick)
        //     .on("mouseover", handleLabelMouseOver)
        //     .on("mouseout", handleLabelMouseOut)

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
        if (children.length == 0) {
            return
        } else if (children[0].shown) {
            collapse(d.id)
            shiftVisibleNodes()
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
        if (parseSessionStorage("addExpert") == true) {
            var yes = confirm("Do you want to add to this node?")
            if (yes == true) {
                addLeaf(e, d.id, mainTree, parseSessionStorage("expertTree")["color"])
                sessionStorage["addExpert"] = false
                return
            }
        }

        rightClickNode = d
        var menu = document.getElementById("tree-right-click-menu")
        menu.style.left = d3.event.pageX + "px"
        menu.style.top = d3.event.pageY + "px"
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
        input.onblur = (e) => { e.target.remove() }
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
            // var newString = mainTree["nodes"][field]["label"].replace(d, e.target.value)
            mainTree["nodes"][field]["label"] = e.target.value
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

    return [nodes, edges]
}

function getParent(nodeID, tree = mainTree) {
    for (let i in tree["edges"]) {
        if (tree["edges"][i].includes(nodeID)) {
            return i
        }
    }
    return null
}

// ************** Toggle/Set Functions *****************
function toggleLabel(nodeID, tree = mainTree) {
    if (tree["nodes"][nodeID]["show_label"] == undefined || tree["nodes"][nodeID]["show_label"] == false) {
        tree["nodes"][nodeID]["show_label"] = true;
    } else {
        tree["nodes"][nodeID]["show_label"] = false;
    }
    resetNodes(tree)
    setDisplayNoneContextMenu()
}

function convertLeafLabelAction(tree = mainTree) {
    let leaves = getLeaves(tree)
    for (var leaf_key of leaves) {
        if (tree["nodes"][leaf_key]["action"] == undefined) {
            continue
        }
        tree["nodes"][leaf_key]["label"] = tree["nodes"][leaf_key]["action"]
    }
}

// ************** Instantiating Functions *****************
function setLabelShowns(tree = mainTree) {
    var maxDepth = getMaxDepth(tree)
    var labelLimit = 3 / 4
    for (var node in tree["nodes"]) {
        if (tree["nodes"][node]["depth"] > maxDepth * labelLimit - 1) {
            tree["nodes"][node]["show_label"] = false
        } else {
            tree["nodes"][node]["show_label"] = true
        }
    }
}

function instantiateSVG(legend = true) {
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
function resetNodes(tree = mainTree) {
    var svg = d3.select("svg")
    var node = svg.selectAll("g.node").remove()
    drawTree(tree)
}

function resetNodesWithNewPositions(tree = mainTree) {
    autosizeSVGWidthHeight(tree)
    var [n, e] = getNodePositions(tree["nodes"], tree["edges"], tree["head"], width / 2, 25, -1, false, getMaxDepth(tree))
    tree["nodes"] = n
    tree["edges"] = e

    var svg = d3.select("svg")
    var node = svg.selectAll("g.tree").remove()
    drawTree(tree)
}

function redoSVG(tree = mainTree) {
    var oldWidth = width
    var svg = d3.select("svg").remove()
    autosizeSVGWidthHeight(tree)
    for (var nodeID in mainTree["nodes"]) {
        tree["nodes"][nodeID]["x"] += width / 2 - oldWidth / 2
    }
    instantiateSVG()
    if (tree == mainTree) {
        drawLegend()
    }
    drawTree(tree)
}

function expandAll(tree = mainTree) {
    for (var i in mainTree["nodes"]) {
        mainTree["nodes"][i]["shown"] = true
    }
}