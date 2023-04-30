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

  async buildGraph(startPage: string) {
    const queue: string[] = []
    const nodeSet = new Set<string>()
    const maxLayer = this.form.get('camadas')?.value
    let layer = 0
    queue.push(startPage)
    this.nodes.push({ id: startPage, label: startPage, data: { color: Math.floor(Math.random() * 16777215).toString(16) } })
    nodeSet.add(startPage)
    while(queue.length > 0 && layer < maxLayer) {
      let layerSize = queue.length
      while(layerSize-- > 0) {
        console.log("ok")
        let currPage = queue.shift()
        let htmlPage = ""
        try {
          htmlPage = await this.wikipediaService.getHtmlPage(currPage!);
        } catch(e) {
          continue
        }
        let dom = new DOMParser().parseFromString(htmlPage, 'text/html');
        let listaLinks = Array.from(dom.getElementsByTagName('a')).filter(a => 
          a.rel == 'mw:WikiLink' && 
          a.attributes.getNamedItem('href')?.value.startsWith('./') && 
          this.validLink(a) && 
          !a.classList.contains('mw-disambig') && 
          a.innerText);
        listaLinks.slice(0, Math.min(listaLinks.length, 5)).forEach((l, index) => {
          let childPage = this.getNameFromUrl(l.pathname)
          if(!nodeSet.has(childPage)) {
            queue.push(childPage)
            nodeSet.add(childPage)
            this.nodes.push({ id: childPage, label: l.innerHTML, data: { color: Math.floor(Math.random() * 16777215).toString(16) } })
            this.edges.push({ id: `${currPage}-${childPage}`, source: currPage!, target: childPage })
          }
        });
      }
      layer++
    }
  }

  graph: Graph = {
    edges: this.edges,
    nodes: this.nodes
  }

  async send() {
  }

  validLink(a: HTMLAnchorElement) {
    const failedLinks = ['Wikipédia:', 'Ficheiro:', 'Categoria:', 'Predefinição:', 'Wikiquote', 'Especial:', 'Wikcionário']
    for (const l of failedLinks) {
      if (a.attributes.getNamedItem('href')?.value.search(l) != -1 || a.parentNode?.nodeName == "CITE" || a.parentNode?.nodeName == "I" || a.parentNode?.nodeName == "small") return false;
    }
    return true;
  }

  getNameFromUrl(url: string) {
    return url.replace('/wiki/', '')
  }

  colorEdge(tId: string) {
    const color = this.edgesUtilizadas.map(e => e.id).includes(tId) ? 'red' : 'black'
    return color;
  }
}
