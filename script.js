// Inicialización de los datos
var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

// Creación de la red
var container = document.getElementById('mynetwork');
var data = { nodes: nodes, edges: edges };
var options = {};
var network = new vis.Network(container, data, options);

// Función para generar un color aleatorio claro
function getRandomLightColor() {
    var r = Math.floor(Math.random() * 128) + 128;
    var g = Math.floor(Math.random() * 128) + 128;
    var b = Math.floor(Math.random() * 128) + 128;
    return `rgb(${r},${g},${b})`;
}

// Añadir un nodo
document.getElementById('addNode').onclick = function () {
    var nodeId = prompt('Ingrese el nombre del nodo:');
    if (nodeId) {
        var randomColor = getRandomLightColor();
        nodes.add({
            id: nodeId,
            label: nodeId,
            color: { border: randomColor, background: randomColor },
            font: { color: '#000000' },
            shape: 'circle',
        });
    }
};

// Eliminar un nodo
document.getElementById('removeNode').onclick = function () {
    var nodeId = prompt('Ingrese el nombre del nodo a eliminar:');
    if (nodeId) nodes.remove({ id: nodeId });
};

// Añadir una arista
document.getElementById('addEdge').onclick = function () {
    var fromNodeId = prompt('Ingrese el nombre del nodo de origen:');
    var toNodeId = prompt('Ingrese el nombre del nodo destino:');
    var cost = prompt('Ingrese el costo de pasar de un nodo a otro:');
    if (fromNodeId && toNodeId && cost) {
        edges.add({
            from: fromNodeId,
            to: toNodeId,
            label: cost,
            arrows: 'to',
        });
    }
};

// Eliminar una arista
document.getElementById('removeEdge').onclick = function () {
    var fromNodeId = prompt('Ingrese el nombre del nodo de origen:');
    var toNodeId = prompt('Ingrese el nombre del nodo destino:');
    var edgeId = null;
    var allEdges = edges.get();
    for (var i = 0; i < allEdges.length; i++) {
        if (allEdges[i].from === fromNodeId && allEdges[i].to === toNodeId) {
            edgeId = allEdges[i].id;
            break;
        }
    }
    if (edgeId) {
        edges.remove({ id: edgeId });
    } else {
        alert(`No se encontró una conexión desde ${fromNodeId} hasta ${toNodeId}`);
    }
};

// Ver Prerrequisitos
document.getElementById('prerequisites').onclick = function () {
    var nodeId = prompt('Ingrese el nombre del nodo:');
    if (nodeId) {
        var connectedNodes = network.getConnectedNodes(nodeId, 'from');
        alert(`Prerrequisitos de ${nodeId}: ${connectedNodes.join(', ')}`);
    }
};

// Ver Postrequisitos
document.getElementById('postrequisites').onclick = function () {
    var nodeId = prompt('Ingrese el nombre del nodo:');
    if (nodeId) {
        var connectedNodes = network.getConnectedNodes(nodeId, 'to');
        alert(`Postrequisitos de ${nodeId}: ${connectedNodes.join(', ')}`);
    }
};
