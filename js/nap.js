//Initial Fetch of 100 Categrories
categories = getData();

categories.then(async (data) => {
  //Array of Correct Filtered Categories that meet our criteria
  let filteredcat = [];
  let boxes = [];
  let dailyDouble = generateRandomNumber(6, 35);
  console.log(dailyDouble);
  console.log("This is the daily double index");
  //Grab six categories with all the correct cost values and place into filteredcat[]
  for (let i = 0; i < 6; i++) {
    //Checking that each category has questions with
    //costs from 200-1000 in increments of 200
    let numb = getRandomInt(data.length);
    await fetch(
      `http://jservice.io/api/category?id=${data.splice(numb, 1)[0].id}`
    )
      .then((req) => req.json())
      .then((category) => {
        let result = isCorrect(category);
        if (!result) {
          i--;
        } else {
          filteredcat.push(category);
        }
      });
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
    box.setAttribute("class", "box");

    box.innerHTML = ("" + box.id).replace("box", "");
    boxes.push(box);
    container.appendChild(box);
  }

  //Populate Cells with Category and Clue Data
  filteredcat.map((category, index) => {
    boxes[index].innerHTML = category.title.toUpperCase();
    let incr = index + 6;
    //Since we know that we have all the values in the category, we for loop for each value and get the clue
    for (let cost = 200; cost < 1001; cost += 200) 
    {
      let gclue = getClue(cost, category.clues);
      boxes[incr].innerHTML = gclue.value;
      if (incr == dailyDouble)
      {
        boxes[incr].setAttribute("id", "dd");
        boxes[incr].innerHTML="DAILY DOUBLE";
        dailyDoublePrompt();

      }

        prompt(boxes[incr], gclue)
      
      //increment
      incr += 6;
    }
  });


});

//Functions

function getClue(cost, clues) {
  return clues.filter((clue) => {
    return clue.value == cost;
  })[0];
}

async function getData() {
  return await fetch("http://jservice.io/api/categories?count=100")
    .then((req) => req.json())
    .then((data) => {
      return data;
    });
}

async function getQuestion(clue) {
  return await fetch(`http://jservice.io/api/category?id=${clue.id}`)
    .then((req) => req.json())
    .then((questions) => console.log(questions));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function isCorrect(category) {
  const set = new Set();
  category.clues.map((clue, indx) => {
    set.add(clue.value);
  });

  if (
    set.has(200) &&
    set.has(400) &&
    set.has(600) &&
    set.has(800) &&
    set.has(1000)
  ) {
    return true;
  } else {
    return false;
  }
}

function getScore() {
  let scoreboard = document.getElementById("score");
  console.log(scoreboard.innerText);
  return parseInt(scoreboard.innerText.substring(1));
}

// function prompt(clue) {
//   console.clear();
//   //Take the body and Store it in a temp variable
//   console.log(clue);
//   let scoreboard = document.getElementById("score");
//   let score = getScore();
//   let body = document.getElementsByTagName("body")[0];
// let game = document.getElementsByClassName("game")[0];
// game.style.display = "none";
//   let counter = 0;
//   let container = document.createElement("div");
//   container.className = "container";
//   let box = document.createElement("div");
//   box.id = "question";
//   box.className = "box";
//   let timer = document.createElement("h1");
//   timer.className = "timer";
//   timer.innerText = 0;

//   let prompt = document.createElement("h2");
//   prompt.innerText = clue.question;
//   box.appendChild(prompt);
//   let answer = document.createElement("textarea");
//   //Set Up The Timer
//   let time = setInterval(() => {
//     if (counter == 30) {
//       body.removeChild(container);
//       body.removeChild(timer);
//       clearInterval(time);
//       game.style.display = "block";
//     }
//     counter++;
//     timer.innerText = counter;
//   }, 1000);
//   answer.addEventListener("keypress", (e) => {
//     if (e.key === "Enter") {
//       body.removeChild(container);
//       body.removeChild(timer);
//       let fanswer=clue.answer.replace(/(<([^>]+)>)/gi, "").toLowerCase();
//       console.log(fanswer);

//       game.style.display = "block";
//       clearInterval(time);
//       if (
//         answer.value.toLowerCase() ==
//         `${fanswer}`
//       ) {
//         score += clue.value;
//       } else {
//         score -= clue.value;
//         //Implement code beneath for the weak
//         // score = score < 0 ? 0 : score;
//       }
//       scoreboard.innerText = "$" + score;
//     }
//   });
//   answer.id = "answer";

//   // container.appendChild(timer)
//   body.append(timer);
//   container.appendChild(box);
//   container.appendChild(answer);
//   body.appendChild(container);
//   answer.focus();
// }


// function prompt(box, clue) {
//       let score = getScore();
//       let scoreboard = document.getElementById("score");
//       let game = document.getElementsByClassName("game")[0];
//       let prompt = document.createElement("div");
//       let question = document.createElement("h2");
//       let answer = document.createElement("textarea");
//       let timer = document.createElement("h1");
//       let counter = 0;
//       timer.innerText=counter;
//   box.addEventListener("click", function clicked(e) {
   
//     e.target.innerText = "";
//     e.target.setAttribute("class","stage")
//     e.target.removeEventListener("click", clicked);
//     let stagedemo = document.getElementsByClassName("stagedemo")[0];
//     e.target.style.animation = "grow 0.5s 1 ";
//     e.target.removeEventListener('click', () => {});
//     //After the animation
//     e.target.addEventListener('animationend', () => {
//       //remove animation from e.target
//       e.target.style.animation = "";
//       //remove on click event from target
     
//       // stagedemo.style.display = "none";
//       // prompt.setAttribute("class", "box");
//       // answer.setAttribute("id", "answer");
//       // question.innerText = clue.question;
//       // prompt.style.height=stagedemo.style.height;
//       // prompt.style.width=stagedemo.style.width;
//       // timer.innertext=0;
//       // prompt.appendChild(question);
//       // game.appendChild(timer);
//       // game.appendChild(prompt);
//       // game.appendChild(answer);
      
//       let time = setInterval(() => {
//             if (counter == 30) 
//             {
//               prompt.removeChild(question);
//               game.removeChild(answer);
//               game.removeChild(timer);
//               game.removeChild(prompt);

//               clearInterval(time);
//               stagedemo.style.display = "block";
//             }
//             counter++;
//             timer.innerText = counter;
//           }, 1000);

// answer.addEventListener("keypress", function clicked(e) {
//  //wait for enter keypress
//  e.target.innertext="";
//   if (e.key === "Enter") {
//         prompt.removeChild(question);
//         game.removeChild(answer);
//         game.removeChild(timer);
//         game.removeChild(prompt);
//     let fanswer=clue.answer.replace(/(<([^>]+)>)/gi, "").toLowerCase();
//     console.log(fanswer);
//     stagedemo.style.display = "block";
//     clearInterval(time);
//     if (
//       answer.value.toLowerCase() ==
//       `${fanswer}`
//     ) {
//       score += clue.value;
//     } else {
//       score -= clue.value;
//       //Implement code beneath for the weak
//       // score = score < 0 ? 0 : score;
//     }
//     scoreboard.innerText = "$" + score;
//   }
// });
     
//     });
   
    
//     //Make Box full screen
//     e.target.style.selfAlign = "center";
//   });
// }


function prompt(box, clue) 
{
 
 if(box.id=="dd"){return}
  let stagedemo=document.getElementsByClassName("stagedemo")[0];
  //grab the scoreboard
  let scoreboard = document.getElementById("score");

  box.addEventListener("click", function clicked(e) {

    let score = getScore();
    //hide all the children nodes from the stage
    

    e.target.removeEventListener("click", clicked);
    e.target.innerText = "";
    console.log(clue.answer)
  //get the stage element
    let stage = document.getElementsByClassName("stage")[0];

  //make a copy of element node to be used for animation
    let cell = e.target.cloneNode(true);
    cell.zIndex = "3";
    cell.innerText=""
    cell.setAttribute("class","animation");
    stage.style.display = "none";
    cell.style.animation = "grow 0.5s normal";
 
    stagedemo.appendChild(cell);

    
    //create a h2 header for the prompt
    let prmpt = document.createElement("h2");
    prmpt.innerText = clue.question;
    //create a textarea for the answer
    let answer = document.createElement("textarea");
    //set class of textarea to answer
    answer.setAttribute("id", "answer");
    //create a h1 for the timer
    let timer = document.createElement("h1");
    let counter = 0;
    timer.innerText=counter;
    //create a div for the prompt
    let prompt = document.createElement("div");
    //set cell class to prompt
    //Add prmpt answer and timer to prompt
      prompt.appendChild(timer);
      prompt.appendChild(prmpt);
      prompt.appendChild(answer);
      cell.appendChild(prompt);

    //set the interval for the timer
      let time = setInterval(() => {
            if (counter == 30) 
            {
              stagedemo.removeChild(cell);
              stage.style.display = "grid";
              clearInterval(time);
            }
            counter++;
            timer.innerText = counter;
          }, 1000);
  

    answer.addEventListener("keypress", (e) => {
          if (e.key === "Enter") 
          {
            stage.style.display = "grid";
            stagedemo.removeChild(cell);
            cell.removeChild(prompt);
            //set animation direction for cell in reverse
            cell.style.animation = "grow 0.5s reverse";
            //trigger the animation of cell
            let fanswer=clue.answer.replace(/(<([^>]+)>)/gi, "").toLowerCase();
            clearInterval(time);
            if (answer.value.toLowerCase() == `${fanswer}`) {
              score = score + clue.value;
            } 
            else {
              score = score - clue.value;
            }
            scoreboard.innerText = "$" + score;

          }
        });

   

 



 
    

  });

}


function generateRandomNumber(max, min) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dailyDoublePrompt(box,clue) {
  let score = getScore();
  
}

function removeRegex(string) {
  return string.replace(/[^a-zA-Z0-9 ]/g, "");
}
