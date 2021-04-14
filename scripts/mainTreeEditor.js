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
    console.log("Add leaf to node: " + nodeID)
    console.log(trees)
    //Check if leaves are full
    if (tree["edges"][nodeID].length == 2) {
        alert("Leaves full")
    }
    else {
        let prevID = getNodeMaxID(tree["nodes"])
        let newID = prevID + 1
        addExpert = parseSessionStorage("addExpert")
        expertTree = parseSessionStorage("expertTree")
        tree["nodes"][newID] =
        {
            "id": newID,
            "label": addExpert == true ? expertTree["description"] : "Default label",
            "x": width / 2,
            "y": 25,
            "color": nodeColor,
            "shown": true,
            "show_label": true,
            "expertID": expertID
        }
        addExpert = false
        sessionStorage.setItem("addExpert", addExpert)
        tree["edges"][nodeID].push(newID)
        console.log("Add leaf: push node. Tree below.")
        console.log(tree)
        resetNodesWithNewPositions(tree)
    }
    setDisplayNoneContextMenu(tree)
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
    console.log("Make expert")
    //If the node has an expertID, this will be a show operation. Store the relevant expert
    if (tree["nodes"][nodeID]["expertID"]) {
        console.log(trees[tree["nodes"][nodeID]["expertID"]])
        expertTree = trees[tree["nodes"][nodeID]["expertID"]]
        sessionStorage.setItem("expertTree", JSON.stringify(expertTree))
    }
    // If the node has no expertID, turn the node into an expert (save rightClickNode, make expert the node itself)
    else {
        console.log("No expertID")
        expertTree = {}
        Object.assign(expertTree, plainTree)

        //Assign node propertties to new expert
        expertTree["nodes"][0]["label"] = rightClickNode["label"]
        expertTree["nodes"][0]["expertID"] = getNextTreeID()
        expertTree["nodes"][0]["color"] = colorGenerator()

        //Update meta controller as expert
        mainTree["nodes"][rightClickNode.id]["expertID"] = expertTree["nodes"][0]["expertID"]
        rightClickNode["expertID"] = expertTree["nodes"][0]["expertID"] //Should be redunant

        //Set cookies before leaving page
        sessionStorage.setItem("metaController", JSON.stringify(mainTree))
        sessionStorage.setItem("colorsUsed", JSON.stringify(colorsUsed))
        sessionStorage.setItem("expertTree", JSON.stringify(expertTree))
        trees[expertTree["nodes"][0]["expertID"]] = expertTree
        sessionStorage.setItem("trees", JSON.stringify(trees))
    }
    console.log(JSON.stringify(rightClickNode))
    sessionStorage.setItem("rightClickNode", JSON.stringify(rightClickNode))
    window.location.href = "expert_creator.html"
}

function toggleLabel(nodeID, tree = mainTree) {
    console.log("Toggle Label NodeID: " + nodeID)
    console.log(tree)
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
    // console.log("Get the parent of node: " + nodeID)
    // console.log(tree)
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
