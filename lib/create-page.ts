function createPage(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="./index.css" />
        <title>Igloo Checker</title>
      </head>
      <body class="p-4">
        ${content}
      </body>
    </html>
  `;
}

export { createPage };
