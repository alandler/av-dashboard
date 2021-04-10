// ************** Graph editors and extractor *****************
function getHeadLabel(edges) {
    let possibleHeads = Object.keys(edges)
    for (edge in edges) {
        for (child of edges[edge]) {
            var index = possibleHeads.indexOf(child);
            if (index > -1) {
                possibleHeads.splice(index, 1);
            }
        }
    }
    return possibleHeads[0]
}

function updateParent(node, newParent) {
    for (parent in edges) {
        if (node in edges[parent]) {
            let i = edges[parent].indexOf(node)
            delete edges[parent][i]
        }
    }
    edges[newParent].push(node)
}

function addNewRoot(e) {
    e.preventDefault()
    let nodeLabel = parentNodeForm.elements[0].value;
    let childLabel = parentNodeForm.elements[1].value;

    let IDs = Object.keys(nodes).map(x => +x)
    let maxID = IDs.reduce(function (a, b) {
        return Math.max(a, b);
    });

    nodes[maxID + 1] = nodeLabel
    nodes[maxID + 2] = childLabel

    edges[maxID + 1] = [head, maxID + 2]

    head = maxID + 1

    updateTree()
}

function addParent() {
    // Assert that node doesn't have a parent
    if (getParent(rightClickNode.id) != null) {
        alert("Sorry! That node has a parent already")
        return
    }
    else {
        let prevID = getNodeMaxID(mainTree["nodes"])
        let newID = prevID + 1
        mainTree["nodes"][newID] =
        {
            "id": newID,
            "label": "Default label",
            "x": width / 2,
            "y": 25,
            "color": "#999999",
            "shown": true
        }
        mainTree["edges"][newID] = [rightClickNode.id]
        mainTree["head"] = newID
        resetNodesWithNewPositions()
    }
    setDisplayNoneContextMenu()
}

function addLeaf() {
    if (mainTree["edges"][rightClickNode.id].length == 2) {
        alert("Leaves full")
    }
    else {
        let prevID = getNodeMaxID(mainTree["nodes"])
        let newID = prevID + 1
        mainTree["nodes"][newID] =
        {
            "id": newID,
            "label": "Default label",
            "x": width / 2,
            "y": 25,
            "color": "#999999",
            "shown": true
        }
        mainTree["edges"][rightClickNode.id].push(newID)
        resetNodesWithNewPositions()
    }
    setDisplayNoneContextMenu()
}

function deleteNode(nodeID) {
    //Do not delete head 
    if (nodeID == mainTree["head"]) {
        alert("Sorry, cannot delete the root")
    } else {
        deleteRecursive(nodeID)
        //Reset svg
        resetNodesWithNewPositions()
    }
    //Remove menu tree
    setDisplayNoneContextMenu()
}

function deleteRecursive(nodeID) {
    //Delete children
    for (let edge of mainTree["edges"][nodeID]) {
        deleteRecursive(edge)
    }
    //Delete from parent's children
    parentID = getParent(nodeID)
    arrID = mainTree["edges"][parentID].indexOf(nodeID)
    mainTree["edges"][parentID].splice(arrID, 1)
    //Delete self
    delete mainTree["edges"][nodeID]
    delete mainTree["nodes"][nodeID]
}

function checkNodePositionsWithinSVGBounds(tree = mainTree){
    for (var nodeID in tree["nodes"]){
        if (tree["nodes"][nodeID]<=0 || tree["nodes"][nodeID]>=width){
            return true
        }
    }
    return false
}

function getNodePositions(nodes, edges, source, parentX, parentY, parentDepth, left, maxDepth){
    if (parentDepth == -1) {
        nodes[source]['x'] = parentX
        nodes[source]['y'] = parentY
    }
    else {
        var xShift = 2^(maxDepth-parentDepth-1)
        nodes[source]['x'] = left ? parentX - xShift : parentX + xShift
        nodes[source]['y'] = parentY + 100
    }
    nodes[source]["depth"] = parentDepth + 1
    nodes[source]['shown'] = true
    if (edges[source] == undefined || edges[source].length == 0) {
        edges[source] = []
    }
    else if (edges[source].length == 1) {
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][0], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], true, maxDepth)
    } else {
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][0], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], true, maxDepth)
        [nodes, edges] = getNodePositions(nodes, edges, edges[source][1], nodes[source]['x'], nodes[source]['y'], nodes[source]["depth"], false,maxDepth)
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

function graphToHierarchyWithPositions(nodes, edges, head, parentX, parentY, left) {
    let result = {}

    result["label"] = nodes[head]
    result["x"] = left ? parentX - 10 : parentX + 10
    result["y"] = parentY + 150
    if (edges[head] == undefined) {
        result["children"] = []
    } else if (edges[head].length == 1) {
        result["children"] = [graphToTreeWithPositions(nodes, edges, edges[head][0], result["x"], result["y"], true)]
    } else {
        result["children"] = [graphToTreeWithPositions(nodes, edges, edges[head][0], result["x"], result["y"], true), graphToTreeWithPositions(nodes, edges, edges[head][1], result["x"], result["y"], true)]
    }
    return result
}

function setDisplayNoneContextMenu() {
    menu = document.getElementById("tree-right-click-menu")
    menu.classList.add("context-menu")
    menu.classList.remove("context-menu-active")
}
