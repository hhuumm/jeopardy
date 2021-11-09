

// Cached Element Reference
let body = document.body
let title = document.createElement('p')
let container = document.createElement('section');
let scoreBoard = document.createElement('p')
let podiumContainer=document.createElement('container')

//Styling

podiumContainer.style.display="grid"
podiumContainer.style.girdTemplateRows="25% 25% 50%"
podiumContainer.style.gridRow="3"
podiumContainer.style.gridColumn="3/5"
scoreBoard.innerHTML=0
scoreBoard.style.gridRow="2"
scoreBoard.style.justifySelf="bottom"
scoreBoard.style.alignSelf="center"
scoreBoard.style.backgroundColor="white"
scoreBoard.style.textAlign="center"
podiumContainer.appendChild(scoreBoard)
container.setAttribute('class','stage')
title.innerHTML="<strong>JEOPARDY!</strong>"
title.style.color="yellow"
title.style.gridRow="1"
title.style.gridColumn="3/5"
title.style.justifySelf="center"
title.style.alignSelf="center"

//Stores each individual square
let boxes= [];


container.style.backgroundImage='../images/tile.png'
container.style.justifySelf="left"
container.style.alignSelf="center"

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
    box.style.color="#ffbd33"
    box.style.alignContent="center"
    box.style.justifyContent="center"
    
    box.id=='cat'? box.style.fontSize='15px':box.style.fontSize='20px'
    box.innerHTML=(""+box.id).replace("box","")
    boxes.push(box)
    container.appendChild(box)

}

body.appendChild(title)
body.appendChild(container)
body.append(podiumContainer)


//Variables
let score = 0;
let rand = parseInt(((Math.random()*30)+6))
let categories=[]
let counter = 0;


//Calls
intro()
getcategories()


//Functions
function prext(promptText,cb)
{
  let ret=null;
  //Hiding the board 
  container.style.display="none"
  title.style.display="none"

  //Creating new elements for prompt
  let question = document.createElement("p")
  let button = document.createElement("button")
  let input = document.createElement("input")
  let timer = 30;
  let state = false
  
  
  //Styling
  question.innerHTML=promptText
  question.style.gridRow="1"
  question.style.gridColumn="3/5"
  question.style.textAlign="center"
  question.style.color="yellow"
  button.style.gridRow="4"
  button.style.gridColumn="3/5"
  button.height="50px"
  button.width="100px"
  button.style.textAlign="center"
  button.innerHTML="Submit"
  button.style.color="Black"
  button.style.fontSize="big"
  input.style.height="50%"
  scoreBoard.style.gridRow="1/2"
  
  input.style.gridRow="2"
  input.style.gridColumn="3/5"
  input.value="Answer Here"
  input.style.textAlign="center"
  input.addEventListener("focus",()=>{input.value=""})
  document.body.height=50%
  //ADding elements to body
  
  body.appendChild(question)
  body.appendChild(input)
  body.appendChild(button)
  //New button event for prompting the question
  button.addEventListener('click',()=>{
    console.log(input.value)
    
    clear()
   
    cb(input.value)
    
  })

  let time = setTimeout(()=>{
    clear()
    
    cb(input.value)
  },30000)

  
  
  
  //Clears the prompt of the newly added 
  function clear ()
  {    
    body.removeChild(button)
    body.removeChild(question)
    body.removeChild(input)
    title.style.display="flex" 
    container.style.display="grid"
    clearTimeout(time)
  }

}


async function getcategories()
{score = 0
  body.appendChild(container)

title.innerHTML="<strong>Jeopardy!</strong>"
body.append(podiumContainer)
scoreBoard.innerHTML=score
console.log("This is the random number::"+rand)
  const data = await( await fetch("http://jservice.io/api/categories?count=6")).json()

  //Fetches the categories
  const cluePromises = data.map(clue =>
    fetch(`http://jservice.io/api/category?id=${clue.id}`).then(req => req.json()))

  categories = await Promise.all(cluePromises)
  
  for(let i = 0;i<6;i++)
{
  let clue =categories[i]
    boxes[i].innerHTML=clue.title.toUpperCase()

    clue.clues.forEach(cl=>{
    
    if(boxes[i+6].innerHTML<100&&(cl.value==200 || (cl.value==100 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
      boxes[i+6].innerHTML=200
      let dailyDouble=null;
      
      boxes[i+6].addEventListener("click",()=>
      {
        console.log(cl.answer)
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
          
           //used to be let answer = prompt (clue.title.toUpperCase()+"\n"+cl.question)
           let answer
           (
           prext(clue.title.toUpperCase()+"\n<br>"+cl.question,(ans)=>{
              
            answer =ans
              
           console.log(answer)
         
           
            
            
           let check = cl.answer.toLowerCase()
         
           if(answer==null||timer==-1)
           {
             if(dailyDouble==null){}
             else
             {
               if(dailyDouble!=null)
               {score-=dailyDouble}
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
               
                score += (dailyDouble==null)?200:dailyDouble
               
             }
             else
             {
               if(dailyDouble!=null)
               {score-=dailyDouble}
              if(score<0)
               {
                score =0
               }
 
             }
           }
           scoreBoard.innerHTML="$"+score
           box.innerHTML=""
         counter++
         if(counter==30)
         {
           body.removeChild(container)
       
       title.innerHTML="<strong>GAME OVER</strong>"
       let restart = document.createElement("button")
       restart.innerHTML="Restart"
       restart.style.gridRow="2"
       restart.style.gridColumn="3/5"
       restart.addEventListener('click',()=>{
 
         getcategories()
         
         body.removeChild(restart)
       })
       body.appendChild(restart)
         }


           })
           )
           
          
         

        
       
      },{once:true})
    }











    if(boxes[i+12].innerHTML<100&&(cl.value==400 || (cl.value==200 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
      
    boxes[i+12].innerHTML=400
    let timer = 30
    let dailyDouble=null;
    boxes[i+12].addEventListener("click",()=>{
      console.log(cl.answer)
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

     
       let answer
        (
        prext(clue.title.toUpperCase()+"\n"+cl.question,(ans)=>{
           
         answer =ans
           
        console.log(answer)
      
        
         
         
        let check = cl.answer.toLowerCase()
      
        if(answer==null||timer==-1)
        {
          if(dailyDouble==null){}
          else
          {
            if(dailyDouble!=null)
            {score-=dailyDouble}
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
            
        score += (dailyDouble==null)?200:dailyDouble
            
          }
          else
          {
            if(dailyDouble!=null)
            {score-=dailyDouble}
           if(score<0)
            {
             score =0
            }

          }
        }
        scoreBoard.innerHTML="$"+score
        box.innerHTML=""
      counter++
      if(counter==30)
      {
        body.removeChild(container)
    
    title.innerHTML="<strong>GAME OVER</strong>"
    let restart = document.createElement("button")
    restart.innerHTML="Restart"
    restart.style.gridRow="2"
    restart.style.gridColumn="3/5"
    restart.addEventListener('click',()=>{

      getcategories()
      
      body.removeChild(restart)
    })
    body.appendChild(restart)
      }


        })
        )


    },{once:true})
    }



















    if(boxes[i+18].innerHTML<100&&(cl.value==600 || (cl.value==300 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
    boxes[i+18].innerHTML=600
    let dailyDouble=null;
    let timer=30
    boxes[i+18].addEventListener("click",()=>{
      console.log(cl.answer)
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

      let answer
      (
      prext(clue.title.toUpperCase()+"\n<br>"+cl.question,(ans)=>{
         
       answer =ans
         
      console.log(answer)
    
      
       
       
      let check = cl.answer.toLowerCase()
    
      if(answer==null||timer==-1)
      {
        if(dailyDouble==null){}
        else
        {
          if(dailyDouble!=null)
          {score-=dailyDouble}
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
          
      score += (dailyDouble==null)?200:dailyDouble
          
        }
        else
        {
          if(dailyDouble!=null)
          {score-=dailyDouble}
         if(score<0)
          {
           score =0
          }

        }
      }
      scoreBoard.innerHTML="$"+score
      box.innerHTML=""
    counter++
    if(counter==30)
    {
      body.removeChild(container)
  
  title.innerHTML="<strong>GAME OVER</strong>"
  let restart = document.createElement("button")
  restart.innerHTML="Restart"
  restart.style.gridRow="2"
  restart.style.gridColumn="3/5"
  restart.addEventListener('click',()=>{

    getcategories()
    
    body.removeChild(restart)
  })
  body.appendChild(restart)
    }


      })
      )

    },{once:true})
    } 




















    if(boxes[i+24].innerHTML<100&&(cl.value==800 || (cl.value==400 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
    boxes[i+24].innerHTML=800
    let timer = 30
    let dailyDouble=null;
    boxes[i+24].addEventListener("click",()=>{
      console.log(cl.answer)
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

      let answer
      (
      prext(clue.title.toUpperCase()+"\n<br>"+cl.question,(ans)=>{
         
       answer =ans
         
      console.log(answer)
    
      
       
       
      let check = cl.answer.toLowerCase()
    
      if(answer==null||timer==-1)
      {
        if(dailyDouble==null){}
        else
        {
          if(dailyDouble!=null)
          {score-=dailyDouble}
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
          
      score += (dailyDouble==null)?200:dailyDouble
          
        }
        else
        {
          if(dailyDouble!=null)
          {score-=dailyDouble}
         if(score<0)
          {
           score =0
          }

        }
      }
      scoreBoard.innerHTML="$"+score
      box.innerHTML=""
    counter++
    if(counter==30)
    {
      body.removeChild(container)
  
  title.innerHTML="<strong>GAME OVER</strong>"
  let restart = document.createElement("button")
  restart.innerHTML="Restart"
  restart.style.gridRow="2"
  restart.style.gridColumn="3/5"
  restart.addEventListener('click',()=>{

    getcategories()
    
    body.removeChild(restart)
  })
  body.appendChild(restart)
    }


      })
      )

    },{once:true})
    }
    




























    if(boxes[i+30].innerHTML<100&&(cl.value==1000 || (cl.value==500 && parseInt(cl.airdate.split('-')[0])<=2001 )))
    {
    boxes[i+30].innerHTML=1000
    let timer = 30
    let dailyDouble=null;
    boxes[i+30].addEventListener("click",()=>{
      console.log(cl.answer)
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



    let answer
    (
    prext(clue.title.toUpperCase()+"\n<br>"+cl.question,(ans)=>{
       
     answer =ans
       
    console.log(answer)
  
    
     
     
    let check = cl.answer.toLowerCase()
  
    if(answer==null||timer==-1)
    {
      if(dailyDouble==null){}
      else
      {
        if(dailyDouble!=null)
        {score-=dailyDouble}
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
        
    score += (dailyDouble==null)?200:dailyDouble
        
      }
      else
      {
        if(dailyDouble!=null)
        {score-=dailyDouble}
       if(score<0)
        {
         score =0
        }

      }
    }
    scoreBoard.innerHTML="$"+score
    box.innerHTML=""
  counter++
  if(counter==30)
  {
    body.removeChild(container)

title.innerHTML="<strong>GAME OVER</strong>"
let restart = document.createElement("button")
restart.innerHTML="Restart"
restart.style.gridRow="2"
restart.style.gridColumn="3/5"
restart.addEventListener('click',()=>{

  getcategories()
  
  body.removeChild(restart)
})
body.appendChild(restart)
  }


    })
    )

    

    },{once:true})
   
    }
   
  

    })


  
  } 
}


function intro(){

title.style.display="none"
podiumContainer.style.display="none"
scoreBoard.style.display="none"
container.style.display="none"
body.style.backgroundImage= "url(images/title.png)"
body.style.backgroundPosition="center"
body.style.backgroundRepeat="no-repeat"
let intro = new Audio("url(sounds/theme.mp3)")
body.addEventListener('click',()=>{

  title.style.display="flex"
  podiumContainer.style.display="grid"
  scoreBoard.style.display="grid"
  container.style.display="grid"
  body.style.backgroundImage=""


},{once:true})





}




