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
        if (nodes.get(nodeId)) {
            alert('El nodo ya existe.');
        } else {
            var randomColor = getRandomLightColor();
            nodes.add({
                id: nodeId,
                label: nodeId,
                color: { border: randomColor, background: randomColor },
                font: { color: '#000000' },
                shape: 'circle',
            });
        }
    }
};

// Editar Nodo
document.getElementById('editNode').onclick = function () {
    var oldId = prompt('Ingrese el ID del nodo a editar:');
    if (!nodes.get(oldId)) return alert('Nodo no encontrado');

    var newId = prompt('Ingrese el nuevo ID del nodo:');
    if (newId && newId !== oldId) {
        if (nodes.get(newId)) return alert('El nuevo ID ya existe.');

        // Actualizar nodo
        nodes.update({ id: oldId, label: newId });

        // Actualizar aristas relacionadas
        edges.get().forEach(edge => {
            if (edge.from === oldId) edge.from = newId;
            if (edge.to === oldId) edge.to = newId;
            edges.update(edge);
        });

        // Cambiar el ID del nodo
        const updatedNode = nodes.get(oldId);
        updatedNode.id = newId;
        nodes.remove(oldId);
        nodes.add(updatedNode);

        alert('Nodo editado correctamente.');
    } else {
        alert('Operación cancelada o ID no válido.');
    }
};

// Eliminar Nodo
document.getElementById('removeNode').onclick = function () {
    var nodeId = prompt('Ingrese el nombre del nodo a eliminar:');
    if (nodeId) {
        // Eliminar aristas relacionadas
        edges.get().forEach(edge => {
            if (edge.from === nodeId || edge.to === nodeId) {
                edges.remove(edge.id);
            }
        });

        // Eliminar nodo
        nodes.remove({ id: nodeId });
        alert(`Nodo ${nodeId} y sus aristas han sido eliminados.`);
    }
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

// Ruta Crítica
document.getElementById('criticalPath').onclick = function () {
    const graph = {};
    edges.get().forEach(edge => {
        if (!graph[edge.from]) graph[edge.from] = [];
        graph[edge.from].push({ to: edge.to, cost: parseInt(edge.label, 10) });
    });

    const findCriticalPath = (node, visited = new Set(), currentPath = [], allPaths = []) => {
        visited.add(node);
        currentPath.push(node);

        if (!graph[node]) {
            allPaths.push([...currentPath]);
        } else {
            for (let edge of graph[node]) {
                if (!visited.has(edge.to)) {
                    findCriticalPath(edge.to, visited, currentPath, allPaths);
                }
            }
        }

        currentPath.pop();
        visited.delete(node);
        return allPaths;
    };

    const allPaths = findCriticalPath(nodes.getIds()[0]);
    const pathCosts = allPaths.map(path =>
        path.slice(1).reduce((acc, node, i) => {
            const edge = edges.get().find(e => e.from === path[i] && e.to === node);
            return acc + (edge ? parseInt(edge.label, 10) : 0);
        }, 0)
    );

    const maxCostIndex = pathCosts.indexOf(Math.max(...pathCosts));
    const criticalPath = allPaths[maxCostIndex];
    alert(`Ruta Crítica: ${criticalPath.join(' -> ')}\nDuración Total: ${pathCosts[maxCostIndex]}`);
};
