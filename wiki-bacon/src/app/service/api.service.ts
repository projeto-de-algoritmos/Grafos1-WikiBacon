import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private BASE_URL: string = "https://en.wikipedia.org/w/rest.php/v1/page/";

    constructor(private http: HttpClient) {
    }

    public getWikiPage(page: string): Observable<any> {
        return this.http.get<any>(this.BASE_URL + page + '/html')
    }
}
