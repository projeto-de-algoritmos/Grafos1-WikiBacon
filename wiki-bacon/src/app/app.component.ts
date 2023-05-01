import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DagreClusterLayout, Edge, Graph, Layout, Node } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import { WikipediaService } from './wikipedia.service';
import { parse } from 'angular-html-parser';
import { GraphService } from './service/graph.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {

  update$: Subject<boolean> = new Subject()
  statusBotao: string = 'Enviar';
  zoomToFit$: Subject<boolean> = new Subject()
  loadingStatus: boolean = false
  edgesUtilizadas: Edge[] = []
  nodes: Node[] = []

  edges: Edge[] = []

  public getScreenWidth: any;
  public getScreenHeight: any;
  selectedIndex: number = 0;

  ngOnInit() {
    this.getScreenWidth = window.screen.availWidth;
    this.getScreenHeight = window.screen.availHeight;
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.screen.availWidth;
    this.getScreenHeight = window.screen.availWidth;
  }

  edgesMenorCaminho: string[] = []

  form: FormGroup = new FormGroup(
    {
      paginaDestino: new FormControl(null, Validators.required),
      paginaOrigem: new FormControl(null, Validators.required),
      camadas: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(3)])
    }
  )
  htmlPaginaDestino?: string;
  htmlPaginaOrigem?: string;


  constructor(private changeDetector: ChangeDetectorRef, private readonly wikipediaService: WikipediaService, private readonly graphService: GraphService, private readonly snackbar: MatSnackBar) {


  }

  openSnackBar() {
    this.snackbar.open(`Pàgina: ${this.form.get('paginaDestino')?.value} não encontrada.`, 'Ok!', { duration: 2000 })
  }


  async buildGraph(startPage: string) {
    const queue: string[] = []
    const nodeSet = new Set<string>()
    const maxLayer = this.form.get('camadas')?.value
    let layer = 0
    queue.push(startPage)
    this.nodes = []
    this.edges = []

    this.nodes.push({ id: startPage, label: startPage.replaceAll("_", " ").toLowerCase(), data: { color: Math.floor(Math.random() * 16777215).toString(16) } })
    nodeSet.add(startPage)
    while (queue.length > 0 && layer < maxLayer) {
      let layerSize = queue.length
      while (layerSize-- > 0) {
        let currPage = queue.shift()
        let htmlPage = ""
        try {
          htmlPage = await this.wikipediaService.getHtmlPage(currPage!);
        } catch (e) {
          continue
        }
        let dom = new DOMParser().parseFromString(htmlPage, 'text/html');
        let listaLinks = Array.from(dom.getElementsByTagName('a')).filter(a =>
          a.rel == 'mw:WikiLink' &&
          a.attributes.getNamedItem('href')?.value.startsWith('./') &&
          this.validLink(a) &&
          !a.classList.contains('mw-disambig') &&
          a.innerText && !a.innerHTML.includes('<span'));
        listaLinks.slice(0, Math.min(listaLinks.length, 5)).forEach((l) => {
          let childPage = this.getNameFromUrl(l.pathname)
          if (!nodeSet.has(childPage)) {
            queue.push(childPage)
            nodeSet.add(childPage)
            this.nodes.push({ id: childPage, label: childPage.replaceAll("_", " ").toLowerCase(), data: { color: Math.floor(Math.random() * 16777215).toString(16) } })
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
    this.edgesUtilizadas = []
    this.loadingStatus = true
    this.statusBotao = "Construindo Grafo das Páginas ..."
    this.changeDetector.detectChanges()
    await this.buildGraph(this.form.get('paginaOrigem')?.value)
    const graph: Graph = { nodes: this.nodes, edges: this.edges }
    if (!this.nodes.find(n => n.label == this.form.get('paginaDestino')?.value.toLowerCase())!) {
      this.openSnackBar()
      this.update$.next(true)
      this.statusBotao = "Enviar"
      this.loadingStatus = false
      this.changeDetector.detectChanges()
      this.selectedIndex++;
    } else {
      const bfsTree = this.graphService.bfs(graph, this.nodes.find(n => n.label == this.form.get('paginaOrigem')?.value.toLowerCase())!, this.nodes.find(n => n.label == this.form.get('paginaDestino')?.value.toLowerCase())!)
      this.statusBotao = "Construindo BFS Tree através de uma BFS no Grafo Gerado ..."
      this.changeDetector.detectChanges()

      bfsTree.edges.forEach(e => {
        if (!bfsTree.nodes.find(n => n.id == e.target)) {
          bfsTree.nodes.push({ id: e.target, label: e.target.replaceAll("_", " ").toLowerCase() })
        }
      });

      this.nodes = bfsTree.nodes
      this.edges = bfsTree.edges



      const nodesUtilizados = this.graphService.dfsPrepare(bfsTree, this.nodes.find(n => n.label == this.form.get('paginaOrigem')?.value.toLowerCase())!, this.nodes.find(n => n.label == this.form.get('paginaDestino')?.value.toLowerCase())!).split('->')
      this.statusBotao = "Rodando uma DFS na BFS Tree para encontrar o menor caminho"
      this.changeDetector.detectChanges()

      for (let i = 0; i < nodesUtilizados.length - 2; i++) {
        this.edgesUtilizadas.push(this.edges.find(e => e.source == nodesUtilizados[i] && e.target == nodesUtilizados[i + 1])!)
      }
      this.update$.next(true)
      this.statusBotao = "Enviar"
      this.changeDetector.detectChanges()

      this.loadingStatus = false

      this.selectedIndex++;
    }


  }

  validLink(a: HTMLAnchorElement) {
    const failedLinks = ['Wikipédia:', 'Ficheiro:', 'Categoria:', 'Predefinição:', 'Predefinição_Discussão:', 'Wikiquote', 'Especial:', 'Wikcionário', ':Infocaixa']
    for (const l of failedLinks) {
      if (a.attributes.getNamedItem('href')?.value.search(l) != -1 || a.parentNode?.nodeName == "CITE" || a.parentNode?.nodeName == "I" || a.parentNode?.nodeName == "small") return false;
    }
    return true;
  }

  getNameFromUrl(url: string) {
    return decodeURI(url.replace('/wiki/', '').replaceAll('(', '').replaceAll(')', '').normalize('NFC'))
  }

  colorEdge(tId: string) {
    const color = this.edgesUtilizadas.map(e => e.id).includes(tId) ? '#0012FF' : '#CCCCCC'
    return color;
  }

  colorTextNode(nId: string) {
    return (this.edgesUtilizadas.map(e => e.source).includes(nId) || this.edgesUtilizadas.map(e => e.target).includes(nId)) ? 'black' : '#A69E9C'
  }

  colorNode(nId: string) {
    return (this.edgesUtilizadas.map(e => e.source).includes(nId) || this.edgesUtilizadas.map(e => e.target).includes(nId)) ? this.nodes.find(n => n.id == nId)?.data.color : '#CCCCCC'
  }

}
