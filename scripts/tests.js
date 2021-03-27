    //Test Data
    nodes1 = { 0: { "id": 0 }, 1: { "id": 1 }, 2: { "id": 2 } }
    nodes2 = { 0: { "id": 0 }, 1: { "id": 1 }, 2: { "id": 2 }, 3: { "id": 3 } }
    edges1 = { 0: [1, 2], 1: [], 2: [] }
    edges2 = { 0: [1, 2], 1: [3], 2: [] }
    head1 = 0
    target = 2
    head2 = 0

    const [n, e, h] = mergeTrees(nodes1, nodes2, edges1, edges2, head1, target, head2);
    console.log("Executed Merge:")
    console.log(n)
    console.log(e)
    console.log("Head: " + h)
    console.log("End merge results")

    //Tree object description
    tree = { "nodes": {}, "edges": {}, "head": {}, "description": {} }