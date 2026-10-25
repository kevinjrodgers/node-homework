const taskCounter = (() => {
  let laskTaskNumber = 0;
  return () => {
    lastTaskNumber = lastTaskNumber + 1;
    return lastTaskNumber;
  }
})();