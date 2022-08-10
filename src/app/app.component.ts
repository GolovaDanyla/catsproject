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
  options: string[] = ['bang', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  userName: string = "";
  response: any;
  breedsCollection: any;
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.filteredOptions = new Observable();

  }
  search() {
    const breed = this.myControl.value;
    this.http.get(`https://api.thecatapi.com/v1/images/search?breed_ids=${breed}`)
      .subscribe((response) => {
        this.response = response;
        console.log(this.response);
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
          return {
            name: i.name,
            url: i?.image?.url
          }
        });
        this.breedsCollection = this.response;
        this.options = response.map((i:any) => i.id);
        console.log(this.response);
        this.cdr.detectChanges();
      })
  }

  ngOnInit() {
    this.breeds();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
