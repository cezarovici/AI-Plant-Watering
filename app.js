const express = require("express");
const net = require("net");
const app = express();
const port = 3000;
const { main, getGroqChatCompletion } = require('./server');

const expressLayouts = require("express-ejs-layouts");
app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.enable("trust proxy");

let outsideTemperature = 25; // Presupunem că avem o variabilă pentru temperatura de afară
let soilHumidity = 60; // Presupunem că avem o variabilă pentru umiditatea solului
let waterLevel = 80; // Presupunem că avem o variabilă pentru nivelul de apă



// Funcția pentru a obține datele de la serverul Pico
const sendPicoCommand = (command, callback) => {
  const client = new net.Socket();
  client.connect(80, "192.168.1.53", () => {
    client.write(`GET /${command} HTTP/1.1\r\nHost: 192.168.1.53\r\n\r\n`);
  });

  client.on("data", (data) => {
    client.destroy(); // Destroy the client after receiving the data
    if (callback) {
      callback(data.toString()); // Callback to send data to the HTTP response
    }
  });

  client.on("close", () => {
    // Handle socket close event if needed
  });
};

// Obțineți datele de la Pico la fiecare secundă
sendPicoCommand("data", (data) => {
  try {
    picoData = JSON.parse(data);
    console.log("Datele au fost actualizate:", picoData);
  } catch (e) {
    console.error("Datele primite nu sunt valide:", e);
  }
});


app.get('/', (req, res) => {
  sendPicoCommand('data', (data) => {
      let parsedData;
      try {
          parsedData = JSON.parse(data);
      } catch (e) {
          return res.render('index', { error: 'Datele primite nu sunt valide.' });
      }
      
      if (!parsedData) {
          return res.render('index', { error: 'Nu avem acces la date.' });
      }
      
      // Acum 'parsedData' ar trebui să fie un obiect cu 'temperatura' și 'stareLED'
            parsedData.outsideTemperature = outsideTemperature;
            parsedData.soilHumidity = soilHumidity;
            parsedData.waterLevel = waterLevel;
      // Construiește întrebarea către AI incluzând datele curente
      const userQuestion = "Ce părere ai despre datele curente? " + JSON.stringify(parsedData);

      // Trimiti datele catre functia AI pentru a obtine completarile
      getGroqChatCompletion(userQuestion).then((chatCompletion) => {
          // Extragi completarile de la AI
          const aiResponse = chatCompletion.choices[0]?.message?.content || "";
          
          // Randare pagina web cu datele și răspunsul AI
          res.render("index", {
              data: parsedData,
              ip: req.ip,
              outsideTemperature: outsideTemperature,
              soilHumidity: soilHumidity,
              waterLevel: waterLevel,
              aiResponse: aiResponse // Adauga raspunsul AI în obiectul de randare pentru pagina web
          });
      }).catch((error) => {
          console.error("Eroare la obtinerea completarilor de la AI:", error);
          res.render("index", { error: 'Eroare la obtinerea completarilor de la AI.' });
      });
  });
});

// Route to turn the LED on
app.get("/ledon", (req, res) => {
  sendPicoCommand("lighton", () => {
    res.redirect("/");
  });
});

// Route to turn the LED off
app.get("/ledoff", (req, res) => {
  sendPicoCommand("lightoff", () => {
    res.redirect("/");
  });
});

// Route to water the plant
app.get("/udaplanta", (req, res) => {
  sendPicoCommand("udaplanda", () => {
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
