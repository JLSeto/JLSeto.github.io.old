import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ScreenDimensions } from '../models/models'

@Injectable({
  providedIn: 'root'
})
export class HelperService 
{
  private  isMobile    : boolean = false;
  private  innerWidth  : number = window.innerWidth;
  private  innerHeight : number = window.innerHeight;

  constructor(private router: Router)
  {
    this.checkifMobile();
  }

  public checkifMobile() : void
  {
    this.isMobile = (navigator.userAgent.match(/Android/i) 
    || navigator.userAgent.match(/webOS/i) 
    || navigator.userAgent.match(/iPhone/i)  
    || navigator.userAgent.match(/iPad/i)  
    || navigator.userAgent.match(/iPod/i) 
    || navigator.userAgent.match(/BlackBerry/i) 
    || navigator.userAgent.match(/Windows Phone/i)) ? true : false;
  }

  public getIsMobile() : boolean
  {
    return this.isMobile;
  }

  public setInnerDimensions(data : ScreenDimensions) : void
  {
    this.innerHeight  = data.height;
    this.innerWidth   = data.width;
  }

  public getInnerWidth() : number
  {
    return this.innerWidth;
  }

  public getInnerHeight() : number
  {
    return this.innerHeight;
  }

  public routerNavigateProject(link: string) : void
  {
    this.router.navigate(['projects/' + link])
  }

  public routerNavigateNotes(link: string) : void
  {
    this.router.navigate(['notes/' + link])
  }

}
