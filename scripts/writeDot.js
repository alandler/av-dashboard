diGraph = ""

function writeDot(){
    diGraph = "digraph Tree { \n"
    nodes = mainTree["nodes"]
    edges = mainTree["edges"]
    head = mainTree["head"]

    //Begin with the root
    writeNode(head)
    writeChildren(head)
    diGraph += "}"

    // document.write(diGraph)
    var pre = document.querySelector("pre")
    if (pre == null || pre == undefined){
        pre = document.createElement("pre")
    }
    pre.innerHTML = diGraph
    document.body.appendChild(pre)
}

function writeChildren(nodeID){
    for (let i in edges[nodeID]){
        //Write children
        writeNode(edges[nodeID][i])
        //Write edges to children
        writeEdge(nodeID, edges[nodeID][i])
        //Recurse
        writeChildren(edges[nodeID][i])
    }
}

function writeNode(nodeId){
    nodes = mainTree["nodes"]
    diGraph += nodeId + " " + "[label= \"" + labelToDot(nodes[nodeId]["label"]) + "\"] ; \n"
}

function labelToDot(label){
    console.log("label: " + label)
    var arr = label.split("\n");
    console.log(arr)
    var s = ""
    for (var i in arr){
        if (i==arr.length-1){
            s += arr[i]
        } else{
        s += arr[i] + "\\n"
        }
    }
    return s
}

function writeEdge(node1, node2){
    diGraph += node1 + " -> " + node2 + " ; \n"
}