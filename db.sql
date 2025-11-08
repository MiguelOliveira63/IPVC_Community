db.createCollection("categorias_evento", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nome", "slug"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        nome: {
          bsonType: "string",
          description: "nome apresentado ao utilizador"
        },
        slug: {
          bsonType: "string",
          description: "identificador interno, ex.: musica, desporto"
        },
        descricao: {
          bsonType: ["string", "null"]
        },
        icone: {
          bsonType: ["string", "null"],
          description: "opcional: nome de icone ou emoji"
        },
        criado_em: {
          bsonType: "date"
        }
      }
    }
  }
})

db.createCollection("eventos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["titulo", "categoria_id", "inicio_em", "fim_em", "capa_imagem_id"],
      properties: {
        titulo: {
          bsonType: "string"
        },
        descricao: {
          bsonType: ["string", "null"]
        },
        categoria_id: {
          bsonType: "objectId",
          description: "ref categorias_evento._id"
        },
        inicio_em: {
          bsonType: "date",
          description: "timestamp (início)"
        },
        fim_em: {
          bsonType: "date",
          description: "timestamp (fim)"
        },
        local_id: {
          bsonType: "objectId",
          description: "ref locais._id"
        },
        organizador_id: {
          bsonType: "objectId",
          description: "ref organizadores._id"
        },
        lotacao: {
          bsonType: ["int", "null"]
        },
        preco: {
          bsonType: "int"
        },
        visibilidade: {
          bsonType: "string",
          enum: ["campus", "publico", "privado"],
          description: "default app: 'campus'"
        },
        estado: {
          bsonType: "string",
          enum: ["pendente", "aprovado", "cancelado", "recusado", "rascunho"],
          description: "default app: 'pendente'"
        },
        criado_por: {
          bsonType: "objectId",
          description: "ref utilizadores._id"
        },
        capa_imagem_id: {
          bsonType: "objectId",
          description: "ref imagens._id"
        },
        criado_em: {
          bsonType: "date"
        }
      }
    }
  }
})
db.eventos.createIndex({ categoria_id: 1 })
db.eventos.createIndex({ inicio_em: 1 })
db.eventos.createIndex({ visibilidade: 1 })
db.eventos.createIndex({ estado: 1 })