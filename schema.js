const { gql } = require('apollo-server-express');
// Définir le schéma GraphQL
const typeDefs = `
  type Book {
    id: String!
    title: String!
    description: String!
  }

  type Query {
    book(id: String!): Book
    books: [Book]
  }
  
`;


module.exports = typeDefs;
