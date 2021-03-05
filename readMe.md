# Jeopardy!
This project is a modified single-player game of Jeopardy
Clues and Categories provided by [Jservice](http://jservice.io/) 

# Wire Frame
![Alt text, photo didn't load](https://i.imgur.com/BavgnVX.png)

# Screen-Shots
[GameBoard](https://i.imgur.com/ynntx1x.png)

[My Alex trebek](https://imgur.com/lDdVdhP)

[Podium Template](https://i.imgur.com/AjIeGCC.png)
# Fonts
[gyparody](https://www.fonts.com/font/typodermic/gyparody?QueryFontType=Web&src=GoogleWebFonts)
# How it plays
Contestant clicks the tile, is prompted a question, once the 
prompt is answered we check and see if our contestant gets the 
money. If they get the money, their money increments, the box is 
then set to blank. 

Since traditional Jeopardy runs 90 questions over 3 rounds for 3 
contestants, ideally each gets a shot at 30 questions, so we leave 
the single player board to 30.


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



