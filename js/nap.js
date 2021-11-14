//Initial Fetch of 100 Categrories
categories = getData();

    categories.then(async(data)=>
        {
            //Array of Correct Filtered Categories that meet our criteria
            let filteredcat = [];
            let boxes=[];
          
            //Grab six categories with all the correct cost values and place into filteredcat[]
           for (let i = 0; i < 6; i++) 
            {
                //Checking that each category has questions with 
                //costs from 200-1000 in increments of 200
                let numb = getRandomInt(data.length);
                await fetch(`http://jservice.io/api/category?id=${data.splice(numb, 1)[0].id}`)
                .then(req=>req.json())
                .then(category=>
                    {
                        let result = isCorrect(category);
                        if(!result)
                        {
                            i--;
                        }
                        else{
                            filteredcat.push(category)
                        }
                    })
            }

            //Grab the main stage
            let container = document.getElementsByClassName("stage")[0];
            
            //Create the Cells for Jeopardy
            for (let i = 0; i < 36; i++) {
                let box = document.createElement("div");
                if (i < 6) {
                  box.setAttribute("id", "cat");
                } else {
                  box.setAttribute("id", i - 6);
                  box.setAttribute("state", false);
                }
                box.setAttribute("class","box");
  
                box.innerHTML = ("" + box.id).replace("box", "");
                boxes.push(box);
                container.appendChild(box);
              }

            //Populate Cells with Category and Clue Data
            filteredcat.map((category,index)=>{
                boxes[index].innerHTML=category.title.toUpperCase()
                let incr=index+6;
                //Since we know that we have all the values in the category, we for loop for each value and get the clue
                for(let cost = 200;cost<1001;cost+=200)
                {
                    let gclue = getClue(cost,category.clues)
                    boxes[incr].innerHTML=gclue.value
                    boxes[incr].addEventListener("click",()=>{
                        prompt(gclue)
                    })
                   
                    // Set the on click prompt for the cell.

                    incr+=6;
                
                }

            })
            })
                        
                        
       
    








//Functions
function getClue(cost, clues)
{
     return clues.filter((clue)=>{
        return clue.value==cost
    })[0]
}
async function getData()
{
    return await fetch("http://jservice.io/api/categories?count=100")
      .then(req=>req.json())
      .then(data=>{return(data)})
}
async function getQuestion(clue)
{
    return await fetch(`http://jservice.io/api/category?id=${clue.id}`)
    .then(req=>req.json())
    .then(questions=>console.log(questions))
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
function isCorrect(category)
{
    const set = new Set()
    category.clues.map((clue,indx)=>
    {
            set.add(clue.value)

    })

    if(set.has(200)&&set.has(400)&&set.has(600)&&set.has(800)&&set.has(1000))
    {
        return true;
    }
    else{
        return false;
    }
   
}
function prompt(clue)
{
    console.clear();
    //Take the body and Store it in a temp variable
    console.log(clue)
    let question=document.getElementsByTagName('body')[0];
    let log = question.innerHTML;
    question.innerHTML=
    `
    <div class='container'>
        <div class='box' id='question'>
            <h2>${clue.question}</h2>
        </div>
        <textarea id='answer'></textarea>
    </div>
    
    `

    //Create new HTML for prompt and set it to the body
            //New Promp contains the question, a place to type the answer, a timer, and a submit button

    //Set the onclick of the box 
}