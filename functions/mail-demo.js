const emailBody = require('./mail');
let http = require('http');

let handleRequest = (request, response) => {
  response.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8'
  });
  response.write(emailBody.html);
  response.end();
};

http.createServer(handleRequest).listen(8080);


