import { Component } from '@angular/core';
import { Edge, Graph, Node } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  update$: Subject<boolean> = new Subject()
  nodes: Node[] = [
    {
      id: 'A',
      label: 'Node A'
    },
    {
      id: 'B',
      label: 'Node B'
    }
  ]

  edges: Edge[] = [{
    id: 'a',
    source: 'A',
    target: 'B'
  }]

  edgesMenorCaminho: string[] = []

  updatePonto() {
    let idNew = Date.now().toString()
    this.nodes.push({ id: `novoNode${idNew}`, label: 'Node C', data: { color: Math.floor(Math.random() * 16777215).toString(16) } })
    let idEdge = 'novaEdge' + Date.now()
    this.edges.push({ id: idEdge, source: 'A', target: `novoNode${idNew}` })
    this.edgesMenorCaminho.push(idEdge)
    this.update$.next(true)
  }

  graph: Graph = {
    edges: this.edges,
    nodes: this.nodes
  }

  getStrokeLine(id: string) {
    return this.edgesMenorCaminho.includes(id) ? 'red' : 'black'
  }

}
