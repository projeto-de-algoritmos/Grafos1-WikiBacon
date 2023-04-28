import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WikipediaService {

  constructor(private readonly httpClient: HttpClient) { }

  getHtmlPage(pageTitle: string) {
    return lastValueFrom(this.httpClient.get(`https://pt.wikipedia.org/w/rest.php/v1/page/${pageTitle}/html`, { responseType: 'text' }))
  }

}
