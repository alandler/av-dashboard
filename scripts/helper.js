colorsUsed = []

function colorGenerator(){
    var palette = ["#001524", "#15616D", "#FF7D00", "#78290F"]
    var extendedPalette = ["#00427d", "#d6acd1", "#e65100", "FFECD1"]
    var randomColor="#000000"

    if (colorsUsed.length <3){
        var colorsRemaining = palette.filter(x => !colorsUsed.includes(x))
        randomColor = colorsRemaining[Math.floor(Math.random() * colorsRemaining.length)];
    } else if (colorsUsed.length <8){
        var colorsRemaining = extendedPalette.filter(x => !colorsUsed.includes(x))
        randomColor = colorsRemaining[Math.floor(Math.random() * colorsRemaining.length)];
    }
    colorsUsed.push(randomColor)
    console.log(colorsUsed)
    return randomColor
}