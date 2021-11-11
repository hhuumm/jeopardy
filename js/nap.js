//Initial Fetch of 100 Categrories
categories = getData();

    categories.then(async(data)=>
        {
            //Array of Correct Filtered Categories that meet our criteria
            let filteredcat = [];
            let boxes=[];
          
            //Grab six categories with all the correct cost values
           for (let i = 0; i < 6; i++) 
            {
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
           
            //Filtered Cat populated with 6 random categories
            //Weve checked that each category has questions with 
            //costs from 200-1000 in increments of 200

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
            
        
        })
                        
                        
       
    








//Functions
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