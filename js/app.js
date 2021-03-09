

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
    if(i<6)
    {
        box.setAttribute('id',"cat")
        
    }
    else{ box.setAttribute('id',(i+6))
          box.setAttribute('state',false)
  }
    
   
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
let score = 0;
let rand = parseInt(((Math.random()*30)+6))
let categories=[]


//Calls
getcategories()

//Functions


async function getcategories()
{
console.log("This is the random number::"+rand)
  const data = await( await fetch("http://jservice.io/api/categories?count=6")).json()

  //Fetches the categories
  const cluePromises = data.map(clue =>
    fetch(`http://jservice.io/api/category?id=${clue.id}`).then(req => req.json()))

  categories = await Promise.all(cluePromises)
  
  for(let i = 0;i<6;i++)
{
  let clue =categories[i]
    boxes[i].innerHTML=clue.title

    clue.clues.forEach(cl=>{
    
    if(boxes[i+6].innerHTML<100&&(cl.value==200 || (cl.value==100 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
      boxes[i+6].innerHTML=200
      let dailyDouble=null;
      boxes[i+6].addEventListener("click",()=>
      {

        let box = boxes[i+6]
        let timer =30
        if(boxes.indexOf(box)==rand)
        {
          dailyDouble=parseInt(prompt("WELCOME TO THE DAILY DOUBLE\n The Category::"+clue.title.toUpperCase()+"\nHow Much Would You Like To Wager?"))
          while( isNaN(dailyDouble) || dailyDouble<5 || (dailyDouble>1000 && score<1000) )
          {
            dailyDouble=parseInt(prompt("Please bet up to either "+score+" or $1000 and a min of $5"))
            
          }
           }
           console.log(cl.answer)
          let answer=prompt(""+clue.title.toUpperCase()+"\n"+cl.question + "\n\n\n What is ______?")
       
          
          let check = cl.answer.toLowerCase()
          console.log(dailyDouble)
          if(answer==null||timer==-1)
          {
            if(dailyDouble==null){
            console.log("No Points")}
            else
            {
              score-=dailyDouble
          if(score<0)
          {
            score =0
          }

            }
          }
          else
          {
            answer = answer.toLowerCase()
            if(answer==check)
            {
              score += 200
              console.log("you currently have $",score)
            }
          }
      
        box.innerHTML=""
       
      },{once:true})
    }
    if(boxes[i+12].innerHTML<100&&(cl.value==400 || (cl.value==200 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
    boxes[i+12].innerHTML=400
    let timer = 30
    let dailyDouble=null;
    boxes[i+12].addEventListener("click",()=>{
      let box = boxes[i+12]
      if(boxes.indexOf(box)==rand)
      {
        dailyDouble=parseInt(prompt("WELCOME TO THE DAILY DOUBLE\nThe Category::"+clue.title.toUpperCase()+"\nHow Much Would You Like To Wager?"))
        while( isNaN(dailyDouble) || dailyDouble<5 || (dailyDouble>1000 && score<1000) )
        {
          dailyDouble=parseInt(prompt("Please bet up to either "+score+" or $1000 and a min of $5"))
        }
         }
        let check = cl.answer.toLowerCase()

        console.log(cl.answer)
        let answer=prompt(""+clue.title.toUpperCase()+"\n"+cl.question + "\n\n What is ______?")
        if(answer==null||timer==-1){
          if(dailyDouble==null){
            console.log("No Points")}
            else
            {
              score-=dailyDouble
          if(score<0)
          {
            score =0
          }

            }
          }
        else{
        answer = answer.toLowerCase()
        
        if(answer==check)
        {
          score += (dailyDouble==null)?400:dailyDouble
          console.log("you currently have $",score)
        }
      
    }
        box.innerHTML=""

    },{once:true})
    }
    if(boxes[i+18].innerHTML<100&&(cl.value==600 || (cl.value==300 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
    boxes[i+18].innerHTML=600
    let dailyDouble=null;
    let timer=30
    boxes[i+18].addEventListener("click",()=>{
      let box = boxes[i+18]
      if(boxes.indexOf(box)==rand)
      {
        dailyDouble=parseInt(prompt("WELCOME TO THE DAILY DOUBLE\nThe Category::\n"+clue.title.toUpperCase()+"\nHow Much Would You Like To Wager?"))
        while( isNaN(dailyDouble) || dailyDouble<5 || (dailyDouble>1000 && score<1000) )
        {
          dailyDouble=parseInt(prompt("Please bet up to either "+score+" or $1000 and a min of $5"))
        }
         }
      let timer = 30
      let check = cl.answer.toLowerCase()
      console.log(check)
        let answer=prompt(""+clue.title.toUpperCase()+"\n"+cl.question + "\n\n\n What is ______?")
        if(answer==null||timer==-1){
          
          if(dailyDouble==null){
            console.log("No Points")}
            else
            {
              score-=dailyDouble
              if(score<0)
              {
                score =0
              }
            }
          }
        else
        {
          answer = answer.toLowerCase()
          if(answer==check)
          {
            score += (dailyDouble==null)?600:dailyDouble
            console.log("you currently have $",score)
          }
      }
    
      box.innerHTML=""

    },{once:true})
    } 
    if(boxes[i+24].innerHTML<100&&(cl.value==800 || (cl.value==400 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
    boxes[i+24].innerHTML=800
    let timer = 30
    let dailyDouble=null;
    boxes[i+24].addEventListener("click",()=>{
    
      let box = boxes[i+24]
      if(boxes.indexOf(box)==rand)
      {
        dailyDouble=parseInt(prompt(" WELCOME TO THE DAILY DOUBLE\nThe Category::"+clue.title.toUpperCase()+"\nHow Much Would You Like To Wager?"))
        while( isNaN(dailyDouble) || dailyDouble<5 || (dailyDouble>1000 && score<1000) )
        {
          dailyDouble=parseInt(prompt("Please bet up to either "+score+" or $1000 and a min of $5"))
        }
         }  
      let check = cl.answer.toLowerCase()
      console.log(check)
        let answer=prompt(""+clue.title.toUpperCase()+"\n"+cl.question + "\n\n\n What is ______?")
        if(answer==null||timer==-1){
          if(dailyDouble==null){
            console.log("No Points")}
            else
            {
              score-=dailyDouble
          if(score<0)
          {
            score =0
          }

            }}
        else
        {
        answer = answer.toLowerCase()
        if(answer==check)
        {
          score += (dailyDouble==null)?800:dailyDouble
          console.log("you currently have $",score)
        }
      }
    
        box.innerHTML=""

    },{once:true})
    }
    
    if(boxes[i+30].innerHTML<100&&(cl.value==1000 || (cl.value==500 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
    boxes[i+30].innerHTML=1000
    let timer = 30
    let dailyDouble=null;
    boxes[i+30].addEventListener("click",()=>{
    
    let box=boxes[i+30]
    if(boxes.indexOf(box)==rand)
    {
      dailyDouble=parseInt(prompt("WELCOME TO THE DAILY DOUBLE\n The Category::"+clue.title.toUpperCase()+"\nHow Much Would You Like To Wager?"))
      while( isNaN(dailyDouble) || dailyDouble<5 || (dailyDouble>1000 && score<1000) )
      {
        dailyDouble=parseInt(prompt("Please bet up to either "+score+" or $1000 and a min of $5"))
      }
       }
    let check = cl.answer.toLowerCase()

    console.log(cl.answer)
    let answer=prompt(clue.title.toUpperCase()+"\n"+cl.question + "\n\n\n What is ______?")
          
    if(answer==null||timer==-1){
      if(dailyDouble==null){
        console.log("No Points")}
        else
        {
          score-=dailyDouble
          if(score<0)
          {
            score =0
          }

        }}
        else
        {
    answer = answer.toLowerCase()
    if(answer==check)
    {
          score += (dailyDouble==null)?1000:dailyDouble
          console.log("you currently have $",score)
    }
        }
      

    box.innerHTML=""

    

    },{once:true})
   
    }
   
  

    })


  
  } 
}


// const myCat=getcategories()

// console.log(myCat)



// // Initializes the game
// async function init(){

//  }

// // main script
// init()
