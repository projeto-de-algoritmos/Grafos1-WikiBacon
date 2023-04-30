import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Edge, Graph, Node } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import { WikipediaService } from './wikipedia.service';
import { parse } from 'angular-html-parser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {

  update$: Subject<boolean> = new Subject()
  zoomToFit$: Subject<boolean> = new Subject()

  nodes: Node[] = [
  ]

  edges: Edge[] = []

  public getScreenWidth: any;
  public getScreenHeight: any;

  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
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

  constructor(private readonly wikipediaService: WikipediaService) {


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

  updatePonto(pagina: string, paginaPai: string, i: number) {
    this.nodes.push({ id: `novoNode${pagina}`, label: pagina, data: { color: Math.floor(Math.random() * 16777215).toString(16) } })
    let idEdge = 'novaEdge' + (Date.now() + i)
    this.edges.push({ id: idEdge, source: paginaPai, target: `novoNode${pagina}` })
    this.edgesMenorCaminho.push(idEdge)

  }

  graph: Graph = {
    edges: this.edges,
    nodes: this.nodes
  }

  async send() {

    this.nodes.push({ id: `paginaOrigem${this.form.get('paginaOrigem')?.value}`, label: this.form.get('paginaOrigem')?.value, data: { color: Math.floor(Math.random() * 16777215).toString(16) } })
    let idNodePai = `paginaOrigem${this.form.get('paginaOrigem')?.value}`;
    let nodeOrigem = this.form.get('paginaOrigem')?.value;
    let htmlPage = await this.wikipediaService.getHtmlPage(nodeOrigem);
    let dom = new DOMParser().parseFromString(htmlPage, 'text/html');
    let listaLinks = Array.from(dom.getElementsByTagName('a')).filter(a => a.rel == 'mw:WikiLink' && a.attributes.getNamedItem('href')?.value.startsWith('./') && this.validLink(a) && !a.classList.contains('mw-disambig') &&  a.innerText);
    listaLinks.slice(0, Math.min(listaLinks.length, 5)).forEach((l, index) => this.updatePonto(l.innerText, idNodePai, index));
    
    this.update$.next(true);
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

}
