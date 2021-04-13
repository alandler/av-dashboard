// ************** DOTFILE Parsing	 *****************
function treeFromFile(file) {

    return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = function () {
        var [nXnodes, nXedges, head] = parseDot(reader.result)
        var tree = { "nodes": nXnodes, "edges": nXedges, "head": head, "description": "No description yet" }
        resolve(tree)
    }
    reader.onerror = reject;
    reader.readAsText(file)
})
}

function parseDot(text) {
    var nodes = {}
    var edges = {}
    var head = null

    let arr = text.split("\n")
    for (let line in arr) {
        if (arr[line].includes("->")) {
            arr[line] = arr[line].substring(0, arr[line].length - 1)
            let a = arr[line].split("->")
            for (let num in a) {
                let bracket = a[num].indexOf("[")
                if (bracket != -1) {
                    a[num] = a[num].substring(0, bracket)
                }
                a[num] = a[num].trim()
            }
            if (a[0] in edges) {
                edges[a[0]].push(a[1])
            } else {
                edges[a[0]] = [a[1]]
            }
        } else if (arr[line].includes("label")) {
            let space = arr[line].indexOf("[label") - 1
            let nodeNumber = arr[line].substring(0, space)
            let attributeList = arr[line].substring(space + 2, arr[line].length - 3).split("\\n")
            attributeList[0] = attributeList[0].substring(7, attributeList[0].length)
            s = ""
            s += attributeList[0]
            // for (let entry of attributeList) {
            //     if (entry.includes("class")) {
            //         continue
            //     }
            //     s += entry + "\n"
            // }
            var lastItem = attributeList[attributeList.length - 1].split(",")[0].slice(0, -1)
            if (lastItem.indexOf("class")!=-1){
                lastItem = lastItem.substring(8)
            }
            s = s.trim()
            nodes[nodeNumber] = { "id": nodeNumber, "label": s, "action": lastItem, "x": null, "y": null }
        }
    }
    head = getHeadLabel(edges)
    return [nodes, edges, head]
}

function hardCodeMetaController(){
    var policy = [dt_policy_4, dt_policy_8]
    for (var i = 1; i<3; i++){
        var [newNodes, newEdges, newHead] = parseDot(policy[i-1])
        trees[i] = {"nodes": newNodes, "edges": newEdges, "head": newHead}
        trees[i]["description"] = i==1? "Expert depth 4":"Expert depth 8"
        trees[i]["color"] = colorGenerator()
        setFields(trees[i])
        console.log(trees)
        applyColorToNodes(trees[i]["nodes"], trees[i]["color"])
    }
    mainTree = {
        "nodes": { 0: { "id": 0, "label": "Root node", "x": width / 2, "y": 25, 
                "color": "#999999", "shown": true, "depth": 0, "show_label": true, "expertID": undefined},
                    1: { "id": 1, "label": "Context 1?", "x": width / 2-65, "y": 75, 
                "color": trees[1]["color"], "shown": true, "depth": 1, "show_label": true, "expertID": 1},
                    2: { "id": 2, "label": "Context 2?", "x": width / 2+65, "y": 75, 
                "color": trees[2]["color"], "shown": true, "depth": 1, "show_label": true, "expertID": 2} },
        "edges": { 0: [1,2], 1:[], 2:[] },
        "head": 0,
    }
    console.log(trees)
    setFields(mainTree)
    resetNodesWithNewPositions()

}