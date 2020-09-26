#!/usr/bin/env node

const cb = require('clipboardy');
const util = require('util');
const gpix = util.promisify(require('get-pixels'));

const img = process.argv[2];
if(!img){
    console.log("an image must be specified!");
    process.exit();
}
const fwid = (Number(process.argv[3])|0) || 50;

// const palette = ['🌑','🌒','🌓','🌔','🌕'];
const palette = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

const contrast = x=>1/(1+Math.exp(-15*(x-0.5) ));

gpix(img)
.then(pix=>{
    if(pix.shape[0] == 1) pix = pix.pick(0);
    const incx = pix.shape[0]/fwid;
    const incy = incx*1.7;
    if(incx < 1)
        return console.log("image is smaller than ascii canvas! try with", pix.shape[0]);
    let bright = new Float32Array(fwid*(pix.shape[1]/incy)|0);
    let max_bright = 0;
    let min_bright = 500;
    for(let Y=0; Y<pix.shape[1]/incy; Y++){
        for(let X=0; X<fwid; X++){
            const x = (X*incx)|0;
            const y = (Y*incy)|0;
            const perceived = pix.get(x, y, 3)>0 ? (
                0.299*pix.get(x, y, 0) + 
                0.587*pix.get(x, y, 1) + 
                0.114*pix.get(x, y, 2))
                : 0;

            bright[X+Y*fwid] = (perceived);
            max_bright = Math.max(perceived, max_bright);
            min_bright = Math.min(perceived, min_bright);
        }
    }
    let out = '';
    for(let i=0, j=0; i<bright.length; i++, j++){
        if(j==fwid){
            out += '\n';
            j=0;
        }
        out += palette[(
            contrast((bright[i]-min_bright)/(max_bright-min_bright+1))
            *palette.length
            )|0];
    }
    return out;
})
.then(txt=>{
    console.log(txt);
    cb.writeSync(txt);
    console.log('\nresult copied to clipboard...');
})
.catch(err=>{
    console.log(`file "${img}" couldn't be loaded!`);
    console.log(err);
})
