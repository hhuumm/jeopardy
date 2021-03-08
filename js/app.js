

// Cached Element Reference
let body = document.body
body.style.backgroundColor="black"

let container = document.createElement('section');
container.setAttribute('class','stage')

let boxes= [];


//Event Handlers
//set box attributes and Styling
container.style.backgroundImage='../images/tile.png'
container.style.height='200px'
container.style.width='300px'
for(let i = 0; i < 36;i++)
{
    
    let box = document.createElement('div')
    if(i<6){box.setAttribute('id',"cat")}
    else{box.setAttribute('id',"box"+(i-6))}
    
   
    box.style.backgroundColor="white"
    box.style.backgroundImage="url(../images/tile.png)"
    box.style.border="2px solid white"
    box.style.borderRadius='10%'
    box.id=='cat'? box.style.fontSize='15px':box.style.fontSize='20px'
    box.innerHTML=(""+box.id).replace("box","")
    boxes.push(box)
    container.appendChild(box)
}
body.appendChild(container)


//Variables
let ret
let cls=[]
let vals=[]
let categories=[]
let cats = []
let counter =30;



//Functions


function getcategories(){

  //Fetches the categories
  return fetch("http://jservice.io/api/categories?count=6")
  .then(response=>{
    return response.json()})
  .then(data =>{
    console.log(data)
    let p=0
  //For each category get clues object and push to cls
    data.forEach((point)=>{
      boxes[p].innerHTML=point.title
       fetch("http://jservice.io/api/clues?category=" + point.id)
      .then(response=>{
        return response.json()})
      .then(dta=>{
          console.log(dta)
          cls.push(dta)
        })
        
        p++
      
    })
    
  })
  }

//Initializes the game
function init(){
  getcategories()
 }



  
  

 
//main script
init()
console.log(cls)
console.log("clues ^^^")

// categories.forEach(cat=>{
// console.log("in the categories")

// })



//stage.append(document.createElement('div')