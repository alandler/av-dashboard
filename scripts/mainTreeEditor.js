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

// ************** Context Menu Functions *****************

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

function addParent(e, tree = mainTree) {
    // Assert that node doesn't have a parent
    if (getParent(rightClickNode.id) != null) {
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
            "shown": true
        }
        tree["edges"][newID] = [rightClickNode.id]
        tree["head"] = newID
        resetNodesWithNewPositions()
    }
    setDisplayNoneContextMenu()
}

function addLeaf(e, nodeID=rightClickNode,tree=mainTree, nodeColor = "#999999", expertID = undefined) {
    if (nodeID.id != undefined){
        nodeID=nodeID.id
    }
    if (tree["edges"][nodeID].length == 2) {
        alert("Leaves full")
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
            "color": nodeColor,
            "shown": true,
            "expertID": expertID        
        }
        tree["edges"][nodeID].push(newID)
        resetNodesWithNewPositions()
    }
    setDisplayNoneContextMenu()
}

function deleteNode(nodeID, tree=mainTree) {
    //Do not delete head 
    if (nodeID == tree["head"]) { //&& tree["edges"][tree["head"]].length==0
        alert("Sorry, cannot delete the root")
    } else {
        deleteRecursive(nodeID)
        //Reset svg
        resetNodesWithNewPositions()
    }
    //Remove menu tree
    setDisplayNoneContextMenu()
}

function deleteRecursive(nodeID, tree = mainTree) {
    //Delete children
    for (let edge of tree["edges"][nodeID]) {
        deleteRecursive(edge)
    }
    //Delete from parent's children
    parentID = getParent(nodeID)
    arrID = tree["edges"][parentID].indexOf(nodeID)
    tree["edges"][parentID].splice(arrID, 1)
    //Delete self
    delete tree["edges"][nodeID]
    delete tree["nodes"][nodeID]
}

function makeExpert(nodeID){
    setSessionStorage()
    window.location.href = "expert_creator.html"
}

function setDisplayNoneContextMenu() {
    menu = document.getElementById("tree-right-click-menu")
    menu.classList.add("context-menu")
    menu.classList.remove("context-menu-active")
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

function getPartialTree(source, tree=mainTree){

}
