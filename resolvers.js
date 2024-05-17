// resolvers.js
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

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
  Query: {
    book: (_, { id }) => {
      // Effectuer un appel gRPC au microservice de livres
      const client = new bookProto.BookService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getBook({ book_id: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.book);
          }
        });
      });
    },
    books: () => {
      // Effectuer un appel gRPC au microservice de livres
      const client = new bookProto.BookService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.searchBooks({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.books);
          }
        });
      });
    },
  },
  

};


module.exports = resolvers;
