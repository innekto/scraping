const heartPattern = (name) => {
  let output = '';

  for (let y = 15; y >= -15; y--) {
    let line = '';
    for (let x = -30; x < 30; x++) {
      let eq = Math.pow(x * 0.05, 2) + Math.pow(y * 0.1, 2) - 1;
      let cond =
        Math.pow(eq, 3) - Math.pow(x * 0.05, 2) * Math.pow(y * 0.1, 3) <= 0;

      if (cond) {
        let index = (((x - y) % name.length) + name.length) % name.length;
        line += `\x1b[31m${name[index]}\x1b[0m`; // Додаємо червоний колір
      } else {
        line += ' ';
      }
    }
    output += line + '\n';
  }
  console.log(output);
};

heartPattern('KoxaYou');
