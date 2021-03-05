

// Cached Element Reference
let body = document.body
body.style.backgroundColor="black"

let container = document.createElement('section');
container.setAttribute('class','stage')

let boxes= [];


//Event Handlers
//set box attributes
for(let i = 0; i < 36;i++)
{
    let box = document.createElement('div')
    box.setAttribute('id',"box"+i)
   
    box.style.backgroundColor="white"
    box.style.backgroundImage="url(../images/tile.png)"
    box.style.border="2px solid white"
    box.style.fontSize="8vmin"
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
let counter =1;



//Functions
function addCategory(id){

 return fetch(`http://jservice.io/api/category?id=${id}}`)
  .then(response=>{
      ret = response.json()
      
    return ret
  }).then(response1=>{
    
    cls= response1.clues
    console.log("Outside")
    console.log(ret)
    console.log(response1)
    console.log(cls)
    console.log(counter)
counter ++;
  })


}

function getcategories(){

  return fetch("http://jservice.io/api/categories?count=18").then(response=>{
  return response.json()
  }).then(data =>{
  data.map(cat=>{
categories.push({id:cat.id}) })
})
}

function init(){
  getcategories()
  console.log("words")
  console.log(categories)
  
  
  for(let i = 0; i<categories.length;i++)
  {
    console.log("in the categories")
  }
  
  }

  
  
 
//main script
init()

// categories.forEach(cat=>{
// console.log("in the categories")

// })



//stage.append(document.createElement('div')