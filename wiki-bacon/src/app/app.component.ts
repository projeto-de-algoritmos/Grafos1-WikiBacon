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
}
