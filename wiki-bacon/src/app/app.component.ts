import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DagreClusterLayout, Edge, Graph, Layout, Node } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import { WikipediaService } from './wikipedia.service';
import { parse } from 'angular-html-parser';
import { GraphService } from './service/graph.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {

  update$: Subject<boolean> = new Subject()
  zoomToFit$: Subject<boolean> = new Subject()
  edgesUtilizadas: Edge[] = []
  nodes: Node[] = [
  ]

  edges: Edge[] = []

  public getScreenWidth: any;
  public getScreenHeight: any;

  ngOnInit() {
    this.getScreenWidth = window.screen.availWidth;
    this.getScreenHeight = window.screen.availHeight;

    this.testeBfs()
  }
  testeBfs() {
    const graph: Graph = { nodes: [{ id: 'node1', label: 'Node1' }, { id: 'node2', label: 'Node2' }, { id: 'node3', label: 'Node3' }, { id: 'node4', label: 'Node4' }, { id: 'node5', label: 'Node 5' }, { id: 'node6', label: 'Node 6' }], edges: [{ id: 'edge1', source: 'node1', target: 'node2' }, { id: 'edge2', source: 'node1', target: 'node3' }, { id: 'edgeNova', source: 'node2', target: 'node3' }, { id: 'edge3', source: 'node3', target: 'node5' }, { id: 'edge6', source: 'node2', target: 'node4' }, { id: 'edge8', source: 'node4', target: 'node6' }, { id: 'edge9', source: 'node2', target: 'node6' }] }
    this.nodes = graph.nodes
    this.edges = graph.edges
    const bfsTree: Graph = this.graphService.bfs(graph, this.nodes.find(n => n.id == 'node1')!, this.nodes.find(n => n.id == 'node4')!)
    bfsTree.edges.forEach(e => {
      if (!bfsTree.nodes.find(n => n.id == e.target)) {
        bfsTree.nodes.push({ id: e.target, label: e.target.charAt(0).toUpperCase() + e.target.slice(1) })
      }
    });
    this.edgesUtilizadas = []
    this.nodes = bfsTree.nodes
    this.edges = bfsTree.edges
    const nodesUtilizados = this.graphService.dfsPrepare(bfsTree, this.nodes.find(n => n.id == 'node1')!, this.nodes.find(n => n.id == 'node4')!).split(' ')
    for (let i = 0; i < nodesUtilizados.length - 2; i++) {
      this.edgesUtilizadas.push(this.edges.find(e => e.source == nodesUtilizados[i] && e.target == nodesUtilizados[i + 1])!)
    }
    console.log(this.edgesUtilizadas)
    this.update$.next
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.screen.availWidth;
    this.getScreenHeight = window.screen.availWidth;
  }

  edgesMenorCaminho: string[] = []

  form: FormGroup = new FormGroup(
    {
      paginaDestino: new FormControl(),
      paginaOrigem: new FormControl(),
      camadas: new FormControl()
    }
  )
  htmlPaginaDestino?: string;
  htmlPaginaOrigem?: string;

  constructor(private readonly wikipediaService: WikipediaService, private readonly graphService: GraphService) {


  }

  graph: Graph = {
    edges: this.edges,
    nodes: this.nodes
  }

  async send() {

  }

  colorEdge(tId: string) {
    const color = this.edgesUtilizadas.map(e => e.id).includes(tId) ? '#0012FF' : '#CCCCCC'
    return color;
  }

  colorTextNode(nId: string) {
    return (this.edgesUtilizadas.map(e => e.source).includes(nId) || this.edgesUtilizadas.map(e => e.target).includes(nId)) ? 'black' : '#CCCCCC'
  }

  colorNode(nId: string) {
    return (this.edgesUtilizadas.map(e => e.source).includes(nId) || this.edgesUtilizadas.map(e => e.target).includes(nId)) ? this.nodes.find(n => n.id == nId)?.data.color : '#CCCCCC'
  }

}
