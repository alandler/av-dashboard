trees = {}

function getNextTreeID(){
    var maxID = Math.max(...Object.keys(trees))
    return maxID + 1
}

function addInputDiv(){
    const fileSelectionDiv = document.getElementById("file-selectors")
    var fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.id = "file-selector-" + getNextTreeID()
    fileInput.accept = ".dot"
    fileInput.addEventListener('input', (e) => handleDotfileUpload(e.target.files[0],e.target.id.substring(14)))
    fileSelectionDiv.append(fileInput)
}

async function handleDotfileUpload(file, treeID){
    // console.log(file)
    // var treeID = e.target.id.substring(14)
    // var file = e.target.files[0]
    var tree = await treeFromFile(file)
    var [n, e] = getNodePositions(tree["nodes"], tree["edges"], tree["head"], (treeID)*85, -70, -1, false)
    tree["nodes"] = n
    tree["edges"] = e
    trees[treeID] = tree
    var description = prompt("Please desctibe this decision tree", "eg.  ambulance context");
    trees[treeID]["description"] = description
    trees[treeID]["color"] = colorGenerator()
    applyColorToNodes(tree["nodes"], trees[treeID]["color"])
    drawLegend()
}

function displayDescription(e, tree){

}