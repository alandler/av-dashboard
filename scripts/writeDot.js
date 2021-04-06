diGraph = "digraph Tree { \n"

function writeDot(){
    nodes = mainTree["nodes"]
    edges = mainTree["edges"]
    head = mainTree["head"]

    //Begin with the root
    writeNode(head)
    writeChildren(head)
    diGraph += "}"

    document.write(diGraph)
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
    var arr = label.split("\n");
    var s = ""
    for (var i in arr){
        if (i==arr.length-1){
            s += arr[i]
        } else{
        s += arr[i] + "\\n"
        }
    }
}

function writeEdge(node1, node2){
    diGraph += node1.id + " -> " + node2.id + " ; \n"
}