import { Injectable } from '@angular/core';
import { Graph, Node } from '@swimlane/ngx-graph';

@Injectable({
    providedIn: 'root'
})
export class GraphService {

    constructor() {

    }

    bfs(g: Graph, s: Node, t: Node) {
        let fila: Node[] = [s];

        const visitados: Node[] = []
        let bfsTree: Graph = { edges: [], nodes: [] };

        while (fila.length > 0) {
            const n: Node = fila.shift() as Node;
            // Obtém Vizinhos de 'n'
            const vizinhos: Node[] = g.edges.filter(e => e.source == n.id) // Lista de Edges que partem de n
                .map(e => g.nodes.find(v => v.id == e.target) as Node) //Obtém os nós vizinhos
            const vizinhosNaoVisitados: Node[] = vizinhos.filter(viz => !visitados.find(vis => vis == viz))
            bfsTree.nodes.push(n);
            if(n.id==t.id) {return bfsTree;}
            for (const v of vizinhosNaoVisitados) {
                bfsTree.edges.push({ id: `e_${n.id}_${v.id}`, source: n.id, target: v.id })
                visitados.push(v);
                fila.push(v)
            }
        }


        return bfsTree

    }

    dfsPrepare(g: Graph, s: Node, t: Node) {
        const visitadosCadaDfs: Node[] = [s]

        return this.dfs(g, s, t, visitadosCadaDfs, `${s.id}->`)
    }

    dfs(g: Graph, s: Node, t: Node, visitados: Node[], path: string): string {
        if (s.id == t.id) {
            return path;
        } else {
            const vizinhos: Node[] = g.edges.filter(e => e.source == s.id) // Lista de Edges que partem de n
                .map(e => g.nodes.find(v => v.id == e.target) as Node) //Obtém os nós vizinhos
            const vizinhosNaoVisitados: Node[] = vizinhos.filter(viz => !visitados.find(vis => vis == viz))
            for (let v of vizinhosNaoVisitados) {
                visitados.push(v)
                const resultado = this.dfs(g, v, t, visitados, path.concat(`${v.id}->`))
                if (resultado != "") {
                    return resultado;
                }
            }
        }
        return "";
    }


}
