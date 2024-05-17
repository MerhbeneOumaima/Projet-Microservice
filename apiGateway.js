const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const bodyParser = require('body-parser');
const cors = require('cors');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Charger le fichier book.proto
const bookProtoPath = 'book.proto';
const bookProtoDefinition = protoLoader.loadSync(bookProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookProto = grpc.loadPackageDefinition(bookProtoDefinition).book;

// Créer une nouvelle application Express
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });

// Démarrer le serveur Apollo avant d'appliquer le middleware
async function startServer() {
  try {
    await server.start();
    server.applyMiddleware({ app });

    // Définir les routes pour les requêtes REST
    const client = new bookProto.BookService('localhost:50051', grpc.credentials.createInsecure());

    // Route pour récupérer tous les livres
    app.get('/books', (req, res) => {
      client.searchBooks({}, (err, response) => {
        if (err) {
          console.error('Erreur lors de la recherche de livres :', err);
          res.status(500).send('Erreur lors de la recherche de livres');
        } else {
          res.json(response.books);
        }
      });
    });

    // Route pour récupérer un livre par son ID
    app.get('/books/:id', (req, res) => {
      const id = req.params.id;
      client.getBook({ book_id: id }, (err, response) => {
        if (err) {
          console.error('Erreur lors de la récupération du livre :', err);
          res.status(500).send('Erreur lors de la récupération du livre');
        } else {
          res.json(response.book);
        }
      });
    });

    // Endpoint pour la création d'un livre
    app.post('/books', (req, res) => {
      const { title, description } = req.body;
      // Assurer la consistance du port gRPC
      client.CreateBook({ title, description }, (err, response) => {
        if (err) {
          console.error('Erreur lors de la création du livre :', err);
          res.status(500).send('Erreur lors de la création du livre');
        } else {
          res.status(201).json({ message: 'Livre ajouté avec succès', book: response.book });
        }
      });
    });

    // Démarrer l'application Express
    const port = 3000;
    app.listen(port, () => {
      console.log(`API Gateway en cours d'exécution sur le port ${port}`);
    });
  } catch (err) {
    console.error('Erreur de démarrage du serveur Apollo:', err);
  }
}

startServer();
