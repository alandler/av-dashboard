function headCentered(tree = mainTree) {
    if (tree["edges"][tree["head"]].length == 1) {
        return true
    } else {
        return false
    }
}

function getNodesAtDepths(tree = mainTree) {
    var depths = {}
    var maxDepth = getMaxDepth(tree)
    for (var i = 0; i <= maxDepth; i++) {
        depths[i] = []
    }
    for (var nodeID in tree["nodes"]) {
        depths[tree["nodes"][nodeID]["depth"]].push(nodeID)
    }
    return depths
}

function staticAutosize(tree = mainTree) {
    //maxDepth determining factor
    var maxDepth = getMaxDepth(tree)
    //If single node, depth 0 (1-1)
    if (headCentered() == true) {
        maxDepth -= 1
    }
    console.log("Max depth: " + maxDepth)
    nodeGap = Math.min(width / (2 * (Math.pow(2, maxDepth))), 55)
}

function autosizeSVGWidthHeight(tree = mainTree) {
    var maxDepth = getMaxDepth(tree)
    if (headCentered() == true) {
        maxDepth -= 1
    }
    var numNodes = Math.pow(2, maxDepth)
    // var numGaps = numNodes / 2 - 1
    var maxWidth = nodeGap * (numNodes) * 2
    var maxHeight = 100 * maxDepth

    if (maxWidth > width) { //If bounds are exceeded, try reducing the gap, then expand svg
        var extraWidth = maxWidth - width
        var extraPerNode = extraWidth / numNodes
        if (nodeGap - extraPerNode > 6) {
            nodeGap = nodeGap - extraPerNode
        } else {
            nodeGap = 7
        }
        width = nodeGap * (numNodes) * 2
    } else { // If the nodes fit, optimize for space
        var perNode = width / numNodes / 2
        nodeGap = Math.min(perNode, 50)
    }
    if (maxHeight > height) {
        height = maxHeight
    }
}

function getMaxDepthShown(tree = mainTree) {
    var maxDepth = 0
    for (var node in tree["nodes"]) {
        if (tree["nodes"][node]["depth"] > maxDepth && tree["nodes"][node]["shown"] == true) {
            maxDepth = tree["nodes"][node]["depth"]
        }
    }
    return maxDepth
}

function getMaxDepth(tree = mainTree) {
    var maxDepth = 0
    for (var node in tree["nodes"]) {
        if (tree["nodes"][node]["depth"] > maxDepth) {
            maxDepth = tree["nodes"][node]["depth"]
        }
    }
    return maxDepth
}

function checkNodePositionsWithinSVGBounds(tree = mainTree) {
    for (var nodeID in tree["nodes"]) {
        if (tree["nodes"][nodeID] <= 0 || tree["nodes"][nodeID] >= width) {
            return true
        }
    }
    return false
}

function reassignPositions(tree) {
    var [newN, newE] = getNodePositions(tree["nodes"], tree["edges"], tree["head"], width / 2, 25, -1, false, getMaxDepth(tree))
    tree["nodes"] = newN
}

function resetNodesWithNewPositions(tree = mainTree) {
    // autosizeSVGWidthHeight(tree)
    staticAutosize(tree)
    var [n, e] = getNodePositions(tree["nodes"], tree["edges"], tree["head"], width / 2, 25, -1, false, getMaxDepth(tree))
    tree["nodes"] = n
    tree["edges"] = e

    var svg = d3.select("svg")
    var node = svg.selectAll("g.tree").remove()
    drawTree(tree)
}

function getNodePositions(nodes, edges, source, parentX, parentY, parentDepth, left, maxDepth, straight = false) {
    var xShift = 0;
    if (parentDepth == -1) {
        nodes[source]['x'] = parentX
        nodes[source]['y'] = parentY
    }
    else {
        xShift = Math.pow(2, (maxDepth - parentDepth - 1)) * nodeGap
        // console.log("Xshift: " + xShift)
        nodes[source]['x'] = left ? parentX - xShift : parentX + xShift
        nodes[source]['x'] = straight ? parentX : nodes[source]['x']
        nodes[source]['y'] = parentY + 100
    }
    nodes[source]["depth"] = parentDepth + 1
    nodes[source]['shown'] = true
    if (edges[source] == undefined || edges[source].length == 0) {
        edges[source] = []
    }
    else if (edges[source].length == 1) {
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][0], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], true, maxDepth, true)
    } else {
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][0], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], true, maxDepth)
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][1], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], false, maxDepth)
    }
    return [nodes, edges]
}

function getNodePositionsOverlap(nodes, edges, source, parentX, parentY, parentDepth, left) {
    if (parentDepth == -1) {
        nodes[source]['x'] = parentX
        nodes[source]['y'] = parentY
    }
    else {
        nodes[source]['x'] = left ? parentX - 65 : parentX + 65
        nodes[source]['y'] = parentY + 100
    }
    nodes[source]["depth"] = parentDepth + 1
    nodes[source]['shown'] = true
    if (edges[source] == undefined || edges[source].length == 0) {
        edges[source] = []
    }
    else if (edges[source].length == 1) {
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][0], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], true)
    } else {
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][0], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], true)
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][1], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], false)
    }
    return [nodes, edges]
}