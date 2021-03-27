trees = {}

function getNextTreeID(){
    var maxID = Math.max(...Object.keys(trees))
    console.log(maxID)
    return maxID + 1
}

function addInputDiv(){
    const fileSelectionDiv = document.getElementById("file-selectors")
    var fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.id = "file-selector-" + getNextTreeID()
    fileInput.accept = ".dot"
    fileInput.addEventListener('input', handleDotfileUpload)
    fileSelectionDiv.append(fileInput)
}

async function handleDotfileUpload(e){
    var treeID = e.target.id.substring(14)
    var tree = await treeFromFile(e)
    trees[treeID] = tree
    var description = prompt("Please desctibe this decision tree", "eg.  ambulance context");
    console.log("description " + description)
    trees[treeID]["description"] = description
    trees[treeID]["color"] = colorGenerator()
    console.log(trees)
    drawLegend()
}

function displayDescription(e, tree){

}