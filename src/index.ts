import promptSync from 'prompt-sync'

import wordList from "../data/wordle.json" with { type: "json" }

const letters = {
  'a': 0b111_101_111_101_101,
  'b': 0b111_101_110_101_111,
  'c': 0b111_100_100_100_111,
  'd': 0b110_101_101_101_110,
  'e': 0b111_100_110_100_111,
  'f': 0b111_100_110_100_100,
  'g': 0b111_100_101_101_111,
  'h': 0b101_101_111_101_101,
  'i': 0b111_010_010_010_111,
  'j': 0b001_001_001_101_111,
  'k': 0b101_101_110_101_101,
  'l': 0b100_100_100_100_111,
  'm': 0b101_111_101_101_101,
  'n': 0b001_101_111_101_100,
  'o': 0b111_101_101_101_111,
  'p': 0b111_101_111_100_100,
  'q': 0b111_101_101_111_001,
  'r': 0b110_101_110_101_101,
  's': 0b111_100_111_001_111,
  't': 0b111_010_010_010_010,
  'u': 0b101_101_101_101_111,
  'v': 0b101_101_101_101_010,
  'w': 0b101_101_101_111_101,
  'x': 0b101_101_010_101_101,
  'y': 0b101_101_010_010_010,
  'z': 0b111_001_010_100_111,
}

const prompt = promptSync()

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const display = (letters: number[], c = ' ', guesses: number[] | undefined = undefined) => {
  [12, 9, 6, 3, 0].forEach(s => {
    let row = letters.map(l => (l >> s & 0b111 | 0b1000).toString(2).slice(1)).join('  ').replaceAll('1', '█').replaceAll('0', c)
    if (guesses) {
      guesses.map(g => (g >> s & 0b111 | 0b1000).toString(2).slice(1)).join('  ').split('').forEach((l, i) => {
        if (l === '1') {
          row = row.substring(0, i) + ' ' + row.substring(i + 1)
        }
      })
    }
    console.log(row)
  })
}

const possibleLetters = (s: number, x: number | undefined = undefined) => Object.entries(letters).filter(([l, b]) => (b & s) === s && (!x || (b & x) === 0)).map(l => l[0])

const possibleWords = (ss: number[], x: number[] | undefined = undefined) => {
  const re = new RegExp(ss.map((s, i) => '[' + possibleLetters(s, x?.[i]).join('') + ']').join(''))
  return wordList.filter(w => w.match(re))
}

// each filled bit in s as list of 2^n
const filledPixels = (s: number) => {
  let p: number[] = []
  for (let n = 1; n <= s; n <<= 1) {
    if (s & n) p.push(n)
  }
  return p
}



const answer = getRandomElement(wordList).split('') as (keyof typeof letters)[]

display(Object.values(letters))
console.log()
console.log()

let cipher = [0, 0, 0, 0, 0]
for (let i = 0; i !== 5; i++) {
  const l = Math.floor(Math.random() * 5)
  cipher[l] |= getRandomElement(filledPixels(cipher[l] ^ 0x7fff & letters[answer[l]]))
}

let possibilites = possibleWords(cipher).length
let tries = 30
while (tries && possibilites > 20) {
  tries--
  let guess = [...cipher]
  const l = Math.floor(Math.random() * 5)
  guess[l] |= getRandomElement(filledPixels(cipher[l] ^ 0x7fff & letters[answer[l]]))
  const newPossibilites = possibleWords(guess).length
  if (newPossibilites < 5) continue
  possibilites = newPossibilites
  cipher = guess
}

let guesses = [0, 0, 0, 0, 0]
while (true) {
  display(cipher, '▢', guesses)
  console.log(possibleWords(cipher, guesses).length, 'possibilites')
  const guess = prompt('guess word or "letter(1-5), row(1-5), col(1-3)": ')
  if (guess.match(/\d[ ,]+\d[ ,]+\d/)) {
    const [l, r, c] = guess.split(/[ ,]+/).map(n => parseInt(n, 10))
    const guessBit = 1 << (18 - (c + r * 3))
    if (filledPixels(letters[answer[l - 1]]).includes(guessBit)) {
      cipher[l - 1] |= guessBit
    } else {
      guesses[l - 1] |= guessBit
    }
  } else if (guess === 'p') {
    console.log(possibleWords(cipher, guesses))
  } else {
    console.log(answer.join(''), answer.join('') === guess ? '   Correct!' : '   Wrong!')
    break
  }
}
