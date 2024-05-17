// bookServiceMicroservice.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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

// Implémenter le service de livres
const bookService = {
  getBook: (call, callback) => {
    // Simuler la récupération des détails du livre à partir de la base de données
    const book = {
      id: call.request.book_id,
      title: 'Exemple de livre',
      description: 'Ceci est un exemple de livre.',
      // Ajouter d'autres champs de données pour le livre au besoin
    };
    callback(null, { book });
  },
  searchBooks: (call, callback) => {
    const { query } = call.request;
    // Simuler une recherche de livres en fonction de la requête
    const books = [
      {
        id: '1',
        title: 'Exemple de livre 1',
        description: 'Ceci est le premier exemple de livre.',
      },
      {
        id: '2',
        title: 'Exemple de livre 2',
        description: 'Ceci est le deuxième exemple de livre.',
      },
      // Ajouter d'autres résultats de recherche de livres au besoin
    ];
    callback(null, { books });
  },
  // Ajouter d'autres méthodes au besoin
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(bookProto.BookService.service, bookService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Échec de la liaison du serveur:', err);
    return;
  }
  console.log(`Le serveur s'exécute sur le port ${port}`);
  server.start();
});
console.log(`Microservice de livres en cours d'exécution sur le port ${port}`);
// Dans bookServiceMicroservice.js
// Implémenter la logique pour la création de livres en fonction de la demande reçue
// Exemple :
function createBook(call, callback) {
  const bookData = call.request;
  // Logique pour créer un livre dans la base de données ou un autre système de stockage
  const createdBook = {
      id: '123',
      title: bookData.title,
      description: bookData.description,
      // Autres champs si nécessaires
  };
  callback(null, { book: createdBook });
}
