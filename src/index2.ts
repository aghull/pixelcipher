import promptSync from 'prompt-sync'

import wordList from "../data/wordle.json" with { type: "json" }

const prompt = promptSync()

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const splice = (string: string, n: number, l: string) => (
  string.substring(0, n) + l + string.substring(n + 1)
)

const answer = getRandomElement(wordList)
let lower = "     "
let upper = "     "
let filled = "▢▢▢▢▢"
let guesses = 0

while (true) {
  console.log(lower)
  console.log(filled.toUpperCase())
  console.log(upper)
  console.log()
  console.log()
  guesses++

  const guess = prompt('guess word: ')
  if (guess) {
    if (!wordList.includes(guess)) {
      console.log("not a word")
      continue
    }
    guess.split('').forEach((l, n) => {
      if (answer[n] === l) {
        filled = splice(filled, n, l)
        lower = splice(lower, n, ' ')
        upper = splice(upper, n, ' ')
      } else if (answer[n] < l && (upper[n] === ' ' || l < upper[n])) {
        upper = splice(upper, n, l)
      } else if (l < answer[n] && (lower[n] === ' ' || lower[n] < l)) {
        lower = splice(lower, n, l)
      }
    })
    if (filled === answer) {
      console.log(`Correct! ${guesses} guesses`)
      break
    }
  } else {
    console.log(`It was ${answer}`)
    break
  }
}
