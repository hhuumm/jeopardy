# Jeopardy!
This project is a modified single-player game of Jeopardy

Clues and Categories provided by [Jservice](http://jservice.io/) 

# Wire Frame
![Alt text, photo didn't load](https://i.imgur.com/BavgnVX.png)

# Screen-Shots
![Alt text,Cover](https://i.imgur.com/Bs6G6YE.png)
![Alt text,Board](https://i.imgur.com/TfwlU0Y.png)
![Alt text,Custom Prompt](https://i.imgur.com/uIziwcf.png)

# Link 
[Jeopardy!](https://j3op4rdy.surge.sh)

# How it plays
Any click in the title screen prompts the gamae.
Contestant clicks any tile, and is prompted a question, once the 
prompt is answered we check and see if our contestant gets the 
money. If they get the money, their money increments, the box is 
then set to blank. 
Daily double decrements the total amount by the wager.
This repeats 30 times unitl the board is cleared

# Pseudo Code
    Variables
    ---
    .Score
    .Name
    .Categories
        -ID's
    .Clues
        -Questions
        -Answers
        -Value
    .Timer


    //We first get the categories were gonna use
    let categories = API Fetch for 6 categories
    let clues = array of 6 arrays
    let timer=0

    categories.forEach--> category-->clues.push category.clues

    Events
    ---
    for let i =0 i<6 i++
        boxes_i=categories_i
        boxes_i+6.onClick= prompt question/answer 200
        boxes_i+12.onClick= prompt question/answer 400
        boxes_i+18.onClick= prompt question/answer 600
        boxes_i+24.onClick= prompt question/answer 800
        boxes_i+30.onClick= prompt question/answer 1000
    -First Six boxes will hold the Categories
    -Remaining 30 boxes 
        -Start a timer on-click, and prompt the question
            -No answer in the given time || Wrong question = no 
            points
            -Correct answer will incremenet the score by the value

    formula for mapping clues to boxes is ::
                clueIndex = boxIndex -6


    Implementing the Daily Double:: 
        -generate a random number between 0-30 and if the 
        clue id matches that it's the daily double 
        -daily double takes in a value, this value has to be 
        minimum of 5 and max of 1000
            if the contestant loses this question their score is 
            reduced by that value,stopping at 0
            else the contestant gets that money
                -if the contestant has less than 1000 dollars than
                 they can wager up to 1000 dollars, if they have 
                 more they can cap at whatever they have and min
                 of 5$



# Future Implementation

*Getting the api calls to call other categories

*Adding sounds::thinking song, buzzer, intro,

*Styling the css of the prompt to match more of a full screen effect

