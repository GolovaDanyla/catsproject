import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'catsproject';
  myControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]>;
  response: any;
  breedsCollection: any;
  foundDataCollection: any;
  
  mapOfNames: Map<string, string> = new Map<string, string>([]);

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.filteredOptions = new Observable();

  }
  onLike(breedId: string, breedName: string) {
    this.search(breedId, breedName);
  }
  search(
    breedId: string | null | undefined = null,
    breedName: string | null | undefined = null
  ) {
    if(!breedId) {
      breedName = this.myControl.value as string;
      if(!breedName) {
        this.foundDataCollection = null;
        this.breeds();
        return;
      }
  
      breedId = this.mapOfNames.get(breedName);
    }
    this.http.get<any>(`https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=10`)
      .subscribe((response) => {
        ;
        this.foundDataCollection = response.map((i: any) => {
          return {
            id: breedId,
            name: breedName,
            url: i.url
          }
        });
        
        console.log(this.foundDataCollection);
        
        this.cdr.detectChanges();
      })
  }
  // https://api.thecatapi.com/v1/breeds
  breeds() {
    // options
    const breed = this.myControl.value;
    this.http.get('https://api.thecatapi.com/v1/breeds')
      .subscribe((response: any) => {
        this.response = response.map((i: any) => {
          this.mapOfNames.set(i.name, i.id);
          return {
            id: i.id,
            name: i.name,
            url: i?.image?.url
          }
        });
        this.breedsCollection = this.response;
        this.options = response.map((i: any) => i.name);
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || '')),
        );
        console.log(this.response);
        console.log('this.mapOfNames', this.mapOfNames);
        this.cdr.detectChanges();
      })
  }

  ngOnInit() {
    this.breeds();

  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
