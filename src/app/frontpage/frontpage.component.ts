import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HelperService } from '../helpers/services/helper.service';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})

export class FrontpageComponent implements OnInit 
{
    public  faviconImg : string = './assets/favicon.png';
    private resume     : string = './assets/JimmyS_Resume.pdf'
    public  mailTo     : string = 'mailto:jseto@jimmyseto.com';
    public  gameMsg    : string = '';

    @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
    private ctx: CanvasRenderingContext2D | null = null as any;

    //Resources
    public Resources: Resources;
    //Engine
    public lastTime: number = Date.now();

    //App
    //public Enemy: Enemy;

    public allEnemies   : Enemy[] = [];
    public player       : Player = null as any;
    public keyItem      : KeyItem = null as any;
    public gotKey       : boolean = false;
    public resetCounter : number  = -1;
    public winCounter   : number = 0;
    public loseCounter  : number = 0;
    
    constructor(public hS : HelperService, public cd: ChangeDetectorRef)
    {
        this.Resources = new Resources();

        this.Resources.load([
        './assets/frogger/char-boy.png',
        './assets/frogger/enemy-bug.png',
        './assets/frogger/Heart.png',
        './assets/frogger/stone-block.png',
        './assets/frogger/char-cat-girl.png',
        './assets/frogger/Gem Blue.png',
        './assets/frogger/Key.png',
        './assets/frogger/water-block.png',
        './assets/frogger/char-horn-girl.png',
        './assets/frogger/Gem Green.png',
        './assets/frogger/Rock.png',
        './assets/frogger/char-pink-girl.png',
        './assets/frogger/Gem Orange.png',
        './assets/frogger/Selector.png',
        './assets/frogger/char-princess-girl.png',
        './assets/frogger/grass-block.png',
        './assets/frogger/Star.png',
        ]);
    }

    ngOnInit(): void 
    {
        this.ctx = this.canvas.nativeElement.getContext('2d');
        this.canvas.nativeElement.width = 505;
        this.canvas.nativeElement.height = 606;
        this.keyItem = new KeyItem(this.ctx, this.Resources, this.cd);
        this.player = new Player(this.ctx, this.Resources, this.cd, this.keyItem);

        for(let i = 0; i < 2; i++)
        {
            this.allEnemies.push(new Enemy(this.ctx, this.Resources, this.cd, this.player));
        }
        
        this.Resources.onReady(this.init); //initialize

        document.addEventListener('keyup', (e) => 
        {
            this.player.handleInput(e.key);
        });

        window.addEventListener("keydown", function(e) {
            if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
    }

    public downloadResume() : void
    {
        let link = document.createElement('a');
        link.href = this.resume;
        link.download = "JimmySeto_Resume.pdf";
        link.click();
        link.remove();
    }

    //Start Engine
    public main = () =>
    {
        let now = Date.now();
        let dt = (now - this.lastTime) / 1000.0;
        this.update(dt);
        this.render();
        this.lastTime = now;
        window.requestAnimationFrame(this.main);
    }

    public update(dt : number)
    {
        this.checkCollisions();
        this.updateEntities(dt);
    }
    
    public checkCollisions()
    {
        if(this.gotKey)
        {
            return;
        }

        if(true)
        {

        }

        if(this.player.x == this.keyItem.x && this.player.y == this.keyItem.y)
        {
            this.resetCounter = 3;
            this.gotKey = true;
            this.gameMsg = 'You Win! Resetting in ';
            this.player.disable = true;
            this.keyItem.disable = true;
            this.winCounter++;
            var refreshInteval = setInterval(() => 
            {
                this.resetCounter--;
                if(this.resetCounter <= 0)
                {
                    this.player.disable = false;
                    this.keyItem.disable = false;
                    this.gameMsg = '';
                    this.player.x = 202; //0 is first column. 101 is 2nd.
                    this.player.y = 374.5; //41.5 is middle of a row 41.5*9
                    this.gotKey = false;
                    for(let i = 0; i < 2; i++)
                    {
                        this.allEnemies.push(new Enemy(this.ctx, this.Resources, this.cd, this.player));
                    }
                    clearInterval(refreshInteval);
                }
                
            }, 1000)
        }
    }

    public updateEntities(dt : number)
    {
        this.allEnemies.forEach((enemy) => 
        {
            let x = enemy.update(dt);
            if(x)
            {
                this.loseCounter++;
            }
        });

        this.player.update();
    }


    private render() : void
    {
        let rowImages = 
        [
        './assets/frogger/water-block.png',   // Top row is water
        './assets/frogger/stone-block.png',   // Row 1 of 3 of stone
        './assets/frogger/stone-block.png',   // Row 2 of 3 of stone
        './assets/frogger/stone-block.png',   // Row 3 of 3 of stone
        './assets/frogger/stone-block.png',   // Row 1 of 2 of grass
        './assets/frogger/grass-block.png'    // Row 2 of 2 of grass
        ], numRows = 6, numCols = 5, row, col;

        this.ctx?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

        for (row = 0; row < numRows; row++) 
        {
            for (col = 0; col < numCols; col++)
            {
                if(row == 0 && col == numCols - 1)
                {
                    this.ctx!.drawImage(this.Resources.get('./assets/frogger/stone-block.png'), col * 101, row * 83);
                }
                else
                {
                    this.ctx!.drawImage(this.Resources.get(rowImages[row]), col * 101, row * 83);
                }
            }
        }
        this.renderEntities();
    }

    renderEntities()
    {
        this.allEnemies.forEach(function(enemy : Enemy)
        {
            enemy.render();
        });

        this.player.render();
        this.keyItem.render();
    }

    init = () =>
    {
        //this.reset();
        this.lastTime = Date.now();
        this.main();
    }
}

class Enemy
{
    private sprite  : string = './assets/frogger/enemy-bug.png';
    public x        : number = -101;
    public y        : number = 0;
    private speed   : number = Math.floor(Math.random()*400);

    constructor(private ctx: CanvasRenderingContext2D | null, private resources: Resources, private cd: ChangeDetectorRef, private player: Player)
    {
        this.y = this.randomEnemies();
    }

    public randomEnemies = function() : number
    {
        var set = [42.5, 125.5, 208.5, 291.5];
        var rndm =  Math.floor(Math.random()*4);
        return set[rndm];
    }

    public update = (dt: number) : boolean =>
    {
        this.x += this.speed * dt;
        this.x = (this.x > 505) ? (-101) : (this.x + 1);

        let minRange = Math.floor(this.x - 50);
        let maxRange = Math.floor(this.x + 50);
    
        if(this.y == this.player.y)
        {
          if((this.player.x > minRange && this.player.x < this.x) || (this.player.x > this.x && this.player.x < maxRange))
          {
            this.player.x = 202; //0 is first column. 101 is 2nd.
            this.player.y = 374.5; //41.5 is middle of a row 41.5*9
            return true;
          }
        }

        return false;
    }

    public render = () : void => 
    {
        this.ctx?.drawImage(this.resources.get(this.sprite), this.x, this.y);
        this.ctx?.save();
        //this.cd.detectChanges();
    }
}

class Resources
{
    //Resources
    public resourceCache    : any = {};
    public loading          : any = [];
    public readyCallbacks   : any = [];

    constructor()
    {

    }

    public load(urlOrArr : any) : void
    {
        if(urlOrArr instanceof Array)
        {
            urlOrArr.forEach((url) =>
            {
                this._load(url);
            });

            console.log(this.get('./assets/frogger/Star.png'));
        }
        else
        {
        this._load(urlOrArr);
        }
    }

    private _load(url : any)
    {
        if(this.resourceCache[url])
        {
            return this.resourceCache[url];
        } 
        else 
        {
            let img = new Image();
            
            img.onload = () => 
            {
                this.resourceCache[url] = img;
                if(this.isReady())
                {
                    this.readyCallbacks.forEach(function(func : any) { func(); });
                }
            };
            this.resourceCache[url] = false;
            img.src = url;
        }
    }

    public get(url: any)
    {
        return this.resourceCache[url];
    }

    public isReady()
    {
        let ready = true;
        for(var k in this.resourceCache) 
        {
            if(this.resourceCache.hasOwnProperty(k) &&
            !this.resourceCache[k]) 
            {
                ready = false;
            }
        }
        return ready;
    }

    onReady(func : any)
    {
        this.readyCallbacks.push(func);
    }
}

class Player
{
    private sprite  : string = './assets/frogger/char-boy.png';
    private arrChar : string[];
    private charIdx : number = 0;
    public x        : number = 202;
    public y        : number = 374.5;
    public disable  : boolean = false;

    constructor(private ctx: CanvasRenderingContext2D | null, private resources: Resources, private cd: ChangeDetectorRef, private keyItem: KeyItem)
    {
        this.arrChar = 
        [
            './assets/frogger/char-boy.png',
            './assets/frogger/char-cat-girl.png',
            './assets/frogger/char-horn-girl.png',
            './assets/frogger/char-pink-girl.png',
            './assets/frogger/char-princess-girl.png',
        ];
    }   
    
    public update = () : void =>
    {
        if(this.disable)
        {
            return;
        }

        if(this.x > 404 || this.x < 0 || this.y > 415 || this.y < 0)
        {
            this.x = 202;
            this.y = 374.5;
        }
    }

    public handleInput = (keys : any) : void => 
    {
        if(this.disable)
        {
            return;
        }

        switch(keys)
        {
          case 'ArrowUp':
            this.y -=83;
          break;
          
          case 'ArrowDown':
            this.y +=83;
          break;
          
          case 'ArrowLeft':
            this.x -=101;
          break;
          
          case 'ArrowRight':
            this.x +=101;
          break;
        }
    }

    public render = () : void => 
    {
        this.ctx?.drawImage(this.resources.get(this.sprite), this.x, this.y);
        this.ctx?.save();
        this.cd.detectChanges();
    }

    public changeCharacter() : void
    {
        this.charIdx = (this.charIdx >= this.arrChar.length - 1) ? 0 : (this.charIdx + 1);
        this.sprite = this.arrChar[this.charIdx];
    }
}

class KeyItem
{
    public disable  : boolean   = false;
    private sprite  : string    = './assets/frogger/Key.png';
    public x        : number    = 404;
    public y        : number    = -40.5;

    constructor(private ctx: CanvasRenderingContext2D | null, private resources: Resources, private cd: ChangeDetectorRef){}

    public render = () : void => 
    {
        if(this.disable)
        {
            return;
        }
        else
        {
            this.ctx?.drawImage(this.resources.get(this.sprite), this.x, this.y);
            this.ctx?.save();
            this.cd.detectChanges();
        }
    }
}