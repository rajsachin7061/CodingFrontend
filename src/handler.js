
const requestHandler = (req, res)=> {
  console.log(req.url, req.method);

if(req.url === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.write(`
      <html>
        <head><title>practice Set </title></head>
        <body>
          <h1>Welcome to calculator</h1>
          <a href = "/profile"> Go to Calculator</a>
        </body>
      </html>
      `);
    }
  }
  export default requestHandler; 