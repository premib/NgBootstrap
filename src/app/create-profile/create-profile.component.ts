import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpService } from "../http.service";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators"
import { NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.css'],
  styles:[`
  .my-custom-class {
    background: black;
    font-size: 125%;
  }
  `],
  providers: [NgbTypeaheadConfig]
})
export class CreateProfileComponent implements OnInit {
  
  userForm;
  allDet: Array<any>= [];
  images: Array<any>= [];
  public model: any;
  names: Array<any>= [];
  search  ;
  nameToId: object= {};
  selectedId: string;
  refObj;
  iter: number= 0;
  showButton: boolean= false;

  
  constructor(private   sanitizer: DomSanitizer, private fb: FormBuilder, private http:HttpService, config: NgbTypeaheadConfig, private modalService: NgbModal) { 
    config.showHint = true;
    this.userForm= this.fb.group({
      'name': ['', [Validators.required, Validators.maxLength(20), Validators.minLength(6)]],
      'email': ['', [Validators.required, Validators.email]],
      'department': ['', [Validators.required]],
      'eid': ['', [Validators.required]],
      'joiningDate': ['', [Validators.required]]  ,
      'image1': [''],
      'image2': [''],
      'image3': ['']
    });

    this.http.getInfo().subscribe(
      data=> {
        for(let temp of data){
          console.log(temp)
          this.allDet[temp.id]={name: temp.name, email: temp.email, joinedAt:temp.createdAt,   deptId: temp.deptId, image1: temp.image1, image2: temp.image2, image3: temp.image3};
          this.names.push(temp.name);
          this.nameToId[temp.name]= temp.id;
          this.iter= +temp.id;
        }
      },
      err => console.log("error", err),
      () => console.log("finally")
    )

    this.search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.names.filter(v => v.toLowerCase().startsWith(term.toLocaleLowerCase())).splice(0, 10)));
    
  }

  changeImage(event): void{
    console.log(event.target.value, this.nameToId[event.target.value]);
    this.refObj= this.allDet[this.nameToId[event.target.value]];
    console.log(this.refObj)
    this.images= [this.refObj.image1, this.refObj.image2, this.refObj.image3];
    this.showButton= true;
  }
  ngOnInit(): void {
  }

  openLg(content): void {
    this.modalService.open(content, { size: 'lg' });
  }

  submits(form: FormGroup): void{ 
      this.names.push(form.value.name);
      this.nameToId[form.value.name]= ++this.iter;
      // this.sanitization.bypassSecurityTrustStyle
      console.log({name: form.value.name, email: form.value.email, joinedAt:form.value.joiningDate,   deptId: form.value.department, image1: this.sanitizer.bypassSecurityTrustHtml(form.value.image1), image2: form.value.image2, image3: form.value.image3});
      this.allDet[this.iter]= {name: form.value.name, email: form.value.email, joinedAt:form.value.joiningDate,   deptId: form.value.department, image1: this.sanitizer.bypassSecurityTrustHtml(form.value.image1), image2: form.value.image2, image3: form.value.image3};
  }

}
