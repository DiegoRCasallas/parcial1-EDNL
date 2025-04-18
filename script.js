// Inicialización de los datos
var nodes = new vis.DataSet([]);
var edges = new vis.DataSet([]);

// Crear red
var container = document.getElementById('mynetwork');
var data = { nodes: nodes, edges: edges };
var options = {};
var network = new vis.Network(container, data, options);

function getRandomLightColor() {
    var r = Math.floor(Math.random() * 128) + 128;
    var g = Math.floor(Math.random() * 128) + 128;
    var b = Math.floor(Math.random() * 128) + 128;
    return `rgb(${r},${g},${b})`;
}

// Añadir Nodo
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

// Editar Nodo
document.getElementById('editNode').onclick = function () {
    var oldId = prompt('Ingrese el ID del nodo a editar:');
    if (!nodes.get(oldId)) return alert('Nodo no encontrado');

    var newId = prompt('Ingrese el nuevo ID del nodo:');
    if (newId && newId !== oldId) {
        var current = nodes.get(oldId);
        nodes.remove({ id: oldId });
        edges.forEach(edge => {
            if (edge.from === oldId) edge.from = newId;
            if (edge.to === oldId) edge.to = newId;
        });
        nodes.add({ ...current, id: newId, label: newId });
        data.edges = edges;
        network.setData(data);
    }
};

// Eliminar Nodo
document.getElementById('removeNode').onclick = function () {
    var nodeId = prompt('Ingrese el nombre del nodo a eliminar:');
    if (nodeId) nodes.remove({ id: nodeId });
};

// Añadir Arista
document.getElementById('addEdge').onclick = function () {
    var fromNodeId = prompt('Origen:');
    var toNodeId = prompt('Destino:');
    var cost = prompt('Costo:');
    if (fromNodeId && toNodeId && cost) {
        edges.add({ from: fromNodeId, to: toNodeId, label: cost, arrows: 'to' });
    }
};

// Eliminar Arista
document.getElementById('removeEdge').onclick = function () {
    var from = prompt('Nodo origen:');
    var to = prompt('Nodo destino:');
    let edge = edges.get().find(e => e.from === from && e.to === to);
    if (edge) edges.remove({ id: edge.id });
    else alert('Arista no encontrada');
};

// Ver Prerrequisitos
document.getElementById('prerequisites').onclick = function () {
    var id = prompt('Ingrese el nodo:');
    if (id) {
        var connected = network.getConnectedNodes(id, 'from');
        alert(`Prerrequisitos de ${id}: ${connected.join(', ')}`);
    }
};

// Ver Postrequisitos
document.getElementById('postrequisites').onclick = function () {
    var id = prompt('Ingrese el nodo:');
    if (id) {
        var connected = network.getConnectedNodes(id, 'to');
        alert(`Postrequisitos de ${id}: ${connected.join(', ')}`);
    }
};

// Matriz de Adyacencia
document.getElementById('adjacencyMatrix').onclick = function () {
    const nodeIds = nodes.getIds();
    const matrix = nodeIds.map(row => nodeIds.map(col => {
        const edge = edges.get().find(e => e.from === row && e.to === col);
        return edge ? edge.label : '0';
    }));
    
    let output = '<b>Matriz de Adyacencia</b><br><table border="1"><tr><th></th>';
    output += nodeIds.map(n => `<th>${n}</th>`).join('') + '</tr>';
    matrix.forEach((row, i) => {
        output += `<tr><th>${nodeIds[i]}</th>` + row.map(c => `<td>${c}</td>`).join('') + '</tr>';
    });
    output += '</table>';
    document.getElementById('output').innerHTML = output;
};

// Matriz de Incidencia
document.getElementById('incidenceMatrix').onclick = function () {
    const nodeIds = nodes.getIds();
    const allEdges = edges.get();
    let output = '<b>Matriz de Incidencia</b><br><table border="1"><tr><th></th>';
    output += allEdges.map((e, i) => `<th>e${i}</th>`).join('') + '</tr>';
    nodeIds.forEach(n => {
        output += `<tr><th>${n}</th>`;
        output += allEdges.map(e => `<td>${e.from === n ? '-1' : e.to === n ? '1' : '0'}</td>`).join('');
        output += '</tr>';
    });
    output += '</table>';
    document.getElementById('output').innerHTML = output;
};

// Dijkstra - Ruta mínima
document.getElementById('shortestPath').onclick = function () {
    var origen = prompt('Nodo de origen:');
    var destino = prompt('Nodo de destino:');
    if (!nodes.get(origen) || !nodes.get(destino)) return alert('Nodos inválidos');

    const dist = {}, prev = {}, Q = new Set(nodes.getIds());
    nodes.getIds().forEach(n => { dist[n] = Infinity; prev[n] = null });
    dist[origen] = 0;

    while (Q.size) {
        let u = [...Q].reduce((a, b) => dist[a] < dist[b] ? a : b);
        Q.delete(u);
        edges.get().filter(e => e.from === u && Q.has(e.to)).forEach(e => {
            let alt = dist[u] + parseFloat(e.label);
            if (alt < dist[e.to]) {
                dist[e.to] = alt;
                prev[e.to] = u;
            }
        });
    }

    let path = [], u = destino;
    while (prev[u]) {
        path.unshift(u);
        u = prev[u];
    }
    if (u === origen) path.unshift(origen);
    else return alert('No hay ruta');

    network.selectNodes(path);
    document.getElementById('output').innerHTML = `Ruta más corta de ${origen} a ${destino}:<br><b>${path.join(' → ')}</b><br>Costo total: <b>${dist[destino]}</b>`;
};

// Ruta Crítica (DAG - Camino más largo)
document.getElementById('criticalPath').onclick = function () {
    let inDegree = {}, order = [], dist = {}, prev = {};
    const allNodes = nodes.getIds();
    allNodes.forEach(n => inDegree[n] = 0);
    edges.get().forEach(e => inDegree[e.to]++);

    let queue = allNodes.filter(n => inDegree[n] === 0);
    queue.forEach(n => { dist[n] = 0; prev[n] = null });

    while (queue.length) {
        let u = queue.shift();
        order.push(u);
        edges.get().filter(e => e.from === u).forEach(e => {
            inDegree[e.to]--;
            if (inDegree[e.to] === 0) queue.push(e.to);
            let d = dist[u] + parseFloat(e.label);
            if (d > (dist[e.to] || 0)) {
                dist[e.to] = d;
                prev[e.to] = u;
            }
        });
    }

    let endNode = order.reduce((a, b) => dist[a] > dist[b] ? a : b);
    let path = [], u = endNode;
    while (prev[u]) {
        path.unshift(u);
        u = prev[u];
    }
    if (path.length) path.unshift(u);

    network.selectNodes(path);
    document.getElementById('output').innerHTML = `Ruta crítica:<br><b>${path.join(' → ')}</b><br>Duración total: <b>${dist[endNode]}</b>`;
};
