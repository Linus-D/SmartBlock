const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 3001;

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/recommend/:userAddress', (req, res) => {
  const userAddress = req.params.userAddress;
  
  // Use the Python from our virtual environment
  const pythonExecutable = path.join(__dirname, 'venv', 'bin', 'python');
  const pythonScript = path.join(__dirname, 'recommend.py');
  
  const pythonProcess = spawn(pythonExecutable, [pythonScript, userAddress]);

  let dataToSend = '';
  pythonProcess.stdout.on('data', (data) => {
    dataToSend += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Error generating recommendations" });
    }
    
    try {
      const recommendations = JSON.parse(dataToSend);
      res.json(recommendations);
    } catch (error) {
      console.error("Error parsing Python output:", error);
      res.status(500).json({ error: "Error parsing recommendations" });
    }
  });
});

app.listen(port, () => {
  console.log(`Recommender API listening on http://localhost:${port}`);
});