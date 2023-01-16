/**
 *
 * Picks random index to choose rain winners
 *
 *  @param {number} amountOfWinner The amount of winners this rain will have
 *  @param {number} amountOfUsers The amount of users in the server
 * @returns {string} Returns the seed

 *
 */
export function rainWinners(amountOfWinner: number, amountOfUsers: number): Array<number> {
  let numbers = [];
  let min = 1;
  let max = amountOfUsers;

  let n;
  let p;
  for (let i = 0; i < amountOfWinner; i++) {
    do {
      n = Math.floor(Math.random() * (max - min + 1)) + min;
      p = numbers.includes(n);
      if (!p) {
        numbers.push(n);
      }
    } while (p);
  }
  return numbers;
}
