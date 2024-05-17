const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Book = require('./models/bookModel'); // Assurez-vous que le chemin est correct
const { Kafka } = require('kafkajs');


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

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/bookDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
  // Configuration de Kafka
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'book-service-group' });

// Fonction pour envoyer un message Kafka
const sendMessage = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};

// Implémenter le service de livres
const bookService = {
  getBook: async (call, callback) => {
    try {
      const bookId = call.request.book_id;
      const book = await Book.findById(bookId).exec();
      if (!book) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Book not found' });
        return;
      }
      callback(null, { book });
    } catch (error) {
      console.error('Error getting book:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
  searchBooks: async (call, callback) => {
    try {
      const books = await Book.find({}).exec();
      callback(null, { books });
    } catch (error) {
      console.error('Error searching books:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
  createBook: async (call, callback) => {
    try {
      const { title, description } = call.request;
      const newBook = new Book({ title, description });
      const savedBook = await newBook.save();
      console.log('Book created successfully:', savedBook);
      callback(null, { message: 'Book created successfully' });
    } catch (error) {
      console.error('Error creating book:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(bookProto.BookService.service, bookService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`Server is running on port ${port}`);
  server.start();
});
