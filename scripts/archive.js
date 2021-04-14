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

function updateParent(node, newParent) {
    for (parent in edges) {
        if (node in edges[parent]) {
            let i = edges[parent].indexOf(node)
            delete edges[parent][i]
        }
    }
    edges[newParent].push(node)
}