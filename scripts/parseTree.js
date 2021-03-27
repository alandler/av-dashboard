    // ************** DOTFILE Parsing	 *****************
    function treeFromFile(e) {

        return new Promise((resolve, reject) => {

        file = e.target.files[0]

        let reader = new FileReader()
        reader.readAsText(file)
        reader.onload = function () {
            var [nXnodes, nXedges, head] = parseDot(reader.result)
            var [nodes, edges] = getNodePositions(nXnodes, nXedges, head, 440, -150, true)
            var tree = { "nodes": nodes, "edges": edges, "head": head, "description": "No description yet" }
            resolve(tree)
        }
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
                for (let entry of attributeList) {
                    if (entry.includes("class")) {
                        continue
                    }
                    s += entry + "\n"
                }
                s = s.trim()
                nodes[nodeNumber] = { "id": nodeNumber, "label": s, "x": null, "y": null }
            }
        }
        head = getHeadLabel(edges)
        return [nodes, edges, head]
    }
