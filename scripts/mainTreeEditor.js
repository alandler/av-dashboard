// ************** Tree Modifiers *****************
function setFields(tree) {
    [tree["nodes"], tree["edges"]] = setField(tree["nodes"], tree['edges'], tree['head'], width / 2, 0, -1, false)
}

function setField(nodes, edges, source, parentX, parentY, parentDepth, left) {
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

// ************** Context Menu Functions *****************

function addParent(e, tree = mainTree) {
    // Assert that node doesn't have a parent
    if (getParent(rightClickNode.id, tree)) {
        alert("Sorry! That node has a parent already")
        return
    }
    else {
        let prevID = getNodeMaxID(tree["nodes"])
        let newID = prevID + 1
        tree["nodes"][newID] =
        {
            "id": newID,
            "label": "Default label",
            "x": width / 2,
            "y": 25,
            "color": "#999999",
            "show_label": true,
            "shown": true
        }
        tree["edges"][newID] = [rightClickNode.id]
        tree["head"] = newID
        resetNodesWithNewPositions(tree)
    }
    setDisplayNoneContextMenu(tree)
}

function addLeaf(e, nodeID = rightClickNode.id, nodeColor = "#999999", expertID = undefined, tree = mainTree) {
    console.log("Add a leaf at ID: " + nodeID + "... color: " + nodeColor + "... expertID: " + expertID)
    //Check if leaves are full
    if (tree["edges"][nodeID].length == 2) {
        alert("Leaves full")
    }
    else {
        console.log("LOOOOK HERE")
        let prevID = getNodeMaxID(tree["nodes"])
        let newID = prevID + 1
        // addExpert = parseSessionStorage("addExpert")
        console.log(window.location.href)
        console.log("add Expert:" + addExpert)
        expertTree = parseSessionStorage("expertTree")
        var endURL = window.location.href.substring(window.location.href.length-"meta_controller.html".length,window.location.href.length)
        console.log(endURL)
        tree["nodes"][newID] =
        {
            "id": newID,
            "label": addExpert == true &&  endURL=="meta_controller.html" ? expertTree["description"] : "Default label",
            "x": width / 2,
            "y": 25,
            "color": nodeColor,
            "shown": true,
            "show_label": true,
            "expertID": expertID
        }
        // addExpert = false
        // sessionStorage.setItem("addExpert", addExpert)
        tree["edges"][nodeID].push(newID)
        resetNodesWithNewPositions(tree)
    }
    setDisplayNoneContextMenu(tree)
    console.log(trees)
}

function deleteNode(nodeID, tree = mainTree) {
    //Do not delete head 
    if (nodeID == tree["head"]) { //&& tree["edges"][tree["head"]].length==0
        alert("Sorry, cannot delete the root")
    } else {
        deleteRecursive(nodeID)
        //Reset svg
        resetNodesWithNewPositions()
    }
    //Remove menu tree
    setDisplayNoneContextMenu(tree)
}

function deleteRecursive(nodeID, tree = mainTree) {
    //Delete children
    for (let edge of tree["edges"][nodeID]) {
        deleteRecursive(edge)
    }
    //Delete from parent's children
    parentID = getParent(nodeID, tree)
    arrID = tree["edges"][parentID].indexOf(nodeID)
    tree["edges"][parentID].splice(arrID, 1)
    //Delete self
    delete tree["edges"][nodeID]
    delete tree["nodes"][nodeID]
}

function makeExpert(nodeID, tree = mainTree) {
    //If the node has an expertID, this will be a show operation. Store the relevant expert
    if (tree["nodes"][nodeID]["expertID"]) {
        console.log("Show expert: " + tree["nodes"][nodeID]["expertID"])
        var treeID = tree["nodes"][nodeID]["expertID"]
        expertTree = trees[treeID]
        console.log(trees)
    }
    // If the node has no expertID, turn the node into an expert (save rightClickNode, make expert the node itself)
    else {
        expertTree = {}
        Object.assign(expertTree, plainTree)

        // Get treeID
        var treeID = undefined
        try {
            treeID = getNextTreeID()
        } catch {
            treeID = 1
        }

        console.log("Create tree with ID" + treeID + " from node: " + rightClickNode.id)

        //Assign properties to new expert node
        expertTree["nodes"][0]["label"] = rightClickNode["label"]
        expertTree["nodes"][0]["expertID"] = treeID
        expertTree["nodes"][0]["color"] = colorGenerator()
        mainTree["nodes"][rightClickNode.id]["color"]= expertTree["nodes"][0]["color"]

        //Assign expert properties
        expertTree["description"] = rightClickNode["label"]
        expertTree["expertID"] = treeID
        expertTree["color"] = expertTree["nodes"][0]["color"]
        expertTree["nodes"] = applyColorToNodes(expertTree["nodes"], expertTree["color"])

        rightClickNode = expertTree["nodes"][0] //Update right click node to include new properties

        //Assign the expert to the tree
        trees[treeID] = expertTree
        console.log("fin lk")
        console.log(trees) 
    }
    //Set cookies before leaving page
    sessionStorage.setItem("metaController", JSON.stringify(mainTree))
    sessionStorage.setItem("colorsUsed", JSON.stringify(colorsUsed))
    sessionStorage.setItem("expertTree", JSON.stringify(expertTree))
    sessionStorage.setItem("trees", JSON.stringify(trees))
    sessionStorage.setItem("rightClickNode", JSON.stringify(rightClickNode))
    console.log("Right click node")
    console.log(rightClickNode)
    window.location.href = "expert_creator.html"
}

function toggleLabel(nodeID, tree = mainTree) {
    if (!tree["nodes"][nodeID]["show_label"] || tree["nodes"][nodeID]["show_label"] == false) {
        tree["nodes"][nodeID]["show_label"] = true;
    } else {
        tree["nodes"][nodeID]["show_label"] = false;
    }
    resetNodes(tree)
    setDisplayNoneContextMenu(tree)
}

function setDisplayNoneContextMenu() {
    //Set mainTree sessionStorage (changed)
    sessionStorage.setItem("mainTree", JSON.stringify(mainTree))
    //Remove menu
    menu = document.getElementById("tree-right-click-menu")
    menu.classList.add("context-menu")
    menu.classList.remove("context-menu-active")
    //Set rightClickNone undefined
    rightClickNode = undefined
    sessionStorage.setItem("rightClickNode", JSON.stringify(rightClickNode))
}

// ************** Observers *****************
function getLeaves(tree) {
    var leaves = []
    for (let node in tree["nodes"]) {
        if (tree["edges"][node].length != 1 && tree["edges"][node].length != 2) {
            leaves.push(node)
        }
    }
    return leaves
}

function getNodeMaxID(nodes) {
    var keys = Object.keys(nodes)
    var asInts = keys.map(x => parseInt(x))
    return Math.max(...asInts)
}

function getParent(nodeID, tree = mainTree) {
    for (let i in tree["edges"]) {
        if (tree["edges"][i].includes(nodeID)) {
            return i
        }
    }
    return undefined
}

// ************** Label Modifiers *****************
function convertLeafLabelAction(tree) {
    let leaves = getLeaves(tree)
    for (var leaf_key of leaves) {
        if (tree["nodes"][leaf_key]["action"] == undefined) {
            continue
        }
        tree["nodes"][leaf_key]["label"] = tree["nodes"][leaf_key]["action"]
    }
}

// ************** Visibility Modifiers *****************
function setLabelShowns(tree) {
    var maxDepth = getMaxDepth(tree)
    var labelLimit = 3 / 4
    for (var node in tree["nodes"]) {
        if (tree["nodes"][node]["depth"] > maxDepth * labelLimit - 1) {
            tree["nodes"][node]["show_label"] = false
        } else {
            tree["nodes"][node]["show_label"] = true
        }
        tree["nodes"][node]["show_label"] = true //Hard code
    }
}

function expandAll(tree) {
    for (var i in mainTree["nodes"]) {
        mainTree["nodes"][i]["shown"] = true
    }
}

function showAllLabels(tree) {
    for (var i in mainTree["nodes"]) {
        mainTree["nodes"][i]["show_label"] = true
    }
}

// ************** Graph extractor *****************
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

function getPartialTree(source, tree) {

}
